"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  IconBell,
  IconChevron,
  IconCog,
  IconGrid,
  IconLogs,
  IconSearch,
  IconShield,
  IconUsers,
} from "./icons";
import { LogoMark } from "./logo";
import { McHead } from "./mc-head";
import { EASE } from "./ui";

export function Scaled({ width, children, className }: { width: number; children: ReactNode; className?: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const update = () => {
      const s = Math.min(1, o.clientWidth / width);
      setScale(s);
      setHeight(i.offsetHeight * s);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div ref={outer} className={className} style={{ height }}>
      <div ref={inner} style={{ width, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        {children}
      </div>
    </div>
  );
}

const PLAYERS = [
  "aftoxd", "Notch_Fan99", "BlockBreaker", "q1ckscope", "Dr34mer", "PvP_God_2011",
  "Herobrine404", "creeperking", "mlg_water", "Sweaty_Tryhard", "EnderPearl_", "lagswitch",
];
const CHECKS = [
  { name: "KillAura", type: "C" },
  { name: "Reach", type: "A" },
  { name: "Fly", type: "B" },
  { name: "Speed", type: "E" },
  { name: "Scaffold", type: "D" },
  { name: "Timer", type: "A" },
  { name: "AutoClicker", type: "F" },
  { name: "BadPackets", type: "K" },
];
type Action = "flaga" | "cofnięcie" | "kick" | "ban";
type Alert = { id: number; player: string; check: string; conf: number; vl: number; action: Action; t: string };

function makeAlert(id: number): Alert {
  const c = CHECKS[(id * 5 + 1) % CHECKS.length];
  const vl = ((id * 13) % 19) + 1;
  const action: Action = vl > 16 ? "ban" : vl > 12 ? "kick" : vl > 6 ? "cofnięcie" : "flaga";
  return {
    id,
    player: PLAYERS[(id * 7 + 3) % PLAYERS.length],
    check: `${c.name} ${c.type}`,
    conf: 62 + ((id * 17) % 37),
    vl,
    action,
    t: id < 7 ? `${(7 - id) * 12}s` : "teraz",
  };
}

const ACTION_STYLE: Record<Action, string> = {
  flaga: "text-muted bg-white/[0.04]",
  cofnięcie: "text-warn bg-warn/10",
  kick: "text-fg bg-white/[0.08]",
  ban: "text-danger bg-danger/10",
};

function Spark({ seed, up = true }: { seed: number; up?: boolean }) {
  const pts = Array.from({ length: 16 }, (_, i) => {
    const v = 10 + Math.sin(i * 0.8 + seed) * 4 + Math.cos(i * 1.7 + seed * 2) * 3 + (up ? i * 0.5 : -i * 0.3);
    return `${i * 6},${(26 - v).toFixed(1)}`;
  });
  return (
    <svg viewBox="0 0 90 26" className="h-6 w-[72px]" preserveAspectRatio="none">
      <polyline points={pts.join(" ")} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function AreaChart({ active }: { active: boolean }) {
  const W = 620;
  const H = 170;
  const series = [
    { k: 1, o: 0, c: "#f7f8f8", fill: true },
    { k: 0.55, o: 1.3, c: "rgba(255,255,255,0.45)" },
    { k: 0.3, o: 2.6, c: "rgba(255,255,255,0.25)" },
  ];
  const path = (k: number, o: number) => {
    const n = 24;
    const p = Array.from({ length: n + 1 }, (_, i) => {
      const x = (i / n) * W;
      const base = 60 + Math.sin(i * 0.45 + o) * 22 + Math.cos(i * 0.9 + o) * 12 + (i > 17 && i < 21 ? 38 : 0);
      return [x, H - 12 - base * k] as const;
    });
    let d = `M${p[0][0]},${p[0][1].toFixed(1)}`;
    for (let i = 1; i < p.length; i++) {
      const [x0, y0] = p[i - 1];
      const [x1, y1] = p[i];
      const cx = (x0 + x1) / 2;
      d += ` C${cx.toFixed(1)},${y0.toFixed(1)} ${cx.toFixed(1)},${y1.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
    }
    return d;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[170px] w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="rgba(255,255,255,0.05)" />
      ))}
      {series.map((s, i) => {
        const d = path(s.k, s.o);
        return (
          <g key={i}>
            {s.fill && (
              <motion.path
                d={`${d} L${W},${H} L0,${H} Z`}
                fill="url(#area-fill)"
                initial={{ opacity: 0 }}
                animate={active ? { opacity: 1 } : undefined}
                transition={{ duration: 1.2, delay: 0.8 }}
              />
            )}
            <motion.path
              d={d}
              fill="none"
              stroke={s.c}
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              animate={active ? { pathLength: 1 } : undefined}
              transition={{ duration: 1.8, ease: EASE, delay: 0.2 + i * 0.15 }}
            />
          </g>
        );
      })}
    </svg>
  );
}

function AlertsTable({ active }: { active: boolean }) {
  const [rows, setRows] = useState<Alert[]>(() => Array.from({ length: 7 }, (_, i) => makeAlert(i)).reverse());
  const next = useRef(7);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      const a = makeAlert(next.current++);
      setRows((r) => [a, ...r].slice(0, 7));
    }, 2200);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div>
      <div className="grid grid-cols-[1.6fr_1.1fr_1.2fr_0.5fr_0.8fr_0.5fr] gap-4 border-b border-line px-4 py-2 text-[11px] text-dim">
        <span>Gracz</span>
        <span>Check</span>
        <span>Pewność</span>
        <span>VL</span>
        <span>Akcja</span>
        <span className="text-right">Czas</span>
      </div>
      <ul>
        <AnimatePresence initial={false}>
          {rows.map((a) => (
            <motion.li
              key={a.id}
              layout
              initial={{ opacity: 0, backgroundColor: "rgba(255,255,255,0.06)" }}
              animate={{ opacity: 1, backgroundColor: "rgba(255,255,255,0)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE, backgroundColor: { duration: 1.8 } }}
              className="grid grid-cols-[1.6fr_1.1fr_1.2fr_0.5fr_0.8fr_0.5fr] items-center gap-4 border-b border-line/60 px-4 py-[9px] text-[12.5px]"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <McHead name={a.player} className="size-[18px] shrink-0 rounded-[3px]" />
                <span className="truncate text-fg">{a.player}</span>
              </span>
              <span className="text-muted">{a.check}</span>
              <span className="flex items-center gap-2">
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <span className="block h-full rounded-full bg-white/70" style={{ width: `${a.conf}%` }} />
                </span>
                <span className="w-8 text-right font-mono text-[11px] text-muted">{a.conf}%</span>
              </span>
              <span className="font-mono text-[11.5px] text-muted">{a.vl}</span>
              <span>
                <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${ACTION_STYLE[a.action]}`}>{a.action}</span>
              </span>
              <span className="text-right text-[11.5px] text-dim">{a.t}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

const NAV = [
  { label: "Przegląd", Icon: IconGrid, active: true },
  { label: "Alerty", Icon: IconBell, badge: "12" },
  { label: "Gracze", Icon: IconUsers },
  { label: "Checki", Icon: IconShield },
  { label: "Logi", Icon: IconLogs },
  { label: "Ustawienia", Icon: IconCog },
];

export function Panel() {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref, { margin: "-10% 0px" });

  return (
    <div ref={ref} className="flex h-[740px] w-[1240px] overflow-hidden rounded-[14px] bg-[#0b0c0e] text-left">
      <aside className="flex w-[232px] shrink-0 flex-col border-r border-line bg-[#0a0b0c] p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
          <span className="flex size-6 items-center justify-center rounded-md bg-fg">
            <LogoMark className="size-3.5 text-bg" />
          </span>
          <span className="text-[13.5px] font-medium">Survival EU</span>
          <IconChevron className="ml-auto size-3.5 text-dim" />
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-[12.5px] text-dim shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
          <IconSearch className="size-3.5" />
          Szukaj gracza…
          <span className="ml-auto rounded border border-line px-1 font-mono text-[10px]">⌘K</span>
        </div>
        <ul className="mt-4 space-y-0.5">
          {NAV.map(({ label, Icon, active: on, badge }) => (
            <li
              key={label}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] ${on ? "bg-white/[0.06] text-fg" : "text-muted"}`}
            >
              <Icon className="size-[15px]" />
              {label}
              {badge && <span className="ml-auto rounded-full bg-white/[0.08] px-1.5 text-[10.5px] text-fg">{badge}</span>}
            </li>
          ))}
        </ul>
        <div className="mt-6 px-2.5 text-[11px] font-medium text-dim">Serwery</div>
        <ul className="mt-1.5 space-y-0.5">
          {[
            ["Survival EU", "bg-ok", "1 284"],
            ["SkyBlock", "bg-ok", "642"],
            ["BoxPvP", "bg-ok", "318"],
            ["Lobby", "bg-dim", "off"],
          ].map(([n, dot, c]) => (
            <li key={n} className="flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] text-muted">
              <span className={`size-1.5 rounded-full ${dot}`} />
              {n}
              <span className="ml-auto font-mono text-[10.5px] text-dim">{c}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto rounded-lg p-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between text-[12px]">
            <span>Plan Pro</span>
            <span className="text-dim">3 / 3 serwery</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full w-full rounded-full bg-white/60" />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-line px-5 text-[13px]">
          <span className="text-muted">Survival EU</span>
          <span className="text-dim">/</span>
          <span>Przegląd</span>
          <span className="ml-auto flex items-center gap-2 rounded-full px-2.5 py-1 text-[11.5px] text-muted shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <span className="size-1.5 animate-pulse-dot rounded-full bg-ok text-ok/50" />
            Na żywo
          </span>
          <McHead name="Admin" className="ml-2 size-6 rounded-md" />
        </header>

        <div className="grid flex-1 grid-cols-[1fr_272px] gap-4 overflow-hidden p-5">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="grid grid-cols-4 gap-3">
              {[
                { k: "Gracze online", v: "1 284", d: "+4.2%", s: 1 },
                { k: "Flagi (24h)", v: "3 912", d: "+12%", s: 2 },
                { k: "Bany (24h)", v: "47", d: "+5", s: 3 },
                { k: "Wpływ na tick", v: "0.21 ms", d: "−0.03", s: 4, down: true },
              ].map((m) => (
                <div key={m.k} className="rounded-xl bg-white/[0.02] p-3.5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
                  <div className="text-[11.5px] text-dim">{m.k}</div>
                  <div className="mt-2 flex items-end justify-between">
                    <div>
                      <div className="whitespace-nowrap text-[22px] font-medium leading-none tracking-tight">{m.v}</div>
                      <div className="mt-1.5 text-[11px] text-muted">{m.d}</div>
                    </div>
                    <Spark seed={m.s} up={!m.down} />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-white/[0.02] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium">Wykrycia w ostatnich 24h</span>
                <span className="flex gap-4 text-[11px] text-dim">
                  <span className="flex items-center gap-1.5"><span className="h-px w-3 bg-fg" />Walka</span>
                  <span className="flex items-center gap-1.5"><span className="h-px w-3 bg-white/45" />Ruch</span>
                  <span className="flex items-center gap-1.5"><span className="h-px w-3 bg-white/25" />Świat</span>
                </span>
              </div>
              <div className="mt-3">
                <AreaChart active={active} />
              </div>
              <div className="mt-1 flex justify-between font-mono text-[10px] text-dim">
                {["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "teraz"].map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden rounded-xl bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
              <div className="flex items-center justify-between px-4 pb-1 pt-3">
                <span className="text-[13px] font-medium">Alerty na żywo</span>
                <span className="text-[11px] text-dim">Wszystkie checki</span>
              </div>
              <AlertsTable active={active} />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-xl bg-white/[0.02] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-3">
                <McHead name="aftoxd" className="size-10 rounded-lg" />
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-medium">aftoxd</div>
                  <div className="text-[11.5px] text-dim">Java · 1.20.4 · 38 ms</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-danger/10 px-3 py-2 text-[12px]">
                <span className="text-danger">Zbanowany automatycznie</span>
                <span className="font-mono text-[11px] text-danger/80">VL 17</span>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  ["KillAura C", 92],
                  ["Reach A", 74],
                  ["AutoClicker F", 41],
                  ["Velocity B", 18],
                ].map(([k, v], i) => (
                  <div key={k as string}>
                    <div className="flex justify-between text-[11.5px]">
                      <span className="text-muted">{k}</span>
                      <span className="font-mono text-dim">{v}%</span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        className="h-full rounded-full bg-white/75"
                        initial={{ width: 0 }}
                        animate={active ? { width: `${v}%` } : undefined}
                        transition={{ duration: 1.2, ease: EASE, delay: 0.6 + i * 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 rounded-xl bg-white/[0.02] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
              <div className="text-[13px] font-medium">Historia</div>
              <ol className="relative mt-4 space-y-4 border-l border-line pl-4">
                {[
                  ["Ban: KillAura C", "teraz", "bg-danger"],
                  ["Kick: Reach A", "2 min temu", "bg-fg"],
                  ["Cofnięcie: Reach A", "4 min temu", "bg-warn"],
                  ["Flaga: AutoClicker F", "6 min temu", "bg-dim"],
                  ["Dołączył do serwera", "18 min temu", "bg-dim"],
                ].map(([t, w, dot]) => (
                  <li key={t} className="relative">
                    <span className={`absolute -left-[19.5px] top-1.5 size-[7px] rounded-full ring-4 ring-[#0d0e10] ${dot}`} />
                    <div className="text-[12.5px]">{t}</div>
                    <div className="text-[11px] text-dim">{w}</div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
