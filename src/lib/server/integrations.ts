import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { db } from "./db";

// Integrations are connected from the admin settings page and stored in the settings table,
// encrypted with AES-256-GCM using a key derived from APP_SECRET. Environment variables still
// work as a fallback, so a deploy can also be configured without the UI.

export type Integrations = {
  resend: { apiKey: string; from: string };
  stripe: { secretKey: string; webhookSecret: string };
  discord: { webhookUrl: string };
};
export type IntegrationName = keyof Integrations;

/** Fields that hold secrets: never sent back to the browser, only a masked hint. */
export const SECRET_FIELDS: Record<IntegrationName, string[]> = {
  resend: ["apiKey"],
  stripe: ["secretKey", "webhookSecret"],
  discord: ["webhookUrl"],
};

const ENV: { [K in IntegrationName]: Record<keyof Integrations[K], string> } = {
  resend: { apiKey: "RESEND_API_KEY", from: "EMAIL_FROM" },
  stripe: { secretKey: "STRIPE_SECRET_KEY", webhookSecret: "STRIPE_WEBHOOK_SECRET" },
  discord: { webhookUrl: "DISCORD_WEBHOOK_URL" },
};

export class MissingSecretError extends Error {
  constructor() {
    super("APP_SECRET is not set");
  }
}

function key() {
  const secret = process.env.APP_SECRET;
  if (!secret || secret.length < 16) throw new MissingSecretError();
  return createHash("sha256").update(`fraudguard-settings:${secret}`).digest();
}

export const hasAppSecret = () => (process.env.APP_SECRET?.length ?? 0) >= 16;

function encrypt(value: unknown) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), data.toString("base64url")].join(".");
}

function decrypt<T>(stored: string): T | null {
  try {
    const [v, iv, tag, data] = stored.split(".");
    if (v !== "v1") return null;
    const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return JSON.parse(Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8")) as T;
  } catch {
    return null;
  }
}

async function stored<K extends IntegrationName>(name: K): Promise<Partial<Integrations[K]>> {
  const [row] = await db<{ value: string }>(`select value from settings where key = $1`, [`integration:${name}`]);
  if (!row || !hasAppSecret()) return {};
  return decrypt<Partial<Integrations[K]>>(row.value) ?? {};
}

/** Saved values first, then environment variables. Empty strings when neither is set. */
export async function getIntegration<K extends IntegrationName>(name: K): Promise<Integrations[K]> {
  const saved = (await stored(name)) as Record<string, string | undefined>;
  const env = ENV[name] as Record<string, string>;
  const out: Record<string, string> = {};
  for (const field of Object.keys(env)) out[field] = (saved[field] || process.env[env[field]] || "").trim();
  return out as Integrations[K];
}

/** Where each value comes from, for the settings page. Secrets are masked. */
export async function describeIntegration(name: IntegrationName) {
  const saved = (await stored(name)) as Record<string, string | undefined>;
  const env = ENV[name] as Record<string, string>;
  const fields: Record<string, { value: string; source: "saved" | "env" | "none"; secret: boolean }> = {};
  for (const field of Object.keys(env)) {
    const secret = SECRET_FIELDS[name].includes(field);
    const raw = saved[field] || process.env[env[field]] || "";
    fields[field] = {
      value: secret ? mask(raw) : raw,
      source: saved[field] ? "saved" : process.env[env[field]] ? "env" : "none",
      secret,
    };
  }
  return fields;
}

const mask = (v: string) => (!v ? "" : v.length <= 10 ? "••••••" : `${v.slice(0, 6)}••••${v.slice(-4)}`);

/** Saves the fields; an empty secret field keeps the value saved before. */
export async function saveIntegration<K extends IntegrationName>(name: K, values: Partial<Integrations[K]>) {
  const current = (await stored(name)) as Record<string, string | undefined>;
  const next: Record<string, string> = {};
  for (const field of Object.keys(ENV[name])) {
    const v = ((values as Record<string, unknown>)[field] ?? "") as string;
    const keep = SECRET_FIELDS[name].includes(field) && !v.trim();
    const value = keep ? current[field] ?? "" : v.trim();
    if (value) next[field] = value;
  }
  await db(
    `insert into settings (key, value) values ($1, $2)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [`integration:${name}`, encrypt(next)],
  );
}

export async function clearIntegration(name: IntegrationName) {
  await db(`delete from settings where key = $1`, [`integration:${name}`]);
}
