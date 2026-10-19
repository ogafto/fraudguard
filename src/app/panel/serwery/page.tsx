import type { Metadata } from "next";
import { ClientServers } from "@/components/dash/client/servers";

export const metadata: Metadata = { title: "Serwery | FraudGuard" };

export default function Page() {
  return <ClientServers />;
}
