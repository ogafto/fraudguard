import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { SITE } from "../site";
import { db } from "./db";

export type SiteSettings = { discordUrl: string };

export const SITE_SETTINGS_TAG = "site-settings";
const KEY = "site:settings";

const DEFAULTS: SiteSettings = { discordUrl: SITE.discordUrl };

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(SITE_SETTINGS_TAG);
  cacheLife("max");
  if (!process.env.DATABASE_URL && process.env.NEXT_PHASE === "phase-production-build") return DEFAULTS;
  try {
    const [row] = await db<{ value: string }>(`select value from settings where key = $1`, [KEY]);
    return { ...DEFAULTS, ...(row ? (JSON.parse(row.value) as Partial<SiteSettings>) : {}) };
  } catch {
    return DEFAULTS;
  }
}

export async function saveSiteSettings(next: SiteSettings) {
  await db(
    `insert into settings (key, value) values ($1, $2)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [KEY, JSON.stringify(next)],
  );
}
