import type { Metadata } from "next";
import { AdminCustomers } from "@/components/dash/admin/customers";
import { listUsers } from "@/lib/server/admin-data";
import { requireAdminUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Klienci | FraudGuard Admin" };

export default async function Page() {
  const me = await requireAdminUser();
  return <AdminCustomers users={await listUsers()} meId={me.id} />;
}
