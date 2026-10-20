// Auth calls used by the login, register, verification and new password screens.
// They run on the server (see ./auth-actions): accounts live in Postgres, codes and links go out by email.

/** `next: "verify"` asks the screen to show the code step (login with an unconfirmed address). */
export type AuthResult = { ok: true } | { ok: false; error: string; next?: "verify" };

/** True when the screens run without a backend, so they can show a hint for testing. */
export const AUTH_DEMO = false;

export { login, logout, register, requestPasswordReset, resendCode, resetPassword, verifyEmail, verifyToken } from "./auth-actions";
