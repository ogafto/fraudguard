import type { Metadata } from "next";
import { AdminCustomers } from "@/components/dash/admin/customers";

export const metadata: Metadata = { title: "Klienci | FraudGuard Admin" };

export default function Page() {
  return <AdminCustomers />;
}
