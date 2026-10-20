import type { Metadata } from "next";
import { Suspense } from "react";
import { DashGuard } from "@/components/dash/guard";

export const instant = false;

export const metadata: Metadata = { title: "Admin | FraudGuard", robots: { index: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <DashGuard variant="admin">{children}</DashGuard>
    </Suspense>
  );
}
