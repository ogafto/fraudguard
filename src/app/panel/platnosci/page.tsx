import type { Metadata } from "next";
import { ClientBilling } from "@/components/dash/client/billing";
import { listAccountPurchases } from "@/lib/server/account";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Zakupy | FraudGuard" };

export default async function Page() {
  const user = await requireUser();
  return <ClientBilling purchases={await listAccountPurchases(user.id)} />;
}
