import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { db } from "./db";
import { randomToken, sha256 } from "./crypto";

const COOKIE = "fg_session";
const DAYS = 30;

export type Role = "client" | "admin";
export type SessionUser = { id: string; nick: string; email: string; role: Role };

/** Emails listed in ADMIN_EMAILS (comma separated) get the admin role on top of the one stored in the database. */
function roleFor(email: string, stored: string): Role {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return stored === "admin" || admins.includes(email) ? "admin" : "client";
}

/** Starts a session for the user and sets the httpOnly cookie. Only the token's hash is stored. */
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

/** The signed in, verified user for this request, or null. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  // The database drivers read the clock, which is only allowed while rendering at request time.
  await connection();
  const [row] = await db<{ id: string; nick: string; email: string; role: string }>(
    `select u.id, u.nick, u.email, u.role
       from sessions s join users u on u.id = s.user_id
      where s.id = $1 and s.expires_at > now() and u.email_verified_at is not null`,
    [sha256(token)],
  );
  return row ? { id: row.id, nick: row.nick, email: row.email, role: roleFor(row.email, row.role) } : null;
});

export const SESSION_COOKIE = COOKIE;
