import type { Metadata } from "next";
import { ClientLicense } from "@/components/dash/client/license";

export const metadata: Metadata = { title: "Licencja | FraudGuard" };

export default function Page() {
  return <ClientLicense />;
}
