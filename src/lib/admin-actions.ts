"use server";

// Server side of the admin panel: purchases, licences, accounts and the CMS.
// Every action checks the admin role itself; the page guard alone is not enough.

import { refresh } from "next/cache";
import { CONTENT_KEYS, type ContentKey, type ContentMap } from "./content";
import { extendLicense, findUserByEmail, createLicense, recordPurchase, setLicenseStatus, setPurchaseStatus } from "./server/admin-data";
import { discardDraft, getEditorState, getPublishedContent, listVersions, publish, restoreVersion, saveDraft } from "./server/content";
import { db } from "./server/db";
import { getCurrentUser } from "./server/session";

export type AdminResult = { ok: boolean; message: string; licenseKey?: string };

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") throw new Error("Brak uprawnień.");
  return user;
}

const isBilling = (b: unknown): b is "monthly" | "lifetime" => b === "monthly" || b === "lifetime";

async function findPlan(planId: string) {
  const pricing = await getPublishedContent("pricing");
  return pricing.plans.find((p) => p.id === planId);
}

/* ------------------------------------------------------------------ */
/* Purchases and licences                                              */
/* ------------------------------------------------------------------ */

export async function addPurchaseAction(input: { email: string; planId: string; billing: string; amount: string; note: string }): Promise<AdminResult> {
  const admin = await requireAdmin();
  const user = await findUserByEmail(String(input.email ?? ""));
  if (!user) return { ok: false, message: "Nie ma konta z takim adresem e-mail. Klient musi najpierw założyć konto." };
  const plan = await findPlan(String(input.planId ?? ""));
  if (!plan) return { ok: false, message: "Wybierz plan z cennika." };
  if (!isBilling(input.billing)) return { ok: false, message: "Wybierz okres: miesięcznie albo dożywotnio." };
  const zl = Number(String(input.amount ?? "").replace(",", ".").replace(/\s/g, ""));
  if (!Number.isFinite(zl) || zl < 0 || zl > 1_000_000) return { ok: false, message: "Podaj kwotę w złotych, np. 59 albo 59,99." };

  const res = await recordPurchase({
    userId: user.id,
    plan,
    billing: input.billing,
    amount: Math.round(zl * 100),
    note: String(input.note ?? "").slice(0, 500),
    author: admin.email,
  });
  refresh();
  return {
    ok: true,
    licenseKey: res.licenseKey,
    message: res.extended
      ? `Zakup zapisany. Licencja ${user.nick} przedłużona o 30 dni.`
      : `Zakup zapisany. Nowa licencja dla ${user.nick} jest gotowa.`,
  };
}

export async function setPurchaseStatusAction(id: string, status: string): Promise<AdminResult> {
  await requireAdmin();
  if (status !== "paid" && status !== "refunded") return { ok: false, message: "Nieznany status." };
  await setPurchaseStatus(String(id), status);
  refresh();
  return { ok: true, message: status === "refunded" ? "Oznaczono jako zwrot. Licencja z tego zakupu została wstrzymana." : "Oznaczono jako opłacony." };
}

export async function createLicenseAction(input: { email: string; planId: string; billing: string }): Promise<AdminResult> {
  await requireAdmin();
  const email = String(input.email ?? "").trim();
  const user = email ? await findUserByEmail(email) : null;
  if (email && !user) return { ok: false, message: "Nie ma konta z takim adresem e-mail. Zostaw pole puste, żeby utworzyć licencję bez właściciela." };
  const plan = await findPlan(String(input.planId ?? ""));
  if (!plan) return { ok: false, message: "Wybierz plan z cennika." };
  if (!isBilling(input.billing)) return { ok: false, message: "Wybierz okres." };
  const key = await createLicense(user?.id ?? null, plan, input.billing, null);
  refresh();
  return { ok: true, message: "Licencja utworzona.", licenseKey: key };
}

export async function setLicenseStatusAction(id: string, status: string): Promise<AdminResult> {
  await requireAdmin();
  if (status !== "active" && status !== "suspended") return { ok: false, message: "Nieznany status." };
  await setLicenseStatus(String(id), status);
  refresh();
  return { ok: true, message: status === "active" ? "Licencja aktywna." : "Licencja wstrzymana." };
}

export async function extendLicenseAction(id: string): Promise<AdminResult> {
  await requireAdmin();
  await extendLicense(String(id), 30);
  refresh();
  return { ok: true, message: "Licencja przedłużona o 30 dni." };
}

/* ------------------------------------------------------------------ */
/* Accounts                                                            */
/* ------------------------------------------------------------------ */

export async function setUserRoleAction(userId: string, role: string): Promise<AdminResult> {
  const admin = await requireAdmin();
  if (role !== "admin" && role !== "client") return { ok: false, message: "Nieznana rola." };
  if (userId === admin.id && role !== "admin") return { ok: false, message: "Nie możesz odebrać uprawnień samemu sobie." };
  await db(`update users set role = $2 where id = $1`, [String(userId), role]);
  refresh();
  return { ok: true, message: role === "admin" ? "Nadano uprawnienia administratora." : "Odebrano uprawnienia administratora." };
}

/* ------------------------------------------------------------------ */
/* CMS                                                                 */
/* ------------------------------------------------------------------ */

const isKey = (k: unknown): k is ContentKey => CONTENT_KEYS.includes(k as ContentKey);

export type ContentResult<K extends ContentKey> = { ok: boolean; message: string; data?: ContentMap[K] };

export async function saveDraftAction<K extends ContentKey>(key: K, data: unknown): Promise<ContentResult<K>> {
  const admin = await requireAdmin();
  if (!isKey(key)) return { ok: false, message: "Nieznany dokument." };
  const saved = await saveDraft(key, data, admin.email);
  return { ok: true, message: "Szkic zapisany. Na stronie nadal widać opublikowaną wersję.", data: saved };
}

export async function publishAction<K extends ContentKey>(key: K, data: unknown): Promise<ContentResult<K>> {
  const admin = await requireAdmin();
  if (!isKey(key)) return { ok: false, message: "Nieznany dokument." };
  const saved = await publish(key, data, admin.email);
  return { ok: true, message: "Opublikowano. Odwiedzający zobaczą zmiany po odświeżeniu strony.", data: saved };
}

export async function discardDraftAction<K extends ContentKey>(key: K): Promise<ContentResult<K>> {
  await requireAdmin();
  if (!isKey(key)) return { ok: false, message: "Nieznany dokument." };
  await discardDraft(key);
  const { data } = await getEditorState(key);
  return { ok: true, message: "Szkic odrzucony. Wrócono do wersji ze strony.", data };
}

export async function listVersionsAction(key: ContentKey) {
  await requireAdmin();
  if (!isKey(key)) return [];
  const rows = await listVersions(key);
  return rows.map((r) => ({ id: r.id, author: r.author, at: new Date(r.created_at).getTime() }));
}

export async function restoreVersionAction<K extends ContentKey>(key: K, id: string): Promise<ContentResult<K>> {
  const admin = await requireAdmin();
  if (!isKey(key)) return { ok: false, message: "Nieznany dokument." };
  const data = await restoreVersion(key, String(id), admin.email);
  if (!data) return { ok: false, message: "Nie znaleziono tej wersji." };
  return { ok: true, message: "Wersja wczytana do szkicu. Sprawdź podgląd i opublikuj, jeśli wszystko się zgadza.", data };
}
