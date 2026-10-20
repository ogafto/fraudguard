import type { Metadata } from "next";
import { ClientOverview } from "@/components/dash/client/overview";
import { CHECK_CATEGORIES } from "@/lib/checks";
import { getAnticheatSettings, listAccountLicenses, listReleases } from "@/lib/server/account";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Przegląd | FraudGuard" };

export default async function Page() {
  const user = await requireUser();
  const [licenses, releases, settings] = await Promise.all([listAccountLicenses(user.id), listReleases(1), getAnticheatSettings(user.id)]);
  const all = CHECK_CATEGORIES.flatMap((c) => c.checks);
  return (
    <ClientOverview
      nick={user.nick}
      email={user.email}
      license={licenses.find((l) => l.active) ?? null}
      release={releases[0] ?? null}
      enabledChecks={all.filter((c) => settings.checks[c.name]?.enabled).length}
      totalChecks={all.length}
    />
  );
}
