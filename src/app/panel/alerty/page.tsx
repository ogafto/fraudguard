import type { Metadata } from "next";
import { ClientAlerts } from "@/components/dash/client/alerts";

export const metadata: Metadata = { title: "Alerty | FraudGuard" };

export default function Page() {
  return <ClientAlerts />;
}
