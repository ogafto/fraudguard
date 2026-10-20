"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { coerceSettings, defaultSettings } from "./anticheat";
import { listAccountLicenses, saveAnticheatSettings } from "./server/account";
import { hashPassword, verifyPassword } from "./server/crypto";
import { db } from "./server/db";
import { createSession, destroySession, getCurrentUser } from "./server/session";

export type AccountResult = { ok: boolean; message: string };

const NICK = /^[A-Za-z0-9_]{3,16}$/;

export async function currentAccount(): Promise<{ nick: string; role: "client" | "admin" } | null> {
  const user = await getCurrentUser();
  return user ? { nick: user.nick, role: user.role } : null;
}

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Zaloguj się ponownie.");
  return user;
}

async function requireActiveLicense(userId: string) {
  const licenses = await listAccountLicenses(userId);
  return licenses.some((l) => l.active);
}

export async function saveAnticheatAction(data: unknown): Promise<AccountResult> {
  const user = await requireUser();
  if (!(await requireActiveLicense(user.id))) return { ok: false, message: "Ustawienia odblokują się po przypisaniu pakietu do konta." };
  await saveAnticheatSettings(user.id, coerceSettings(data));
  refresh();
  return { ok: true, message: "Zapisano. Serwery pobiorą nowe ustawienia przy następnej synchronizacji." };
}

export async function resetAnticheatAction(): Promise<AccountResult> {
  const user = await requireUser();
  if (!(await requireActiveLicense(user.id))) return { ok: false, message: "Ustawienia odblokują się po przypisaniu pakietu do konta." };
  await saveAnticheatSettings(user.id, defaultSettings());
  refresh();
  return { ok: true, message: "Przywrócono ustawienia domyślne." };
}

export async function updateNickAction(nick: string): Promise<AccountResult> {
  const user = await requireUser();
  const next = String(nick ?? "").trim();
  if (!NICK.test(next)) return { ok: false, message: "Nick może mieć od 3 do 16 znaków: litery, cyfry i podkreślnik." };
  await db(`update users set nick = $2 where id = $1`, [user.id, next]);
  refresh();
  return { ok: true, message: "Nick zmieniony." };
}

export async function changePasswordAction(current: string, next: string): Promise<AccountResult> {
  const user = await requireUser();
  const [row] = await db<{ password_hash: string }>(`select password_hash from users where id = $1`, [user.id]);
  if (!row || !(await verifyPassword(String(current ?? ""), row.password_hash))) return { ok: false, message: "Obecne hasło jest nieprawidłowe." };
  if (String(next ?? "").length < 8) return { ok: false, message: "Nowe hasło musi mieć co najmniej 8 znaków." };
  await db(`update users set password_hash = $2 where id = $1`, [user.id, await hashPassword(String(next))]);
  await db(`delete from sessions where user_id = $1`, [user.id]);
  await createSession(user.id);
  return { ok: true, message: "Hasło zmienione. Inne urządzenia zostały wylogowane." };
}

export async function logoutEverywhereAction() {
  const user = await requireUser();
  await db(`delete from sessions where user_id = $1`, [user.id]);
  await destroySession();
  redirect("/logowanie");
}
