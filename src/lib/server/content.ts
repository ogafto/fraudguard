import "server-only";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { coerceContent, DEFAULT_CONTENT, type ContentKey, type ContentMap } from "../content";
import { db } from "./db";

export const contentTag = (key: ContentKey) => `content:${key}`;

type Row = { published: unknown; draft: unknown; published_at: string | null; updated_at: string; updated_by: string | null };

async function row(key: ContentKey) {
  const [r] = await db<Row>(`select published, draft, published_at, updated_at, updated_by from content where key = $1`, [key]);
  return r;
}

export async function getPublishedContent<K extends ContentKey>(key: K): Promise<ContentMap[K]> {
  "use cache";
  cacheTag(contentTag(key));
  cacheLife("max");
  if (!process.env.DATABASE_URL && process.env.NEXT_PHASE === "phase-production-build") return DEFAULT_CONTENT[key];
  try {
    const r = await row(key);
    return r?.published ? coerceContent(key, r.published) : DEFAULT_CONTENT[key];
  } catch {
    return DEFAULT_CONTENT[key];
  }
}

export type EditorState<K extends ContentKey> = {
  data: ContentMap[K];
  hasDraft: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
};

export async function getEditorState<K extends ContentKey>(key: K): Promise<EditorState<K>> {
  const r = await row(key);
  const source = r?.draft ?? r?.published;
  return {
    data: source ? coerceContent(key, source) : DEFAULT_CONTENT[key],
    hasDraft: !!r?.draft,
    publishedAt: r?.published_at ?? null,
    updatedAt: r?.updated_at ?? null,
    updatedBy: r?.updated_by ?? null,
  };
}

export async function saveDraft<K extends ContentKey>(key: K, input: unknown, author: string) {
  const data = coerceContent(key, input);
  await db(
    `insert into content (key, draft, updated_by) values ($1, $2::jsonb, $3)
     on conflict (key) do update set draft = excluded.draft, updated_at = now(), updated_by = excluded.updated_by`,
    [key, JSON.stringify(data), author],
  );
  return data;
}

export async function publish<K extends ContentKey>(key: K, input: unknown, author: string) {
  const data = coerceContent(key, input);
  const json = JSON.stringify(data);
  await db(
    `insert into content (key, published, draft, published_at, updated_by) values ($1, $2::jsonb, null, now(), $3)
     on conflict (key) do update set published = excluded.published, draft = null, published_at = now(), updated_at = now(), updated_by = excluded.updated_by`,
    [key, json, author],
  );
  await db(`insert into content_versions (id, key, data, author) values ($1, $2, $3::jsonb, $4)`, [crypto.randomUUID(), key, json, author]);
  updateTag(contentTag(key));
  return data;
}

export async function discardDraft(key: ContentKey) {
  await db(`update content set draft = null, updated_at = now() where key = $1`, [key]);
}

export async function listVersions(key: ContentKey) {
  return db<{ id: string; author: string | null; created_at: string }>(
    `select id, author, created_at from content_versions where key = $1 order by created_at desc limit 50`,
    [key],
  );
}

export async function restoreVersion<K extends ContentKey>(key: K, id: string, author: string) {
  const [v] = await db<{ data: unknown }>(`select data from content_versions where key = $1 and id = $2`, [key, id]);
  if (!v) return null;
  return saveDraft(key, v.data, author);
}

export async function contentStatus() {
  const rows = await db<{ key: ContentKey; has_draft: boolean; published_at: string | null; updated_at: string; updated_by: string | null }>(
    `select key, draft is not null as has_draft, published_at, updated_at, updated_by from content`,
  );
  return Object.fromEntries(rows.map((r) => [r.key, r])) as Partial<Record<ContentKey, (typeof rows)[number]>>;
}
