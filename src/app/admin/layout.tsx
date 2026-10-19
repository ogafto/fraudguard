import type { Metadata } from "next";
import { DashShell } from "@/components/dash/shell";

export const metadata: Metadata = { title: "Admin | FraudGuard", robots: { index: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashShell variant="admin">{children}</DashShell>;
}
