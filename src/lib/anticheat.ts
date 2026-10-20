import { CHECK_CATEGORIES } from "./checks";

export type CheckAction = "flag" | "kick" | "ban";
export type CheckSetting = { enabled: boolean; sensitivity: 1 | 2 | 3; action: CheckAction; vl: number };
export type BanDuration = "1d" | "7d" | "30d" | "perm";

export type AnticheatSettings = {
  checks: Record<string, CheckSetting>;
  alerts: { inGame: boolean; permission: string; minVl: number; discordWebhook: string };
  punish: { kickMessage: string; banMessage: string; banDuration: BanDuration; broadcast: boolean };
  bypassPermission: string;
};

export const ACTION_LABEL: Record<CheckAction, string> = { flag: "Tylko alert", kick: "Kick", ban: "Ban" };
export const BAN_LABEL: Record<BanDuration, string> = { "1d": "1 dzień", "7d": "7 dni", "30d": "30 dni", perm: "Na zawsze" };

const ALL_CHECKS = CHECK_CATEGORIES.flatMap((c) => c.checks);

export function defaultSettings(): AnticheatSettings {
  return {
    checks: Object.fromEntries(
      ALL_CHECKS.map((c) => [c.name, { enabled: c.status === "stabilny", sensitivity: 2, action: c.status === "stabilny" ? "kick" : "flag", vl: 20 } satisfies CheckSetting]),
    ),
    alerts: { inGame: true, permission: "fraudguard.alerts", minVl: 5, discordWebhook: "" },
    punish: {
      kickMessage: "Zostałeś wyrzucony przez FraudGuard. Podejrzana aktywność: {check}.",
      banMessage: "Zostałeś zbanowany przez FraudGuard za {check}. Odwołanie na naszym Discordzie.",
      banDuration: "30d",
      broadcast: true,
    },
    bypassPermission: "fraudguard.bypass",
  };
}

const clampInt = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
const text = (v: unknown, max: number, fallback: string) => (typeof v === "string" ? v.slice(0, max) : fallback);

export function coerceSettings(input: unknown): AnticheatSettings {
  const base = defaultSettings();
  const src = (input && typeof input === "object" ? input : {}) as Partial<AnticheatSettings>;
  const checks = { ...base.checks };
  for (const name of Object.keys(checks)) {
    const c = (src.checks?.[name] ?? {}) as Partial<CheckSetting>;
    checks[name] = {
      enabled: typeof c.enabled === "boolean" ? c.enabled : checks[name].enabled,
      sensitivity: clampInt(c.sensitivity, 1, 3, checks[name].sensitivity) as 1 | 2 | 3,
      action: c.action === "flag" || c.action === "kick" || c.action === "ban" ? c.action : checks[name].action,
      vl: clampInt(c.vl, 1, 200, checks[name].vl),
    };
  }
  const a = (src.alerts ?? {}) as Partial<AnticheatSettings["alerts"]>;
  const p = (src.punish ?? {}) as Partial<AnticheatSettings["punish"]>;
  const webhook = text(a.discordWebhook, 300, "").trim();
  return {
    checks,
    alerts: {
      inGame: typeof a.inGame === "boolean" ? a.inGame : base.alerts.inGame,
      permission: text(a.permission, 80, base.alerts.permission).trim() || base.alerts.permission,
      minVl: clampInt(a.minVl, 1, 100, base.alerts.minVl),
      discordWebhook: /^https:\/\/(?:\w+\.)?discord(?:app)?\.com\/api\/webhooks\//.test(webhook) ? webhook : "",
    },
    punish: {
      kickMessage: text(p.kickMessage, 200, base.punish.kickMessage),
      banMessage: text(p.banMessage, 200, base.punish.banMessage),
      banDuration: p.banDuration && p.banDuration in BAN_LABEL ? p.banDuration : base.punish.banDuration,
      broadcast: typeof p.broadcast === "boolean" ? p.broadcast : base.punish.broadcast,
    },
    bypassPermission: text(src.bypassPermission, 80, base.bypassPermission).trim() || base.bypassPermission,
  };
}
