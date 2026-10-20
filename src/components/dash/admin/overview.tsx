"use client";

import Link from "next/link";
import type { AdminOverview as Data } from "@/lib/server/admin-data";
import { McHead } from "../../mc-head";
import { AreaLine, Block, PageHeader, Pill, Stat } from "../ui";
import { BILLING_LABEL, date, zl } from "./kit";

const SHADES = ["bg-white/80", "bg-white/50", "bg-white/25", "bg-white/[0.12]"];

function change(now: number, before: number, unit: (n: number) => string) {
  const diff = now - before;
  return { text: `${diff >= 0 ? "+" : ""}${unit(diff)} vs poprzednie 30 dni`, positive: diff >= 0 };
}

export function AdminOverview({ data }: { data: Data }) {
  const revenue = change(data.revenue30, data.revenuePrev30, zl);
  const users = change(data.users30, data.usersPrev30, String);
  const total = data.plans.reduce((a, x) => a + x.count, 0);
  const empty = <p className="px-5 py-8 text-center text-[14px] text-dim">Jeszcze nic tu nie ma.</p>;

  return (
    <>
      <PageHeader title="Przegląd" desc="Sprzedaż, licencje i nowe konta w jednym miejscu." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Przychód (30 dni)" value={zl(data.revenue30)} delta={revenue.text} positive={revenue.positive} spark={data.months.map((m) => m.value)} />
        <Stat label="Aktywne licencje" value={String(data.activeLicenses)} delta={`+${data.newLicenses30} w ostatnich 30 dniach`} delay={0.05} />
        <Stat label="Nowe konta (30 dni)" value={String(data.users30)} delta={users.text} positive={users.positive} delay={0.1} />
        <Stat label="Wszystkie konta" value={String(data.usersTotal)} delay={0.15} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Block title="Przychód w ostatnich 12 miesiącach" delay={0.15}>
          <AreaLine values={data.months.map((m) => m.value / 100)} labels={data.months.map((m) => m.label)} />
        </Block>
        <Block title="Aktywne licencje według planu" delay={0.2}>
          {total === 0 ? (
            <p className="py-6 text-center text-[14px] text-dim">Brak aktywnych licencji.</p>
          ) : (
            <>
              <div className="flex h-3 overflow-hidden rounded-full">
                {data.plans.map((x, i) => (
                  <div key={x.name} className={SHADES[i % SHADES.length]} style={{ width: `${(x.count / total) * 100}%` }} />
                ))}
              </div>
              <ul className="mt-5 space-y-3">
                {data.plans.map((x, i) => (
                  <li key={x.name} className="flex items-center justify-between text-[14px]">
                    <span className="flex items-center gap-2.5 text-muted">
                      <span className={`size-2 rounded-sm ${SHADES[i % SHADES.length]}`} />
                      {x.name}
                    </span>
                    <span className="tabular-nums">
                      {x.count} <span className="text-dim">· {Math.round((x.count / total) * 100)}%</span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Block>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Block title="Ostatnie zakupy" pad={false} delay={0.25} action={<Link href="/admin/zakupy" className="text-[13px] text-muted hover:text-fg">Wszystkie zakupy</Link>}>
          {data.recentPurchases.length === 0 ? (
            empty
          ) : (
            <ul className="divide-y divide-line/70">
              {data.recentPurchases.map((o) => (
                <li key={o.id} className="flex items-center gap-4 px-5 py-3.5">
                  <McHead name={o.nick} className="size-8 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px]">{o.nick}</div>
                    <div className="text-[12.5px] text-dim">
                      {o.planName} · {BILLING_LABEL[o.billing]}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[14px] tabular-nums ${o.status === "refunded" ? "text-dim line-through" : ""}`}>{zl(o.amount)}</div>
                    <div className="text-[12px] text-dim">{date(o.createdAt)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Block>
        <Block title="Nowe konta" pad={false} delay={0.3} action={<Link href="/admin/klienci" className="text-[13px] text-muted hover:text-fg">Wszyscy klienci</Link>}>
          {data.recentUsers.length === 0 ? (
            empty
          ) : (
            <ul className="divide-y divide-line/70">
              {data.recentUsers.map((u) => (
                <li key={u.id} className="flex items-center gap-3 px-5 py-3.5">
                  <McHead name={u.nick} className="size-8 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px]">{u.nick}</div>
                    <div className="truncate text-[12.5px] text-dim">{u.email}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Pill tone={u.verified ? "ok" : "warn"}>{u.verified ? "zweryfikowane" : "bez weryfikacji"}</Pill>
                    <span className="text-[12px] text-dim">{date(u.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Block>
      </div>
    </>
  );
}
