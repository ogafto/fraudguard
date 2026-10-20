import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminIntegrations } from "@/components/dash/admin/integrations";
import { loadIntegrations } from "@/lib/integration-actions";

export const metadata: Metadata = { title: "Integracje | FraudGuard Admin" };

async function Integrations() {
  const data = await loadIntegrations();
  return <AdminIntegrations {...data} />;
}

function Skeleton() {
  return (
    <div className="grid gap-4 pt-[84px]">
      {[150, 230, 190].map((h) => (
        <div key={h} className="card animate-pulse" style={{ height: h }} />
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Integrations />
    </Suspense>
  );
}
