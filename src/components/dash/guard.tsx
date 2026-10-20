import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/server/session";
import { DashShell } from "./shell";

/** Renders the dashboard only for a signed in user; the admin variant also needs the admin role. */
export async function DashGuard({ variant, children }: { variant: "client" | "admin"; children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/logowanie");
  if (variant === "admin" && user.role !== "admin") redirect("/panel");
  return (
    <DashShell variant={variant} user={{ nick: user.nick, email: user.email }}>
      {children}
    </DashShell>
  );
}
