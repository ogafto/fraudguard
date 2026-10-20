import type { Metadata } from "next";
import { LegalView } from "@/components/legal-view";

export const metadata: Metadata = { title: "Polityka prywatności | FraudGuard" };

export default function PrivacyPage() {
  return <LegalView initial="privacy" />;
}
