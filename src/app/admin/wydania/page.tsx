import type { Metadata } from "next";
import { AdminReleases } from "@/components/dash/admin/releases";
import { listReleases } from "@/lib/server/account";
import { requireAdminUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Wydania | FraudGuard Admin" };

export default async function Page() {
  await requireAdminUser();
  return <AdminReleases releases={await listReleases()} />;
}
