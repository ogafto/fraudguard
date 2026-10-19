"use client";

import Link from "next/link";
import { CUSTOMERS, ORDERS, REVENUE_12M, TICKETS } from "@/lib/mock";
import { AreaLine, Block, PageHeader, Pill, Stat } from "../ui";

export function AdminOverview() {
  const plans = ["Starter", "Pro", "Network", "Lifetime Pro"].map((p) => ({
    p,
    n: CUSTOMERS.filter((c) => c.plan === p).length,
  }));
  const total = plans.reduce((a, x) => a + x.n, 0);

  return (
    <>
      <PageHeader title="Przegląd" desc="Sprzedaż, licencje i wsparcie w jednym miejscu." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Przychód (30 dni)" value="18 420 zł" delta="+9,6% m/m" spark={REVENUE_12M.map((r) => r.v)} />
        <Stat label="Aktywne licencje" value="412" delta="+31 w tym miesiącu" delay={0.05} spark={[300, 320, 335, 350, 362, 380, 395, 412]} />
        <Stat label="Nowi klienci (30 dni)" value="38" delta="+6 vs poprzedni" delay={0.1} spark={[20, 24, 22, 28, 30, 33, 38]} />
        <Stat label="Otwarte zgłoszenia" value={String(TICKETS.filter((t) => t.status !== "zamknięte").length)} delta="śr. odpowiedź 18 min" delay={0.15} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Block title="Przychód w ostatnich 12 miesiącach" delay={0.15}>
          <AreaLine values={REVENUE_12M.map((r) => r.v)} labels={REVENUE_12M.map((r) => r.m)} />
        </Block>
        <Block title="Rozkład planów" delay={0.2}>
          <div className="flex h-3 overflow-hidden rounded-full">
            {plans.map((x, i) => (
              <div key={x.p} className={["bg-white/25", "bg-white/80", "bg-white/50", "bg-white/[0.12]"][i]} style={{ width: `${(x.n / total) * 100}%` }} />
            ))}
          </div>
          <ul className="mt-5 space-y-3">
            {plans.map((x, i) => (
              <li key={x.p} className="flex items-center justify-between text-[14px]">
                <span className="flex items-center gap-2.5 text-muted">
                  <span className={`size-2 rounded-sm ${["bg-white/25", "bg-white/80", "bg-white/50", "bg-white/[0.12]"][i]}`} />
                  {x.p}
                </span>
                <span>{Math.round((x.n / total) * 100)}%</span>
              </li>
            ))}
          </ul>
        </Block>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Block title="Ostatnie zamówienia" pad={false} delay={0.25}>
          <ul className="divide-y divide-line/70">
            {ORDERS.map((o) => (
              <li key={o.who + o.when} className="flex items-center gap-4 px-5 py-3.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-white/[0.06] text-[12px] font-semibold">
                  {o.who.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px]">{o.who}</div>
                  <div className="text-[12.5px] text-dim">{o.plan}</div>
                </div>
                <div className="text-right">
                  <div className="text-[14px]">{o.amount}</div>
                  <div className="text-[12px] text-dim">{o.when}</div>
                </div>
              </li>
            ))}
          </ul>
        </Block>
        <Block title="Zgłoszenia" pad={false} delay={0.3} action={<Link href="/admin/zgloszenia" className="text-[13px] text-muted hover:text-fg">Otwórz skrzynkę</Link>}>
          <ul className="divide-y divide-line/70">
            {TICKETS.map((t) => (
              <li key={t.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-[14px]">{t.subject}</span>
                  <Pill tone={t.status === "otwarte" ? "warn" : t.status === "oczekuje" ? "default" : "ok"}>{t.status}</Pill>
                </div>
                <div className="mt-0.5 text-[12.5px] text-dim">
                  #{t.id} · {t.customer} · {t.updated}
                </div>
              </li>
            ))}
          </ul>
        </Block>
      </div>
    </>
  );
}
