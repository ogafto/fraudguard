import type { Metadata } from "next";
import { NotFoundView } from "@/components/not-found-view";

export const metadata: Metadata = { title: "404 | FraudGuard" };

export default function NotFound() {
  return <NotFoundView />;
}
