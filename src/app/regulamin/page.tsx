import type { Metadata } from "next";
import { LegalView } from "@/components/legal-view";

export const metadata: Metadata = { title: "Regulamin | FraudGuard" };

export default function TermsPage() {
  return <LegalView initial="terms" />;
}
