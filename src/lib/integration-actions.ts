"use server";

// Server side of the admin "Integracje" page: save, test and disconnect Resend and Discord.
// Every action checks the admin role; secrets never travel back to the browser.

import { revalidatePath, updateTag } from "next/cache";
import { clearIntegration, describeIntegration, getIntegration, hasAppSecret, saveIntegration, type IntegrationName } from "./server/integrations";
import { sendMail } from "./server/mail";
import { getSiteSettings, saveSiteSettings, SITE_SETTINGS_TAG } from "./server/site-settings";
import { getCurrentUser } from "./server/session";

export type ActionResult = { ok: boolean; message: string; details?: string[] };
export type FieldState = { value: string; source: "saved" | "env" | "none"; secret: boolean };
export type IntegrationState = Record<IntegrationName, Record<string, FieldState>>;

const NAMES: IntegrationName[] = ["resend", "discord"];

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") throw new Error("Brak uprawnień.");
  return user;
}

export async function loadIntegrations(): Promise<{ state: IntegrationState; secretReady: boolean; email: string; discordUrl: string }> {
  const user = await requireAdmin();
  const entries = await Promise.all(NAMES.map(async (n) => [n, await describeIntegration(n)] as const));
  const { discordUrl } = await getSiteSettings();
  return { state: Object.fromEntries(entries) as IntegrationState, secretReady: hasAppSecret(), email: user.email, discordUrl };
}

const INVITE = /^https:\/\/(?:discord\.gg|(?:www\.)?discord\.com\/invite)\/[A-Za-z0-9-]+\/?$/;

/** The Discord invite used by every Discord button on the site, including the pricing buttons. */
export async function saveDiscordLinkAction(form: FormData): Promise<ActionResult> {
  await requireAdmin();
  const discordUrl = str(form.get("discordUrl"));
  if (!INVITE.test(discordUrl)) return { ok: false, message: "Podaj link zaproszenia, np. https://discord.gg/abc123." };
  await saveSiteSettings({ ...(await getSiteSettings()), discordUrl });
  updateTag(SITE_SETTINGS_TAG);
  revalidatePath("/admin/integracje");
  return { ok: true, message: "Zapisano. Wszystkie przyciski Discorda na stronie prowadzą teraz pod nowy link." };
}

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

export async function saveIntegrationAction(name: IntegrationName, form: FormData): Promise<ActionResult> {
  await requireAdmin();
  if (!hasAppSecret()) return { ok: false, message: "Brak APP_SECRET na serwerze, więc klucza nie da się bezpiecznie zapisać." };

  if (name === "resend") {
    const apiKey = str(form.get("apiKey"));
    const from = str(form.get("from"));
    if (apiKey && !apiKey.startsWith("re_")) return { ok: false, message: "Klucz Resend zaczyna się od re_." };
    if (from && !/<?[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>?$/.test(from)) return { ok: false, message: "Nadawca musi zawierać adres e-mail, np. FraudGuard <no-reply@twojadomena.pl>." };
    await saveIntegration("resend", { apiKey, from });
  } else {
    const webhookUrl = str(form.get("webhookUrl"));
    if (webhookUrl && !/^https:\/\/(?:\w+\.)?discord(?:app)?\.com\/api\/webhooks\//.test(webhookUrl)) {
      return { ok: false, message: "To nie wygląda na adres webhooka Discorda." };
    }
    await saveIntegration("discord", { webhookUrl });
  }
  revalidatePath("/admin/integracje");
  return { ok: true, message: "Zapisano." };
}

export async function clearIntegrationAction(name: IntegrationName): Promise<ActionResult> {
  await requireAdmin();
  await clearIntegration(name);
  revalidatePath("/admin/integracje");
  return { ok: true, message: "Odłączono. Jeśli klucz jest też w zmiennych środowiskowych, będzie używany dalej." };
}

/** Checks the saved credentials against the real service, without changing anything there. */
export async function testIntegrationAction(name: IntegrationName): Promise<ActionResult> {
  await requireAdmin();
  try {
    if (name === "resend") {
      const { apiKey, from } = await getIntegration("resend");
      if (!apiKey) return { ok: false, message: "Najpierw podaj klucz API." };
      const res = await fetch("https://api.resend.com/domains", { headers: { Authorization: `Bearer ${apiKey}` }, cache: "no-store" });
      if (res.status === 401 || res.status === 403) return { ok: false, message: "Resend odrzucił klucz. Sprawdź, czy jest aktywny i ma uprawnienia do wysyłki." };
      if (!res.ok) return { ok: false, message: `Resend odpowiedział błędem ${res.status}.` };
      const { data } = (await res.json()) as { data: { name: string; status: string }[] };
      const fromDomain = (from.match(/@([^\s>]+)/)?.[1] ?? "").toLowerCase();
      const verified = data.filter((d) => d.status === "verified").map((d) => d.name.toLowerCase());
      const details = data.map((d) => `${d.name}: ${d.status === "verified" ? "zweryfikowana" : d.status}`);
      if (fromDomain && fromDomain !== "resend.dev" && !verified.includes(fromDomain)) {
        return { ok: false, message: `Klucz działa, ale domena nadawcy ${fromDomain} nie jest zweryfikowana w Resend.`, details };
      }
      return { ok: true, message: "Połączenie z Resend działa.", details };
    }

    const { webhookUrl } = await getIntegration("discord");
    if (!webhookUrl) return { ok: false, message: "Najpierw podaj adres webhooka." };
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "FraudGuard", content: "Połączenie z panelem FraudGuard działa." }),
    });
    if (!res.ok) return { ok: false, message: `Discord odrzucił wiadomość (${res.status}). Sprawdź adres webhooka.` };
    return { ok: true, message: "Wysłano wiadomość testową na kanał Discorda." };
  } catch {
    return { ok: false, message: "Nie udało się połączyć z usługą. Spróbuj ponownie za chwilę." };
  }
}

/** Sends a short email to the signed in admin, the surest check that verification emails arrive. */
export async function sendTestMailAction(): Promise<ActionResult> {
  const user = await requireAdmin();
  const { apiKey } = await getIntegration("resend");
  if (!apiKey) return { ok: false, message: "Najpierw podłącz Resend." };
  try {
    await sendMail({
      to: user.email,
      subject: "Test wysyłki z panelu FraudGuard",
      text: "Jeśli czytasz tę wiadomość, maile z kodami weryfikacyjnymi będą dochodzić.",
      html: "<p>Jeśli czytasz tę wiadomość, maile z kodami weryfikacyjnymi będą dochodzić.</p>",
    });
    return { ok: true, message: `Wysłano maila testowego na ${user.email}.` };
  } catch (e) {
    return { ok: false, message: "Resend nie przyjął wiadomości.", details: [e instanceof Error ? e.message.slice(0, 200) : String(e)] };
  }
}
