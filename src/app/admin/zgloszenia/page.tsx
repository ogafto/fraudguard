import type { Metadata } from "next";
import { AdminTickets } from "@/components/dash/admin/tickets";

export const metadata: Metadata = { title: "Zgłoszenia | FraudGuard Admin" };

export default function Page() {
  return <AdminTickets />;
}
