export type AuthResult = { ok: true } | { ok: false; error: string; next?: "verify" };

export const AUTH_DEMO = false;

export { login, logout, register, requestPasswordReset, resendCode, resetPassword, verifyEmail, verifyToken } from "./auth-actions";
