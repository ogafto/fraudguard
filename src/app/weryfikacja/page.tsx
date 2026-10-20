import type { Metadata } from "next";
import { VerifyLinkView } from "@/components/verify-link-view";

export const metadata: Metadata = { title: "Weryfikacja konta | FraudGuard", robots: { index: false } };

export default function VerifyPage() {
  return <VerifyLinkView />;
}
