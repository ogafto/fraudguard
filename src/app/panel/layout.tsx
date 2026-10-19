import type { Metadata } from "next";
import { DashShell } from "@/components/dash/shell";

export const metadata: Metadata = { title: "Panel klienta | FraudGuard" };

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <DashShell variant="client">{children}</DashShell>;
}
