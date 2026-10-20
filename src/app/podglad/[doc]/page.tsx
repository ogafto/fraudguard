import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ContentProvider } from "@/components/content-context";
import { HomePage } from "@/components/home-page";
import { LegalView } from "@/components/legal-view";
import { CONTENT_DOCS, CONTENT_KEYS, type ContentKey } from "@/lib/content";
import { getEditorState } from "@/lib/server/content";
import { requireAdminUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Podgląd | FraudGuard", robots: { index: false } };

/** The real page rendered with the CMS draft instead of the published texts. Admins only. */
async function Preview({ params }: { params: PageProps<"/podglad/[doc]">["params"] }) {
  await requireAdminUser();
  const { doc } = await params;
  if (!CONTENT_KEYS.includes(doc as ContentKey)) notFound();
  const key = doc as ContentKey;
  const legal = key === "terms" || key === "privacy";

  const value = legal
    ? { terms: (await getEditorState("terms")).data, privacy: (await getEditorState("privacy")).data }
    : { [key]: (await getEditorState(key)).data };

  return (
    <ContentProvider value={value}>
      {legal ? <LegalView initial={key} /> : <HomePage />}
      <div className="fixed inset-x-0 bottom-4 z-[70] flex justify-center px-4">
        <div className="flex items-center gap-3 rounded-full bg-[#111214]/90 py-1.5 pl-4 pr-1.5 text-[13px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.12),0_20px_50px_-10px_rgba(0,0,0,0.9)] backdrop-blur-xl">
          <span className="size-1.5 animate-pulse rounded-full bg-warn" />
          <span className="text-muted">
            Podgląd szkicu: <span className="text-fg">{CONTENT_DOCS[key].label}</span>
          </span>
          <Link href={`/admin/tresci/${key}`} className="rounded-full bg-fg px-3 py-1.5 font-medium text-bg transition-colors hover:bg-[#e4e5e7]">
            Wróć do edycji
          </Link>
        </div>
      </div>
    </ContentProvider>
  );
}

export default function PreviewPage({ params }: PageProps<"/podglad/[doc]">) {
  return (
    <Suspense>
      <Preview params={params} />
    </Suspense>
  );
}
