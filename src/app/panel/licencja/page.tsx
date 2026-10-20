import type { Metadata } from "next";
import { ClientLicense } from "@/components/dash/client/license";
import { listAccountLicenses, listReleases } from "@/lib/server/account";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Pakiet i pobieranie | FraudGuard" };

export default async function Page() {
  const user = await requireUser();
  const [licenses, releases] = await Promise.all([listAccountLicenses(user.id), listReleases(10)]);
  return <ClientLicense email={user.email} licenses={licenses} releases={licenses.some((l) => l.active) ? releases : []} />;
}
