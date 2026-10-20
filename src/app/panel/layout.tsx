import type { Metadata } from "next";
import { Suspense } from "react";
import { DashGuard } from "@/components/dash/guard";

export const instant = false;

export const metadata: Metadata = { title: "Panel klienta | FraudGuard" };

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <DashGuard variant="client">{children}</DashGuard>
    </Suspense>
  );
}
