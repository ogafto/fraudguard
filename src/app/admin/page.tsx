import type { Metadata } from "next";
import { AdminOverview } from "@/components/dash/admin/overview";

export const metadata: Metadata = { title: "Przegląd | FraudGuard Admin" };

export default function Page() {
  return <AdminOverview />;
}
