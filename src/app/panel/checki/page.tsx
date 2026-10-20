import type { Metadata } from "next";
import { ClientChecks } from "@/components/dash/client/checks";
import { getAnticheatSettings, listAccountLicenses } from "@/lib/server/account";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Ustawienia anticheata | FraudGuard" };

export default async function Page() {
  const user = await requireUser();
  const [licenses, settings] = await Promise.all([listAccountLicenses(user.id), getAnticheatSettings(user.id)]);
  return <ClientChecks email={user.email} locked={!licenses.some((l) => l.active)} initial={settings} />;
}
