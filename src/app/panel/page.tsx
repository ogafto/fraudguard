import type { Metadata } from "next";
import { ClientOverview } from "@/components/dash/client/overview";

export const metadata: Metadata = { title: "Przegląd | FraudGuard" };

export default function Page() {
  return <ClientOverview />;
}
