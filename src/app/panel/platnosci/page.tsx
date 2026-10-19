import type { Metadata } from "next";
import { ClientBilling } from "@/components/dash/client/billing";

export const metadata: Metadata = { title: "Płatności | FraudGuard" };

export default function Page() {
  return <ClientBilling />;
}
