"use client";

import { INVOICES, LICENSE } from "@/lib/mock";
import { IconDownload } from "../../icons";
import { Block, PageHeader, Pill, Table, Td } from "../ui";

const PLANS = [
  { name: "Starter", price: "29 zł", note: "1 serwer" },
  { name: "Pro", price: "59 zł", note: "do 3 serwerów" },
  { name: "Network", price: "129 zł", note: "bez limitu" },
];

export function ClientBilling() {
  return (
    <>
      <PageHeader title="Płatności" desc="Plan, metoda płatności i faktury." />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Block title="Twój plan">
          <div className="grid gap-3 sm:grid-cols-3">
            {PLANS.map((p) => {
              const current = p.name === LICENSE.plan;
              return (
                <div
                  key={p.name}
                  className={`rounded-xl p-4 ${current ? "bg-white/[0.05] shadow-[0_0_0_1px_rgba(255,255,255,0.22)]" : "shadow-[0_0_0_1px_rgba(255,255,255,0.07)]"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium">{p.name}</span>
                    {current && <Pill>obecny</Pill>}
                  </div>
                  <div className="mt-3 text-[22px] font-medium tracking-tight">
                    {p.price}
                    <span className="text-[13px] font-normal text-dim"> / mies.</span>
                  </div>
                  <div className="text-[12.5px] text-dim">{p.note}</div>
                  {!current && (
                    <button className="mt-4 h-8 w-full rounded-full bg-white/[0.06] text-[12.5px] font-medium ring-1 ring-inset ring-white/[0.1] transition-colors hover:bg-white/[0.1]">
                      {p.name === "Network" ? "Przejdź wyżej" : "Zmień plan"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Block>

        <Block title="Metoda płatności">
          <div className="flex items-center gap-4 rounded-xl p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.07)]">
            <span className="flex h-9 w-12 items-center justify-center rounded-md bg-white/[0.08] text-[12px] font-semibold">BLIK</span>
            <div className="flex-1">
              <div className="text-[14px]">Płatność BLIK</div>
              <div className="text-[12.5px] text-dim">Przypomnienie 3 dni przed odnowieniem</div>
            </div>
          </div>
          <button className="mt-4 text-[13px] text-muted underline-offset-4 transition-colors hover:text-fg hover:underline">Zmień metodę</button>
          <div className="mt-6 border-t border-line pt-4 text-[13px] text-muted">
            Następna płatność: <span className="text-fg">{LICENSE.price}</span> · {LICENSE.renews}
          </div>
        </Block>
      </div>

      <Block title="Faktury" pad={false} className="mt-4" delay={0.1}>
        <Table head={["Numer", "Data", "Kwota", "Metoda", "Status", ""]}>
          {INVOICES.map((inv) => (
            <tr key={inv.id}>
              <Td className="font-mono text-[12.5px]">{inv.id}</Td>
              <Td className="text-muted">{inv.date}</Td>
              <Td>{inv.amount}</Td>
              <Td className="text-muted">{inv.method}</Td>
              <Td>
                <Pill tone="ok">{inv.status}</Pill>
              </Td>
              <Td right>
                <button className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-fg">
                  <IconDownload className="size-3.5" />
                  PDF
                </button>
              </Td>
            </tr>
          ))}
        </Table>
      </Block>
    </>
  );
}
