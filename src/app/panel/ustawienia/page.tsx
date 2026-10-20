import type { Metadata } from "next";
import { ClientSettings } from "@/components/dash/client/settings";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Ustawienia konta | FraudGuard" };

export default async function Page() {
  const user = await requireUser();
  return <ClientSettings nick={user.nick} email={user.email} />;
}
