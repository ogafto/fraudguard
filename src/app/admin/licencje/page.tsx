import type { Metadata } from "next";
import { AdminLicenses } from "@/components/dash/admin/licenses";
import { listLicenses, listUsers } from "@/lib/server/admin-data";
import { getPublishedContent } from "@/lib/server/content";
import { requireAdminUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Licencje | FraudGuard Admin" };

export default async function Page() {
  await requireAdminUser();
  const [licenses, users, pricing] = await Promise.all([listLicenses(), listUsers(), getPublishedContent("pricing")]);
  return <AdminLicenses licenses={licenses} plans={pricing.plans} users={users.filter((u) => u.verified).map((u) => ({ email: u.email, nick: u.nick, verified: u.verified }))} />;
}
