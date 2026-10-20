"use server";

// Server side of the account screens. Re-exported from ./auth so the screens import from one place.

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthResult } from "./auth";
import { randomCode, randomToken, sha256, safeEqual, hashPassword, verifyPassword, dummyHash } from "./server/crypto";
import { db } from "./server/db";
import { MailNotConfiguredError, resetMail, sendMail, verificationMail } from "./server/mail";
import { createSession, destroySession, isAdminEmail } from "./server/session";

type Purpose = "verify" | "reset";
type UserRow = { id: string; nick: string; email: string; password_hash: string; email_verified_at: string | null };

const CODE_MINUTES = 30;
const RESET_MINUTES = 60;
const MAX_ATTEMPTS = 5;
const RESEND_SECONDS = 30;

const NICK = /^[A-Za-z0-9_]{3,16}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fail = (error: string): AuthResult => ({ ok: false, error });
const MAIL_FAILED = fail("Nie udało się wysłać wiadomości. Spróbuj ponownie za chwilę.");
const MAIL_OFF = fail("Wysyłka e-maili nie jest jeszcze włączona, więc nie możemy wysłać kodu. Napisz do nas na Discordzie.");

/**
 * Sends the email and returns null, or the error to show. Without Resend connected, addresses from
 * ADMIN_EMAILS get their message in the server log instead, so the first admin can sign in and connect it.
 */
async function deliver(mail: Parameters<typeof sendMail>[0]): Promise<AuthResult | null> {
  try {
    await sendMail(mail);
    return null;
  } catch (e) {
    if (e instanceof MailNotConfiguredError) {
      if (!isAdminEmail(mail.to)) return MAIL_OFF;
      console.warn(`\n[auth] Resend nie jest podpięty. Wiadomość dla administratora ${mail.to}:\n${mail.text}\n`);
      return null;
    }
    console.error("[auth] mail failed", e);
    return MAIL_FAILED;
  }
}

const normEmail = (email: unknown) => (typeof email === "string" ? email.trim().toLowerCase() : "");
const str = (v: unknown) => (typeof v === "string" ? v : "");

async function findUser(email: string) {
  const [user] = await db<UserRow>(`select id, nick, email, password_hash, email_verified_at from users where email = $1`, [email]);
  return user;
}

/** Base URL for links in emails: APP_URL if set, otherwise the host the request came in on. */
async function origin() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** True when a code or link for this purpose went out less than RESEND_SECONDS ago. */
async function tooSoon(userId: string, purpose: Purpose) {
  const rows = await db(`select 1 from email_tokens where user_id = $1 and purpose = $2 and created_at > now() - make_interval(secs => $3)`, [
    userId,
    purpose,
    RESEND_SECONDS,
  ]);
  return rows.length > 0;
}

/** Replaces the user's code and link for this purpose and returns the new plain values. */
async function issue(userId: string, purpose: Purpose, minutes: number) {
  const code = purpose === "verify" ? randomCode() : null;
  const token = randomToken();
  await db(
    `insert into email_tokens (user_id, purpose, code_hash, token_hash, expires_at)
     values ($1, $2, $3, $4, now() + make_interval(mins => $5))
     on conflict (user_id, purpose) do update
       set code_hash = excluded.code_hash, token_hash = excluded.token_hash, attempts = 0,
           expires_at = excluded.expires_at, created_at = now()`,
    [userId, purpose, code && sha256(`${userId}:${code}`), sha256(token), minutes],
  );
  return { code, token };
}

async function sendVerification(user: Pick<UserRow, "id" | "nick" | "email">) {
  const { code, token } = await issue(user.id, "verify", CODE_MINUTES);
  const link = `${await origin()}/weryfikacja?token=${encodeURIComponent(token)}`;
  return deliver(verificationMail(user.email, user.nick, code!, link));
}

async function markVerified(userId: string) {
  await db(`update users set email_verified_at = coalesce(email_verified_at, now()) where id = $1`, [userId]);
  await db(`delete from email_tokens where user_id = $1 and purpose = 'verify'`, [userId]);
  await createSession(userId);
}

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

export async function register(data: { nick: string; email: string; password: string }): Promise<AuthResult> {
  const nick = str(data?.nick).trim();
  const email = normEmail(data?.email);
  const password = str(data?.password);

  if (!NICK.test(nick)) return fail("Nick może mieć od 3 do 16 znaków: litery, cyfry i podkreślnik.");
  if (!EMAIL.test(email) || email.length > 254) return fail("Podaj prawidłowy adres e-mail.");
  if (password.length < 8) return fail("Hasło musi mieć co najmniej 8 znaków.");
  if (password.length > 200) return fail("Hasło jest za długie.");

  const existing = await findUser(email);
  if (existing?.email_verified_at) return fail("Konto z tym adresem e-mail już istnieje. Zaloguj się.");

  const passwordHash = await hashPassword(password);
  let user: Pick<UserRow, "id" | "nick" | "email">;
  if (existing) {
    // Unverified sign up again: take the new details and send a fresh code.
    await db(`update users set nick = $2, password_hash = $3 where id = $1`, [existing.id, nick, passwordHash]);
    user = { id: existing.id, nick, email };
    if (await tooSoon(user.id, "verify")) return { ok: true };
  } else {
    user = { id: crypto.randomUUID(), nick, email };
    await db(`insert into users (id, nick, email, password_hash) values ($1, $2, $3, $4) on conflict (email) do nothing`, [
      user.id,
      nick,
      email,
      passwordHash,
    ]);
    const saved = await findUser(email);
    if (!saved) return fail("Coś poszło nie tak. Spróbuj ponownie.");
    if (saved.id !== user.id) return fail("Konto z tym adresem e-mail już istnieje. Zaloguj się.");
  }

  const failed = await sendVerification(user);
  if (failed) return failed;
  return { ok: true };
}

export async function verifyEmail(email: string, code: string): Promise<AuthResult> {
  const user = await findUser(normEmail(email));
  code = str(code).trim();
  if (!user || !/^\d{6}$/.test(code)) return fail("Nieprawidłowy kod. Sprawdź wiadomość i spróbuj ponownie.");

  const [row] = await db<{ code_hash: string | null; attempts: number; expired: boolean }>(
    `select code_hash, attempts, expires_at <= now() as expired from email_tokens where user_id = $1 and purpose = 'verify'`,
    [user.id],
  );
  if (!row?.code_hash || row.expired) return fail("Kod wygasł. Wyślij nowy kod i spróbuj ponownie.");
  if (row.attempts >= MAX_ATTEMPTS) return fail("Zbyt wiele nieudanych prób. Wyślij nowy kod.");

  if (!safeEqual(row.code_hash, sha256(`${user.id}:${code}`))) {
    await db(`update email_tokens set attempts = attempts + 1 where user_id = $1 and purpose = 'verify'`, [user.id]);
    return fail("Nieprawidłowy kod. Sprawdź wiadomość i spróbuj ponownie.");
  }

  await markVerified(user.id);
  return { ok: true };
}

export async function verifyToken(token: string): Promise<AuthResult> {
  token = str(token);
  if (!token) return fail("Link jest nieprawidłowy albo wygasł.");
  const [row] = await db<{ user_id: string }>(
    `select user_id from email_tokens where token_hash = $1 and purpose = 'verify' and expires_at > now()`,
    [sha256(token)],
  );
  if (!row) return fail("Link jest nieprawidłowy albo wygasł.");
  await markVerified(row.user_id);
  return { ok: true };
}

export async function resendCode(email: string): Promise<AuthResult> {
  const user = await findUser(normEmail(email));
  // Same answer whether or not the address has an account.
  if (!user || user.email_verified_at || (await tooSoon(user.id, "verify"))) return { ok: true };
  const failed = await sendVerification(user);
  if (failed) return failed;
  return { ok: true };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const user = await findUser(normEmail(email));
  password = str(password);
  const valid = await verifyPassword(password, user?.password_hash ?? (await dummyHash()));
  if (!user || !valid) return fail("Nieprawidłowy e-mail lub hasło.");

  if (!user.email_verified_at) {
    // Password is right but the address was never confirmed: send a code and show the code screen.
    if (!(await tooSoon(user.id, "verify"))) {
      const failed = await sendVerification(user);
      if (failed) return failed;
    }
    return { ok: false, error: "Najpierw potwierdź adres e-mail.", next: "verify" };
  }

  await createSession(user.id);
  return { ok: true };
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const address = normEmail(email);
  if (!EMAIL.test(address)) return fail("Podaj adres e-mail.");
  const user = await findUser(address);
  // Same answer whether or not the address has an account.
  if (!user || (await tooSoon(user.id, "reset"))) return { ok: true };
  const { token } = await issue(user.id, "reset", RESET_MINUTES);
  return (await deliver(resetMail(user.email, user.nick, `${await origin()}/nowe-haslo?token=${encodeURIComponent(token)}`))) ?? { ok: true };
}

export async function resetPassword(token: string, password: string): Promise<AuthResult> {
  token = str(token);
  password = str(password);
  if (password.length < 8) return fail("Hasło musi mieć co najmniej 8 znaków.");
  if (password.length > 200) return fail("Hasło jest za długie.");
  const [row] = await db<{ user_id: string }>(
    `select user_id from email_tokens where token_hash = $1 and purpose = 'reset' and expires_at > now()`,
    [sha256(token || "-")],
  );
  if (!row) return fail("Link do zmiany hasła jest nieprawidłowy albo wygasł. Poproś o nowy.");

  // The link proves the inbox, so the address counts as confirmed. Old sessions are signed out.
  await db(`update users set password_hash = $2, email_verified_at = coalesce(email_verified_at, now()) where id = $1`, [
    row.user_id,
    await hashPassword(password),
  ]);
  await db(`delete from email_tokens where user_id = $1`, [row.user_id]);
  await db(`delete from sessions where user_id = $1`, [row.user_id]);
  await createSession(row.user_id);
  return { ok: true };
}

export async function logout() {
  await destroySession();
  redirect("/logowanie");
}
