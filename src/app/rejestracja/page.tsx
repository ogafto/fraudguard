import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = { title: "Rejestracja | FraudGuard" };

export default function RegisterPage() {
  return <AuthShell mode="register" />;
}
