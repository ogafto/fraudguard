"use client";

import { useState } from "react";
import { CUSTOMERS } from "@/lib/mock";
import { IconSearch } from "../../icons";
import { Block, Input, PageHeader, Pill, Table, Td } from "../ui";

export function AdminCustomers() {
  const [q, setQ] = useState("");
  const rows = CUSTOMERS.filter((c) => `${c.name} ${c.email}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader title="Klienci" desc={`${CUSTOMERS.length} kont · MRR ${CUSTOMERS.reduce((a, c) => a + c.mrr, 0)} zł`} />
      <Block pad={false}>
        <div className="border-b border-line p-4">
          <div className="relative w-full sm:w-72">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-dim" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj po nazwie lub e-mailu…" className="w-full pl-8" />
          </div>
        </div>
        <Table head={["Klient", "Plan", "Serwery", "MRR", "Od", "Status", ""]}>
          {rows.map((c) => (
            <tr key={c.email}>
              <Td>
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-white/[0.06] text-[12px] font-semibold">
                    {c.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <div>{c.name}</div>
                    <div className="text-[12.5px] text-dim">{c.email}</div>
                  </div>
                </div>
              </Td>
              <Td>{c.plan}</Td>
              <Td className="text-muted">{c.servers}</Td>
              <Td>{c.mrr ? `${c.mrr} zł` : "brak"}</Td>
              <Td className="text-muted">{c.since}</Td>
              <Td>
                <Pill tone={c.status === "aktywny" ? "ok" : c.status === "zaległość" ? "warn" : "default"}>{c.status}</Pill>
              </Td>
              <Td right>
                <button className="text-[13px] text-muted transition-colors hover:text-fg">Szczegóły</button>
              </Td>
            </tr>
          ))}
        </Table>
      </Block>
    </>
  );
}
