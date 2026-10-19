import type { Metadata } from "next";
import { ClientChecks } from "@/components/dash/client/checks";

export const metadata: Metadata = { title: "Checki | FraudGuard" };

export default function Page() {
  return <ClientChecks />;
}
