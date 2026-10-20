import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = { title: "Nowe hasło | FraudGuard", robots: { index: false } };

export default function NewPasswordPage() {
  return <AuthShell mode="newPassword" />;
}
