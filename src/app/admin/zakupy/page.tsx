import type { Metadata } from "next";
import { AdminPurchases } from "@/components/dash/admin/purchases";
import { listPurchases, listUsers } from "@/lib/server/admin-data";
import { getPublishedContent } from "@/lib/server/content";
import { requireAdminUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Zakupy | FraudGuard Admin" };

export default async function Page() {
  await requireAdminUser();
  const [purchases, users, pricing] = await Promise.all([listPurchases(), listUsers(), getPublishedContent("pricing")]);
  return <AdminPurchases purchases={purchases} plans={pricing.plans} emails={users.map((u) => u.email)} />;
}
