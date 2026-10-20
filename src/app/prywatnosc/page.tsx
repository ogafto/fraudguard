import type { Metadata } from "next";
import { ContentProvider } from "@/components/content-context";
import { LegalView } from "@/components/legal-view";
import { getPublishedContent } from "@/lib/server/content";

export const metadata: Metadata = { title: "Polityka prywatności | FraudGuard" };

export default async function PrivacyPage() {
  const [terms, privacy] = await Promise.all([getPublishedContent("terms"), getPublishedContent("privacy")]);
  return (
    <ContentProvider value={{ terms, privacy }}>
      <LegalView initial="privacy" />
    </ContentProvider>
  );
}
