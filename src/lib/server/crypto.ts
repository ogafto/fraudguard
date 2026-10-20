import "server-only";
import { createHash, randomBytes, randomInt, scrypt, timingSafeEqual, type BinaryLike, type ScryptOptions } from "node:crypto";

const scryptAsync = (password: BinaryLike, salt: BinaryLike, keylen: number, options: ScryptOptions) =>
  new Promise<Buffer>((resolve, reject) => scrypt(password, salt, keylen, options, (err, key) => (err ? reject(err) : resolve(key))));

const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password.normalize("NFKC"), salt, KEYLEN, { N, r: R, p: P });
  return ["scrypt", N, R, P, salt.toString("base64url"), key.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, stored: string) {
  const [alg, n, r, p, salt, hash] = stored.split("$");
  if (alg !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const key = await scryptAsync(password.normalize("NFKC"), Buffer.from(salt, "base64url"), expected.length, { N: +n, r: +r, p: +p });
  return timingSafeEqual(key, expected);
}

let dummy: Promise<string> | undefined;
export const dummyHash = () => (dummy ??= hashPassword(randomBytes(16).toString("hex")));

export const sha256 = (value: string) => createHash("sha256").update(value).digest("base64url");
export const randomToken = () => randomBytes(32).toString("base64url");
export const randomCode = () => randomInt(0, 1_000_000).toString().padStart(6, "0");

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
