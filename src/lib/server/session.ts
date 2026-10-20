import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { db } from "./db";
import { randomToken, sha256 } from "./crypto";

const COOKIE = "fg_session";
const DAYS = 30;

export type Role = "client" | "admin";
export type SessionUser = { id: string; nick: string; email: string; role: Role };

export function isAdminEmail(email: string) {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

function roleFor(email: string, stored: string): Role {
  return stored === "admin" || isAdminEmail(email) ? "admin" : "client";
}

export async function createSession(userId: string) {
  const token = randomToken();
  await db(`insert into sessions (id, user_id, expires_at) values ($1, $2, now() + make_interval(days => $3))`, [sha256(token), userId, DAYS]);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db(`delete from sessions where id = $1`, [sha256(token)]);
  jar.delete(COOKIE);
}

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  await connection();
  const [row] = await db<{ id: string; nick: string; email: string; role: string }>(
    `select u.id, u.nick, u.email, u.role
       from sessions s join users u on u.id = s.user_id
      where s.id = $1 and s.expires_at > now() and u.email_verified_at is not null`,
    [sha256(token)],
  );
  return row ? { id: row.id, nick: row.nick, email: row.email, role: roleFor(row.email, row.role) } : null;
});

export async function requireAdminUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/logowanie");
  if (user.role !== "admin") redirect("/panel");
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/logowanie");
  return user;
}

export const SESSION_COOKIE = COOKIE;
