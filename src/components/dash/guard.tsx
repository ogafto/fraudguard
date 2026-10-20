import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { listAccountLicenses } from "@/lib/server/account";
import { getCurrentUser } from "@/lib/server/session";
import { DashShell } from "./shell";

export async function DashGuard({ variant, children }: { variant: "client" | "admin"; children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/logowanie");
  if (variant === "admin" && user.role !== "admin") redirect("/panel");
  const plan = (await listAccountLicenses(user.id)).find((l) => l.active)?.planName ?? null;
  return (
    <DashShell variant={variant} user={{ nick: user.nick, email: user.email, role: user.role, plan }}>
      {children}
    </DashShell>
  );
}
