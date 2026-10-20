import type { Metadata } from "next";
import { ClientServers } from "@/components/dash/client/servers";
import { listAccountLicenses } from "@/lib/server/account";
import { getPublishedContent } from "@/lib/server/content";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Serwery | FraudGuard" };

export default async function Page() {
  const user = await requireUser();
  const [licenses, pricing] = await Promise.all([listAccountLicenses(user.id), getPublishedContent("pricing")]);
  const active = licenses.find((l) => l.active) ?? null;
  const plan = active ? pricing.plans.find((p) => p.name === active.planName) : null;
  return <ClientServers email={user.email} licenseKey={active?.key ?? null} maxServers={plan?.features[0] ?? null} />;
}
