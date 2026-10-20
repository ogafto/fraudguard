import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { SITE } from "../site";
import { db } from "./db";

// Public site settings edited in the admin panel (no secrets). Cached for every page and
// refreshed the moment an admin saves, through the "site-settings" tag.

export type SiteSettings = { discordUrl: string };

export const SITE_SETTINGS_TAG = "site-settings";
const KEY = "site:settings";

const DEFAULTS: SiteSettings = { discordUrl: SITE.discordUrl };

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(SITE_SETTINGS_TAG);
  cacheLife("max");
  // A local build must not open the embedded database the dev server already holds.
  if (!process.env.DATABASE_URL && process.env.NEXT_PHASE === "phase-production-build") return DEFAULTS;
  try {
    const [row] = await db<{ value: string }>(`select value from settings where key = $1`, [KEY]);
    return { ...DEFAULTS, ...(row ? (JSON.parse(row.value) as Partial<SiteSettings>) : {}) };
  } catch {
    // No database yet (for example during a first build): fall back to the defaults.
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
