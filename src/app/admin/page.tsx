import type { Metadata } from "next";
import { AdminOverview } from "@/components/dash/admin/overview";
import { getOverview } from "@/lib/server/admin-data";
import { requireAdminUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Przegląd | FraudGuard Admin" };

export default async function Page() {
  await requireAdminUser();
  return <AdminOverview data={await getOverview()} />;
}
