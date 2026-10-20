import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentEditor } from "@/components/dash/admin/cms/editor";
import { CONTENT_DOCS, CONTENT_KEYS, type ContentKey } from "@/lib/content";
import { getEditorState } from "@/lib/server/content";
import { requireAdminUser } from "@/lib/server/session";

export async function generateMetadata({ params }: PageProps<"/admin/tresci/[doc]">): Promise<Metadata> {
  const { doc } = await params;
  const label = CONTENT_DOCS[doc as ContentKey]?.label ?? "Treści";
  return { title: `${label} | FraudGuard Admin` };
}

const ms = (v: unknown) => (v ? new Date(v as string).getTime() : null);

export default async function Page({ params }: PageProps<"/admin/tresci/[doc]">) {
  await requireAdminUser();
  const { doc } = await params;
  if (!CONTENT_KEYS.includes(doc as ContentKey)) notFound();
  const key = doc as ContentKey;
  const state = await getEditorState(key);
  return (
    <ContentEditor
      key={key}
      docKey={key}
      initial={state.data}
      hasDraft={state.hasDraft}
      publishedAt={ms(state.publishedAt)}
      updatedAt={ms(state.updatedAt)}
      updatedBy={state.updatedBy}
    />
  );
}
