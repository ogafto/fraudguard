import "server-only";
import { coerceSettings, type AnticheatSettings } from "../anticheat";
import { db } from "./db";

const ms = (col: string) => `(extract(epoch from ${col}) * 1000)::float8`;

export type AccountLicense = {
  id: string;
  key: string;
  planName: string;
  billing: "monthly" | "lifetime";
  status: "active" | "suspended";
  expiresAt: number | null;
  createdAt: number;
  active: boolean;
};

export type AccountPurchase = { id: string; planName: string; billing: "monthly" | "lifetime"; amount: number; status: "paid" | "refunded"; createdAt: number };

export type Release = { id: string; version: string; notes: string; url: string; createdAt: number };

export async function listAccountLicenses(userId: string): Promise<AccountLicense[]> {
  return db<AccountLicense>(
    `select id, key, plan_name as "planName", billing, status,
            case when expires_at is null then null else ${ms("expires_at")} end as "expiresAt",
            ${ms("created_at")} as "createdAt",
            (status = 'active' and (expires_at is null or expires_at > now())) as active
       from licenses where user_id = $1
      order by active desc, created_at desc`,
    [userId],
  );
}

export async function listAccountPurchases(userId: string): Promise<AccountPurchase[]> {
  return db<AccountPurchase>(
    `select id, plan_name as "planName", billing, amount, status, ${ms("created_at")} as "createdAt"
       from purchases where user_id = $1 order by created_at desc`,
    [userId],
  );
}

export async function getAnticheatSettings(userId: string): Promise<AnticheatSettings> {
  const [row] = await db<{ data: unknown }>(`select data from anticheat_settings where user_id = $1`, [userId]);
  return coerceSettings(typeof row?.data === "string" ? JSON.parse(row.data) : row?.data);
}

export async function saveAnticheatSettings(userId: string, data: AnticheatSettings) {
  await db(
    `insert into anticheat_settings (user_id, data) values ($1, $2::jsonb)
     on conflict (user_id) do update set data = excluded.data, updated_at = now()`,
    [userId, JSON.stringify(data)],
  );
}

export async function listReleases(limit = 50): Promise<Release[]> {
  return db<Release>(`select id, version, notes, url, ${ms("created_at")} as "createdAt" from releases order by created_at desc limit $1`, [limit]);
}

export async function addRelease(input: { version: string; notes: string; url: string }) {
  await db(`insert into releases (id, version, notes, url) values ($1, $2, $3, $4)`, [crypto.randomUUID(), input.version, input.notes, input.url]);
}

export async function deleteRelease(id: string) {
  await db(`delete from releases where id = $1`, [id]);
}
