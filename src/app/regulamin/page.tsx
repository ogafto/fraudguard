import type { Metadata } from "next";
import { ContentProvider } from "@/components/content-context";
import { LegalView } from "@/components/legal-view";
import { getPublishedContent } from "@/lib/server/content";

export const metadata: Metadata = { title: "Regulamin | FraudGuard" };

export default async function TermsPage() {
  const [terms, privacy] = await Promise.all([getPublishedContent("terms"), getPublishedContent("privacy")]);
  return (
    <ContentProvider value={{ terms, privacy }}>
      <LegalView initial="terms" />
    </ContentProvider>
  );
}
