"use client";

import Link from "next/link";
import { ALERTS, DETECTIONS_7D, LICENSE, SERVERS } from "@/lib/mock";
import { IconDownload } from "../../icons";
import { Button } from "../../ui";
import { ActionBadge, Block, PageHeader, Player, StackedBars, Stat, StatusDot, Table, Td } from "../ui";

export function ClientOverview() {
  const online = SERVERS.reduce((a, s) => a + s.players, 0);
  return (
    <>
      <PageHeader
        title="Dobry wieczór, Kuba"
        desc="Tak wygląda ochrona Twoich serwerów w ostatnich 24 godzinach."
        actions={
          <>
            <Button size="sm" variant="secondary" href="/panel/alerty">
              Wszystkie alerty
            </Button>
            <Button size="sm" href="/panel/licencja">
              Pobierz plugin
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Chronieni gracze teraz" value={online.toLocaleString("pl-PL")} delta="+4,2% vs wczoraj" spark={[8, 9, 9, 11, 10, 12, 13, 12, 14]} />
        <Stat label="Flagi (24h)" value="3 912" delta="+12% vs wczoraj" positive={false} delay={0.05} spark={[4, 6, 5, 7, 9, 8, 11, 10, 12]} />
        <Stat label="Zbanowani cheaterzy (24h)" value="47" delta="+5 vs wczoraj" delay={0.1} spark={[2, 3, 2, 4, 3, 5, 4, 6, 5]} />
        <Stat label="Średni wpływ na tick" value="0,21 ms" delta="−0,03 ms" delay={0.15} spark={[6, 5, 6, 5, 4, 5, 4, 4, 3]} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Block title="Wykrycia w ostatnich 7 dniach" delay={0.15}>
          <StackedBars
            data={DETECTIONS_7D}
            labelKey="day"
            keys={[
              { key: "combat", label: "Walka", className: "bg-white/80" },
              { key: "movement", label: "Ruch", className: "bg-white/40" },
              { key: "world", label: "Świat", className: "bg-white/[0.18]" },
            ]}
          />
        </Block>

        <Block title="Licencja" delay={0.2}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[22px] font-medium tracking-tight">Plan {LICENSE.plan}</div>
              <div className="mt-1 text-[13.5px] text-muted">Odnowienie {LICENSE.renews} · {LICENSE.price}</div>
            </div>
            <StatusDot>aktywna</StatusDot>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-[13px]">
              <span className="text-muted">Wykorzystane serwery</span>
              <span>
                {LICENSE.servers} / {LICENSE.maxServers}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-white/70" style={{ width: `${(LICENSE.servers / LICENSE.maxServers) * 100}%` }} />
            </div>
          </div>
          <div className="mt-6 rounded-xl bg-white/[0.03] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-medium">FraudGuard 2.0.0</div>
                <div className="text-[12.5px] text-dim">Najnowsza wersja stabilna · 2.4 MB</div>
              </div>
              <Link
                href="/panel/licencja"
                className="flex size-9 items-center justify-center rounded-lg bg-fg text-bg transition-colors hover:bg-[#e4e5e7]"
                aria-label="Pobierz"
              >
                <IconDownload className="size-4" />
              </Link>
            </div>
          </div>
        </Block>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Block title="Ostatnie alerty" pad={false} delay={0.25} action={<Link href="/panel/alerty" className="text-[13px] text-muted hover:text-fg">Zobacz wszystkie</Link>}>
          <Table head={["Gracz", "Check", "Serwer", "VL", "Akcja", "Kiedy"]}>
            {ALERTS.slice(0, 6).map((a) => (
              <tr key={a.id}>
                <Td>
                  <Player name={a.player} />
                </Td>
                <Td className="text-muted">{a.check}</Td>
                <Td className="text-muted">{a.server}</Td>
                <Td className="font-mono text-[12.5px] text-muted">{a.vl}</Td>
                <Td>
                  <ActionBadge action={a.action} />
                </Td>
                <Td right className="text-dim">
                  {a.time}
                </Td>
              </tr>
            ))}
          </Table>
        </Block>

        <Block title="Serwery" pad={false} delay={0.3} action={<Link href="/panel/serwery" className="text-[13px] text-muted hover:text-fg">Zarządzaj</Link>}>
          <ul className="divide-y divide-line/70">
            {SERVERS.map((s) => (
              <li key={s.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="text-[14px]">{s.name}</div>
                  <div className="truncate text-[12.5px] text-dim">{s.ip}</div>
                </div>
                <div className="text-right">
                  <StatusDot tone={s.online ? "ok" : "dim"}>{s.online ? `${s.players.toLocaleString("pl-PL")} graczy` : "offline"}</StatusDot>
                  <div className="text-[12px] text-dim">{s.online ? `TPS ${s.tps.toFixed(1)}` : "brak"}</div>
                </div>
              </li>
            ))}
          </ul>
        </Block>
      </div>
    </>
  );
}
