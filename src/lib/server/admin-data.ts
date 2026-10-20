import "server-only";
import { randomInt } from "node:crypto";
import { db } from "./db";

// Read models for the admin panel. Times come back as epoch milliseconds and money as grosze,
// so both drivers (Neon and PGlite) return plain numbers.

const ms = (col: string) => `(extract(epoch from ${col}) * 1000)::float8`;

export type AdminUser = {
  id: string;
  nick: string;
  email: string;
  role: string;
  verified: boolean;
  createdAt: number;
  activeLicenses: number;
  spent: number;
};

export async function listUsers(): Promise<AdminUser[]> {
  return db<AdminUser>(
    `select u.id, u.nick, u.email, u.role, u.email_verified_at is not null as verified, ${ms("u.created_at")} as "createdAt",
            (select count(*)::int from licenses l where l.user_id = u.id and l.status = 'active' and (l.expires_at is null or l.expires_at > now())) as "activeLicenses",
            coalesce((select sum(p.amount)::int from purchases p where p.user_id = u.id and p.status = 'paid'), 0) as spent
       from users u
      order by u.created_at desc
      limit 1000`,
  );
}

export type AdminPurchase = {
  id: string;
  nick: string;
  email: string;
  planId: string;
  planName: string;
  billing: "monthly" | "lifetime";
  amount: number;
  status: "paid" | "refunded";
  note: string | null;
  createdBy: string | null;
  createdAt: number;
  licenseKey: string | null;
};

export async function listPurchases(limit = 1000): Promise<AdminPurchase[]> {
  return db<AdminPurchase>(
    `select p.id, u.nick, u.email, p.plan_id as "planId", p.plan_name as "planName", p.billing, p.amount, p.status, p.note,
            p.created_by as "createdBy", ${ms("p.created_at")} as "createdAt",
            (select l.key from licenses l where l.purchase_id = p.id limit 1) as "licenseKey"
       from purchases p join users u on u.id = p.user_id
      order by p.created_at desc
      limit $1`,
    [limit],
  );
}

export type AdminLicense = {
  id: string;
  key: string;
  nick: string | null;
  email: string | null;
  planName: string;
  billing: "monthly" | "lifetime";
  status: "active" | "suspended";
  expired: boolean;
  expiresAt: number | null;
  createdAt: number;
};

export async function listLicenses(): Promise<AdminLicense[]> {
  return db<AdminLicense>(
    `select l.id, l.key, u.nick, u.email, l.plan_name as "planName", l.billing, l.status,
            (l.expires_at is not null and l.expires_at <= now()) as expired,
            case when l.expires_at is null then null else ${ms("l.expires_at")} end as "expiresAt",
            ${ms("l.created_at")} as "createdAt"
       from licenses l left join users u on u.id = l.user_id
      order by l.created_at desc
      limit 1000`,
  );
}

export type AdminOverview = {
  revenue30: number;
  revenuePrev30: number;
  activeLicenses: number;
  newLicenses30: number;
  users30: number;
  usersPrev30: number;
  usersTotal: number;
  months: { label: string; value: number }[];
  plans: { name: string; count: number }[];
  recentPurchases: AdminPurchase[];
  recentUsers: AdminUser[];
};

const MONTHS = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];

export async function getOverview(): Promise<AdminOverview> {
  const [[money], [lic], [people], months, plans, recentPurchases, recentUsers] = await Promise.all([
    db<{ r30: number; rp30: number }>(
      `select coalesce(sum(amount) filter (where created_at > now() - interval '30 days'), 0)::int as r30,
              coalesce(sum(amount) filter (where created_at <= now() - interval '30 days' and created_at > now() - interval '60 days'), 0)::int as rp30
         from purchases where status = 'paid'`,
    ),
    db<{ active: number; new30: number }>(
      `select count(*) filter (where status = 'active' and (expires_at is null or expires_at > now()))::int as active,
              count(*) filter (where created_at > now() - interval '30 days')::int as new30
         from licenses`,
    ),
    db<{ u30: number; up30: number; total: number }>(
      `select count(*) filter (where created_at > now() - interval '30 days')::int as u30,
              count(*) filter (where created_at <= now() - interval '30 days' and created_at > now() - interval '60 days')::int as up30,
              count(*)::int as total
         from users`,
    ),
    db<{ m: number; value: number }>(
      `select extract(month from g.m)::int as m, coalesce(sum(p.amount), 0)::int as value
         from generate_series(date_trunc('month', now()) - interval '11 months', date_trunc('month', now()), interval '1 month') as g(m)
         left join purchases p on p.status = 'paid' and date_trunc('month', p.created_at) = g.m
        group by g.m order by g.m`,
    ),
    db<{ name: string; count: number }>(
      `select plan_name as name, count(*)::int as count from licenses
        where status = 'active' and (expires_at is null or expires_at > now())
        group by plan_name order by count desc`,
    ),
    listPurchases(6),
    db<AdminUser>(
      `select id, nick, email, role, email_verified_at is not null as verified, ${ms("created_at")} as "createdAt", 0 as "activeLicenses", 0 as spent
         from users order by created_at desc limit 6`,
    ),
  ]);
  return {
    revenue30: money.r30,
    revenuePrev30: money.rp30,
    activeLicenses: lic.active,
    newLicenses30: lic.new30,
    users30: people.u30,
    usersPrev30: people.up30,
    usersTotal: people.total,
    months: months.map((x) => ({ label: MONTHS[x.m - 1], value: x.value })),
    plans,
    recentPurchases,
    recentUsers,
  };
}

/* ------------------------------------------------------------------ */
/* Writes                                                              */
/* ------------------------------------------------------------------ */

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const licenseKey = () =>
  "FG-" +
  Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join(""),
  ).join("-");

export async function findUserByEmail(email: string) {
  const [u] = await db<{ id: string; nick: string; email: string }>(`select id, nick, email from users where email = $1`, [email.trim().toLowerCase()]);
  return u;
}

type Plan = { id: string; name: string };

/** Creates a licence: monthly ones run for 30 days, lifetime ones never expire. */
export async function createLicense(userId: string | null, plan: Plan, billing: "monthly" | "lifetime", purchaseId: string | null) {
  const key = licenseKey();
  await db(
    `insert into licenses (id, key, user_id, purchase_id, plan_id, plan_name, billing, expires_at)
     values ($1, $2, $3, $4, $5, $6, $7, case when $7 = 'monthly' then now() + interval '30 days' else null end)`,
    [crypto.randomUUID(), key, userId, purchaseId, plan.id, plan.name, billing],
  );
  return key;
}

/**
 * Records a purchase paid on Discord. A monthly payment extends the user's active monthly licence
 * for the same plan by 30 days; otherwise a new licence is created.
 */
export async function recordPurchase(input: { userId: string; plan: Plan; billing: "monthly" | "lifetime"; amount: number; note: string; author: string }) {
  const id = crypto.randomUUID();
  await db(
    `insert into purchases (id, user_id, plan_id, plan_name, billing, amount, note, created_by) values ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, input.userId, input.plan.id, input.plan.name, input.billing, input.amount, input.note || null, input.author],
  );
  if (input.billing === "monthly") {
    const [extended] = await db<{ key: string }>(
      `update licenses set expires_at = greatest(coalesce(expires_at, now()), now()) + interval '30 days'
        where id = (select id from licenses where user_id = $1 and plan_id = $2 and billing = 'monthly' and status = 'active'
                     order by expires_at desc nulls last limit 1)
        returning key`,
      [input.userId, input.plan.id],
    );
    if (extended) return { purchaseId: id, licenseKey: extended.key, extended: true };
  }
  return { purchaseId: id, licenseKey: await createLicense(input.userId, input.plan, input.billing, id), extended: false };
}

export async function setPurchaseStatus(id: string, status: "paid" | "refunded") {
  await db(`update purchases set status = $2 where id = $1`, [id, status]);
  // A refund also suspends the licence bought with it.
  if (status === "refunded") await db(`update licenses set status = 'suspended' where purchase_id = $1`, [id]);
}

export async function setLicenseStatus(id: string, status: "active" | "suspended") {
  await db(`update licenses set status = $2 where id = $1`, [id, status]);
}

export async function extendLicense(id: string, days: number) {
  await db(
    `update licenses set expires_at = greatest(coalesce(expires_at, now()), now()) + make_interval(days => $2) where id = $1 and billing = 'monthly'`,
    [id, days],
  );
}
