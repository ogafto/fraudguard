import type { Metadata } from "next";
import { AdminLicenses } from "@/components/dash/admin/licenses";

export const metadata: Metadata = { title: "Licencje | FraudGuard Admin" };

export default function Page() {
  return <AdminLicenses />;
}
