import type { Metadata } from "next";
import { AdminCustomers } from "@/components/dash/admin/customers";
import { listUsers } from "@/lib/server/admin-data";
import { getPublishedContent } from "@/lib/server/content";
import { requireAdminUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Klienci | FraudGuard Admin" };

export default async function Page() {
  const me = await requireAdminUser();
  const [users, pricing] = await Promise.all([listUsers(), getPublishedContent("pricing")]);
  return <AdminCustomers users={users} meId={me.id} plans={pricing.plans} />;
}
