import type { Metadata } from "next";
import { AdminReleases } from "@/components/dash/admin/releases";

export const metadata: Metadata = { title: "Wydania | FraudGuard Admin" };

export default function Page() {
  return <AdminReleases />;
}
