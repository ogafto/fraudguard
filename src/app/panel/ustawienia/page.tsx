import type { Metadata } from "next";
import { ClientSettings } from "@/components/dash/client/settings";

export const metadata: Metadata = { title: "Ustawienia | FraudGuard" };

export default function Page() {
  return <ClientSettings />;
}
