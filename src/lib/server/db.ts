import "server-only";

type Row = Record<string, unknown>;
export type Query = <T extends Row = Row>(text: string, params?: unknown[]) => Promise<T[]>;

const SCHEMA = [
  `create table if not exists users (
    id text primary key,
    nick text not null,
    email text not null unique,
    password_hash text not null,
    role text not null default 'client',
    email_verified_at timestamptz,
    created_at timestamptz not null default now()
  )`,
  `create table if not exists email_tokens (
    user_id text not null references users(id) on delete cascade,
    purpose text not null,
    code_hash text,
    token_hash text not null unique,
    attempts int not null default 0,
    expires_at timestamptz not null,
    created_at timestamptz not null default now(),
    primary key (user_id, purpose)
  )`,
  `create table if not exists sessions (
    id text primary key,
    user_id text not null references users(id) on delete cascade,
    expires_at timestamptz not null,
    created_at timestamptz not null default now()
  )`,
  `create index if not exists sessions_user_id on sessions (user_id)`,
  `create table if not exists settings (
    key text primary key,
    value text not null,
    updated_at timestamptz not null default now()
  )`,
  `create table if not exists purchases (
    id text primary key,
    user_id text not null references users(id) on delete cascade,
    plan_id text not null,
    plan_name text not null,
    billing text not null,
    amount int not null,
    currency text not null default 'pln',
    status text not null default 'paid',
    note text,
    created_by text,
    created_at timestamptz not null default now()
  )`,
  `create index if not exists purchases_user_id on purchases (user_id)`,
  `create table if not exists licenses (
    id text primary key,
    key text not null unique,
    user_id text references users(id) on delete set null,
    purchase_id text references purchases(id) on delete set null,
    plan_id text not null,
    plan_name text not null,
    billing text not null,
    status text not null default 'active',
    expires_at timestamptz,
    created_at timestamptz not null default now()
  )`,
  `create index if not exists licenses_user_id on licenses (user_id)`,
  `create table if not exists content (
    key text primary key,
    published jsonb,
    draft jsonb,
    published_at timestamptz,
    updated_at timestamptz not null default now(),
    updated_by text
  )`,
  `create table if not exists content_versions (
    id text primary key,
    key text not null,
    data jsonb not null,
    author text,
    created_at timestamptz not null default now()
  )`,
  `create index if not exists content_versions_key on content_versions (key, created_at desc)`,
  `create table if not exists anticheat_settings (
    user_id text primary key references users(id) on delete cascade,
    data jsonb not null,
    updated_at timestamptz not null default now()
  )`,
  `alter table purchases add column if not exists note text`,
  `alter table purchases add column if not exists created_by text`,
  `alter table purchases add column if not exists currency text not null default 'pln'`,
  `alter table purchases alter column status set default 'paid'`,
  `alter table licenses add column if not exists purchase_id text references purchases(id) on delete set null`,
  `alter table licenses add column if not exists expires_at timestamptz`,
  `alter table users add column if not exists role text not null default 'client'`,
  `alter table users add column if not exists email_verified_at timestamptz`,
  `create table if not exists releases (
    id text primary key,
    version text not null,
    notes text not null default '',
    url text not null,
    created_at timestamptz not null default now()
  )`,
];

async function connect(): Promise<Query> {
  const url = process.env.DATABASE_URL;
  let query: Query;

  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(url);
    query = async <T extends Row>(text: string, params: unknown[] = []) => (await sql.query(text, params)) as T[];
  } else {
    if (process.env.VERCEL) throw new Error("DATABASE_URL is not set. Connect a Postgres database (e.g. Neon) in the Vercel project.");
    const { PGlite } = await import("@electric-sql/pglite");
    const { mkdir } = await import("node:fs/promises");
    const dir = process.env.PGLITE_DIR || ".data/pglite";
    await mkdir(dir.split("/").slice(0, -1).join("/") || ".", { recursive: true });
    const pg = new PGlite(dir);
    query = async <T extends Row>(text: string, params: unknown[] = []) => (await pg.query<T>(text, params)).rows;
  }

  for (const statement of SCHEMA) await query(statement);
  return query;
}

const store = globalThis as unknown as { __fgDb?: Promise<Query> };

export const db: Query = async (text, params) => {
  store.__fgDb ??= connect().catch((e) => {
    store.__fgDb = undefined;
    throw e;
  });
  return (await store.__fgDb)(text, params);
};
