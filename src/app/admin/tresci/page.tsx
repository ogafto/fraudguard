import type { Metadata } from "next";
import { ContentOverview } from "@/components/dash/admin/cms/overview";
import { CONTENT_KEYS } from "@/lib/content";
import { contentStatus } from "@/lib/server/content";
import { requireAdminUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Treści | FraudGuard Admin" };

const ms = (v: unknown) => (v ? new Date(v as string).getTime() : null);

export default async function Page() {
  await requireAdminUser();
  const status = await contentStatus();
  return (
    <ContentOverview
      docs={CONTENT_KEYS.map((key) => ({
        key,
        hasDraft: !!status[key]?.has_draft,
        publishedAt: ms(status[key]?.published_at),
        updatedAt: ms(status[key]?.updated_at),
        updatedBy: status[key]?.updated_by ?? null,
      }))}
    />
  );
}
