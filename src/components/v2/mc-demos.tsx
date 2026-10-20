"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { LogoMark } from "../logo";
import { McHead } from "../mc-head";
import { McItem, McText, type SpriteName } from "../mc-ui";
import { EASE } from "../ui";

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

/** Every demo is a pure function of `t`, the milliseconds into its chapter, which the scroll position drives. */
export type DemoProps = { t: number };

/** Largest half step scale at which a texture of `w`×`h` pixels still fits its container. */
function useFit(w: number, h: number, max: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(2);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const fit = Math.min(e.contentRect.width / w, e.contentRect.height / h);
      setS(Math.max(1, Math.min(max, Math.floor(fit * 2) / 2)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h, max]);
  return [ref, s] as const;
}

/** Scales its content down (never up) so it always fits the box, e.g. on short phones. */
function FitBox({ children }: { children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  useEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const update = () => setK(Math.min(1, o.clientHeight / i.offsetHeight, o.clientWidth / i.offsetWidth));
    const ro = new ResizeObserver(update);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={outer} className="flex h-full w-full items-center justify-center">
      <div ref={inner} className="w-full max-w-[600px] shrink-0" style={{ transform: `scale(${k})` }}>
        {children}
      </div>
    </div>
  );
}

const pixel: CSSProperties = { imageRendering: "pixelated" };

/** Item in a 16×16 slot, with a stack count like in game. */
function Stack({ item, x, y, s, count }: { item: SpriteName; x: number; y: number; s: number; count?: number }) {
  return (
    <div className="absolute" style={{ left: x * s, top: y * s, width: 16 * s, height: 16 * s }}>
      <McItem name={item} head="aftoxd" className="size-full" />
      {count && (
        <span className="absolute -right-[0.15em] bottom-0 leading-none" style={{ fontSize: 6.5 * s }}>
          <McText>{String(count)}</McText>
        </span>
      )}
    </div>
  );
}

function Cursor({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 18" className={`h-[22px] w-[15px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] ${className ?? ""}`} aria-hidden>
      <path d="M1 1v14l3.6-3.4 2.6 5.6 2.2-1-2.6-5.4H12L1 1Z" fill="#fff" stroke="#000" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

/** Vanilla tooltip: near black with the purple gradient border. */
function Tooltip({ lines, size = 15, className, style }: { lines: string[]; size?: number; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`pointer-events-none whitespace-nowrap ${className ?? ""}`}
      style={{
        fontSize: size,
        lineHeight: 1.3,
        padding: "0.25em 0.45em 0.3em",
        background: "rgba(16,0,16,0.94)",
        boxShadow: "0 0 0 0.125em rgba(16,0,16,0.94), inset 0 0 0 0.125em rgba(80,0,255,0.32)",
        ...style,
      }}
    >
      {lines.map((l, i) => (
        <div key={i} style={{ marginBottom: i === 0 && lines.length > 1 ? "0.2em" : undefined }}>
          {l ? <McText>{l}</McText> : <br />}
        </div>
      ))}
    </div>
  );
}

/** The vanilla crosshair, so the chat chapters read as the game screen above the hotbar below. */
function Crosshair() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/mc/gui/crosshair.png" alt="" className="pointer-events-none absolute left-1/2 top-[30%] size-[30px] -translate-x-1/2 -translate-y-1/2 opacity-70" style={pixel} />
  );
}

function ChatLine({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`bg-black/50 px-1.5 py-[3px] text-[12px] leading-[16px] sm:text-[14px] sm:leading-[18px] lg:text-[16px] lg:leading-[20px] ${className ?? ""}`}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/* Player hotbar, shown in the inventory of the /fg gui menu           */
/* ------------------------------------------------------------------ */

const HOTBAR: { item: SpriteName; count?: number }[] = [
  { item: "sword" },
  { item: "bow" },
  { item: "pickaxe" },
  { item: "apple", count: 12 },
  { item: "pearl", count: 16 },
  { item: "beef", count: 32 },
  { item: "arrow", count: 64 },
  { item: "totem" },
  { item: "spyglass" },
];

/* ------------------------------------------------------------------ */
/** Hearts, hunger, xp and the hotbar under the chat, all from the real HUD textures. */
function Hud() {
  const [ref, s] = useFit(182, 40, 2.5);
  const bg = (url: string, w: number, h: number, x = 0, y = 0): CSSProperties => ({
    ...pixel,
    position: "absolute",
    left: x * s,
    top: y * s,
    width: w * s,
    height: h * s,
    backgroundImage: `url(${url})`,
    backgroundSize: "100% 100%",
  });
  return (
    <div ref={ref} className="flex h-[100px] w-full items-end justify-center">
      <div className="relative" style={{ width: 182 * s, height: 40 * s }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={`h${i}`}>
            <div style={bg("/mc/gui/heart_container.png", 9, 9, i * 8)} />
            {i < 9 && <div style={bg(i === 8 ? "/mc/gui/heart_half.png" : "/mc/gui/heart_full.png", 9, 9, i * 8)} />}
          </div>
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <div key={`f${i}`} style={bg(i === 9 ? "/mc/gui/food_empty.png" : "/mc/gui/food_full.png", 9, 9, 173 - i * 8)} />
        ))}
        <div style={bg("/mc/gui/experience_bar_background.png", 182, 5, 0, 11)} />
        <div style={{ ...bg("/mc/gui/experience_bar_progress.png", 182, 5, 0, 11), clipPath: "inset(0 38% 0 0)" }} />
        <span className="absolute -translate-x-1/2 leading-none" style={{ left: 91 * s, top: 4.5 * s, fontSize: 8 * s }}>
          <McText>§a27</McText>
        </span>
        <div style={bg("/mc/gui/hotbar.png", 182, 22, 0, 18)} />
        <div style={bg("/mc/gui/hotbar_selection.png", 24, 23, -1, 17)} />
        {HOTBAR.map((h, i) => (
          <Stack key={i} item={h.item} count={h.count} x={3 + i * 20} y={21} s={s} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Alerts in chat                                                   */
/* ------------------------------------------------------------------ */

const ALERT_CHAT: { at: number; text: string }[] = [
  { at: 0, text: "§f<Steve> ktoś widział aftoxd na arenie?" },
  { at: 700, text: "§8[§fFG§8] §faftoxd §7nie przeszedł §fReach §8(A) §7VL §e3" },
  { at: 2000, text: "§f<Alex> bije mnie przez pół mapy xd" },
  { at: 2800, text: "§8[§fFG§8] §faftoxd §7nie przeszedł §fKillAura §8(C) §7VL §67" },
  { at: 3600, text: "§8[§fFG§8] §faftoxd §7nie przeszedł §fKillAura §8(C) §7VL §c12" },
  { at: 6900, text: "§8[§fFG§8] §7Teleportowano do §faftoxd" },
];

export function AlertsDemo({ t }: DemoProps) {
  const lines = ALERT_CHAT.filter((l) => t >= l.at);
  const hover = t > 4600 && t < 6700;

  return (
    <div className="flex h-full flex-col justify-end">
      <Crosshair />
      <div className="relative w-full max-w-[600px]">
        <AnimatePresence initial={false}>
          {lines.map((l, i) => {
            const target = i === 4;
            return (
              <motion.div key={l.text} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: EASE }} className="relative">
                <ChatLine className={target && hover ? "!bg-black/70" : ""}>
                  <McText>{l.text}</McText>
                </ChatLine>
                {target && (
                  <AnimatePresence>
                    {hover && (
                      <motion.div
                        initial={{ opacity: 0, x: 40, y: 30 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7, ease: EASE }}
                        className="absolute left-[62%] top-[55%] z-10"
                      >
                        <Cursor />
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.15 }} className="absolute bottom-full left-4 mb-[-4px]">
                          <Tooltip lines={["§faftoxd", "§7Check: §fKillAura §8(C)", "§7VL: §c12 §8| §7Ping: §f38 ms", "", "§eKliknij, aby się teleportować"]} size={13} />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="mt-4">
        <Hud />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Commands with vanilla style suggestions                          */
/* ------------------------------------------------------------------ */

const SUBS = ["ban", "gui", "info", "logs", "reload"];

const RUNS: { cmd: string; start: number; enter: number; out: string[] }[] = [
  {
    cmd: "/fg info aftoxd",
    start: 400,
    enter: 2000,
    out: [
      "§8» §fFraudGuard §8| §baftoxd",
      "§7Ping: §f38 ms §8| §7Klient: §f1.21.1 §8| §7Online: §f2h 14m",
      "§7Flagi (24h): §c17",
      "§8 » §fKillAura §8(C) §cx9",
      "§8 » §fReach §8(A) §6x6",
      "§8 » §fAutoClicker §8(F) §ex2",
    ],
  },
  {
    cmd: "/fg ban aftoxd KillAura",
    start: 4700,
    enter: 6600,
    out: ["§8[§fFG§8] §faftoxd §7został zbanowany §8» §cKillAura (C)", "§8[§fFG§8] §7Wpis dodany do historii i wysłany na Discorda"],
  },
];

export function CommandDemo({ t }: DemoProps) {
  const run = [...RUNS].reverse().find((r) => t >= r.start) ?? RUNS[0];
  const typed = t < run.enter ? run.cmd.slice(0, Math.max(0, Math.floor((t - run.start) / 55))) : "";
  const out = RUNS.filter((r) => t >= r.enter + 150).flatMap((r) => r.out.map((o, k) => ({ o, k, key: r.cmd + k, at: r.enter + 150 + k * 90 })));
  const shown = out.filter((l) => t >= l.at).slice(-8);

  // Suggestions appear while the sub command is being typed, like Brigadier in vanilla.
  const sub = typed.startsWith("/fg ") ? typed.slice(4) : null;
  const suggestions = sub !== null && !sub.includes(" ") ? SUBS.filter((x) => x.startsWith(sub)) : [];

  return (
    <div className="flex h-full flex-col justify-end">
      <Crosshair />
      <div className="w-full max-w-[600px]">
        <AnimatePresence initial={false}>
          {shown.map((l) => (
            <motion.div key={l.key} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: EASE }}>
              <ChatLine>
                <McText>{l.o}</McText>
              </ChatLine>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-3">
        <Hud />
      </div>
      <div className="relative mt-3">
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} className="absolute bottom-full left-[3.05em] mb-1 bg-black/80 px-1.5 py-1 text-[12px] leading-[16px] sm:text-[14px] sm:leading-[18px] lg:text-[15px]">
              {suggestions.map((x, i) => (
                <div key={x} className="font-pixel" style={{ color: i === 0 ? "#FFFF55" : "#AAAAAA" }}>
                  {x}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex h-[26px] items-center bg-black/50 px-1.5 text-[12px] sm:h-[30px] sm:text-[14px] lg:text-[15px]">
          {typed ? <McText>{typed}</McText> : null}
          {typed && sub !== null && suggestions[0] && sub.length > 0 && (
            <span className="font-pixel text-[#555555]">{suggestions[0].slice(sub.length)}</span>
          )}
          <span className="animate-blink font-pixel text-white">_</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. /fg gui: the real chest texture                                  */
/* ------------------------------------------------------------------ */

const GUI: { slot: number; item: SpriteName; lines: string[] }[] = [
  { slot: 4, item: "head", lines: ["§baftoxd", "§7Ping: §f38 ms", "§7Klient: §f1.21.1", "§7Online: §f2h 14m"] },
  { slot: 10, item: "sword", lines: ["§cWalka", "§7Flagi (24h): §c9", "§8KillAura, Reach"] },
  { slot: 11, item: "feather", lines: ["§bRuch", "§7Flagi (24h): §a0"] },
  { slot: 12, item: "grass", lines: ["§aŚwiat", "§7Flagi (24h): §e1", "§8Scaffold"] },
  { slot: 14, item: "book", lines: ["§fHistoria flag", "§7Ostatnie 30 dni", "", "§eKliknij, aby otworzyć"] },
  { slot: 15, item: "pearl", lines: ["§dTeleportuj", "", "§eKliknij"] },
  { slot: 16, item: "barrier", lines: ["§cZbanuj", "§7Powód: §fKillAura (C)", "", "§eShift + klik"] },
];
const ORDER = [1, 4, 6, 0, 2, 5];

export function GuiDemo({ t }: DemoProps) {
  const [ref, s] = useFit(176, 167, 3);
  const [manual, setManual] = useState<number | null>(null);
  const auto = ORDER[Math.min(ORDER.length - 1, Math.floor(Math.max(0, t - 300) / 1200))];
  const cur = manual ?? auto;
  const it = GUI[cur];
  const pos = (slot: number) => ({ x: 8 + (slot % 9) * 18, y: 18 + Math.floor(slot / 9) * 18 });
  const p = pos(it.slot);
  const label = { fontSize: 8 * s, lineHeight: 1, color: "#404040" } as const;

  return (
    <div ref={ref} className="flex h-full items-center justify-center" onPointerLeave={() => setManual(null)}>
      <div className="relative drop-shadow-[0_40px_60px_rgba(0,0,0,0.8)]" style={{ width: 176 * s, height: 167 * s }}>
        <div className="absolute inset-x-0 top-0" style={{ ...pixel, height: 71 * s, backgroundImage: "url(/mc/gui/generic_54.png)", backgroundSize: `${256 * s}px` }} />
        <div className="absolute inset-x-0" style={{ ...pixel, top: 71 * s, height: 96 * s, backgroundImage: "url(/mc/gui/generic_54.png)", backgroundSize: `${256 * s}px`, backgroundPosition: `0 ${-126 * s}px` }} />
        <span className="absolute font-pixel" style={{ ...label, left: 8 * s, top: 6 * s }}>
          FraudGuard » aftoxd
        </span>
        <span className="absolute font-pixel" style={{ ...label, left: 8 * s, top: 74 * s }}>
          Ekwipunek
        </span>

        {GUI.map((g, i) => {
          const q = pos(g.slot);
          return (
            <div key={g.slot} onPointerEnter={() => setManual(i)} className="absolute" style={{ left: q.x * s, top: q.y * s, width: 16 * s, height: 16 * s }}>
              <McItem name={g.item} head="aftoxd" className="size-full" />
              {i === cur && <span className="absolute inset-0 bg-white/50" />}
            </div>
          );
        })}
        {HOTBAR.map((h, i) => (
          <Stack key={i} item={h.item} count={h.count} x={8 + i * 18} y={143} s={s} />
        ))}

        <motion.div
          className="pointer-events-none absolute z-10"
          animate={{ left: (p.x + 11) * s, top: (p.y + 9) * s }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        >
          <Cursor />
          <div className={`absolute top-0 -translate-y-1/2 ${p.x > 110 ? "right-6" : "left-6"}`}>
            <Tooltip lines={it.lines} size={Math.round(7 * s)} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Discord channel                                                  */
/* ------------------------------------------------------------------ */

const EVENTS = [
  { at: 300, time: "21:42", title: "Nowa flaga", color: "#80848e", check: "Reach (A)", vl: 3, action: "Brak" },
  { at: 1900, time: "21:43", title: "Nowa flaga", color: "#fee75c", check: "KillAura (C)", vl: 12, action: "Brak" },
  { at: 3500, time: "21:43", title: "Gracz wyrzucony", color: "#f0b232", check: "KillAura (C)", vl: 15, action: "Kick" },
  { at: 5100, time: "21:44", title: "Gracz zbanowany", color: "#ed4245", check: "KillAura (C)", vl: 20, action: "Ban permanentny" },
];

export function DiscordDemo({ t }: DemoProps) {
  const shown = EVENTS.filter((e) => t >= e.at).slice(-3);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex h-full w-full max-w-[560px] flex-col overflow-hidden rounded-xl bg-[#313338] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_40px_80px_-30px_rgba(0,0,0,0.9)]">
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-black/30 px-4 text-[14px] font-semibold text-[#f2f3f5]">
          <span className="text-[20px] font-normal text-[#80848e]">#</span>
          fraudguard-alerty
        </div>
        <div className="flex flex-1 flex-col justify-end gap-4 overflow-hidden px-4 pb-4 [mask-image:linear-gradient(to_bottom,transparent,black_18%)]">
          <AnimatePresence initial={false}>
            {shown.map((e) => (
              <motion.div
                key={e.at}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="flex gap-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white">
                  <LogoMark className="size-[18px] text-[#111]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[13.5px]">
                    <span className="font-semibold text-[#f2f3f5]">FraudGuard</span>
                    <span className="rounded bg-[#5865f2] px-1 text-[9.5px] font-semibold leading-[15px] text-white">APP</span>
                    <span className="ml-1 text-[11.5px] text-[#949ba4]">dziś o {e.time}</span>
                  </div>
                  <div className="mt-1.5 flex gap-3 rounded border-l-4 bg-[#2b2d31] px-3 py-2.5" style={{ borderColor: e.color }}>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-semibold text-[#f2f3f5]">{e.title}</div>
                      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px] sm:grid-cols-3">
                        {[
                          ["Gracz", "aftoxd"],
                          ["Check", e.check],
                          ["VL", String(e.vl)],
                          ["Akcja", e.action],
                        ].map(([k, v]) => (
                          <div key={k} className="min-w-0">
                            <div className="font-semibold text-[#f2f3f5]">{k}</div>
                            <div className="truncate text-[#b5bac1]">{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <McHead name="aftoxd" className="size-10 shrink-0 rounded sm:size-12" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Web panel config                                                 */
/* ------------------------------------------------------------------ */

const CFG = [
  { name: "KillAura", cat: "Walka" },
  { name: "Reach", cat: "Walka" },
  { name: "Fly", cat: "Ruch" },
  { name: "Speed", cat: "Ruch" },
  { name: "Scaffold", cat: "Świat" },
  { name: "Timer", cat: "Pakiety" },
];
const EDITS: { row: number; kind: "sens" | "toggle"; to: number | boolean }[] = [
  { row: 0, kind: "sens", to: 3 },
  { row: 4, kind: "toggle", to: true },
  { row: 4, kind: "sens", to: 2 },
  { row: 2, kind: "sens", to: 1 },
];

export function ConfigDemo({ t }: DemoProps) {
  const step = Math.min(EDITS.length, Math.floor(Math.max(0, t - 300) / 1500) + (t > 300 ? 1 : 0));
  const on = [true, true, true, true, false, true];
  const sens = [2, 2, 2, 2, 1, 2];
  EDITS.slice(0, step).forEach((e) => {
    if (e.kind === "toggle") on[e.row] = e.to as boolean;
    else sens[e.row] = e.to as number;
  });
  const last = step > 0 ? EDITS[step - 1] : null;

  return (
    <FitBox>
      <div className="relative w-full rounded-2xl bg-[#0e0f12] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.09),0_40px_80px_-30px_rgba(0,0,0,0.9)] sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[15px] font-medium">Checki</div>
            <div className="text-[12px] text-dim">Survival · SkyBlock · BoxPvP</div>
          </div>
          <span className="flex items-center gap-2 rounded-full px-2.5 py-1 text-[11.5px] text-muted shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <span className="size-1.5 animate-pulse-dot rounded-full bg-ok text-ok/50" />3 serwery
          </span>
        </div>
        <div className="mt-4 divide-y divide-line/70 overflow-hidden rounded-xl shadow-[0_0_0_1px_rgba(255,255,255,0.07)]">
          {CFG.map((c, i) => (
            <div key={c.name} className={`relative flex items-center gap-4 px-3 py-2 transition-colors duration-500 sm:px-4 sm:py-2.5 ${last?.row === i ? "bg-white/[0.05]" : ""}`}>
              <div className="w-20 shrink-0 sm:w-28">
                <div className="text-[13px]">{c.name}</div>
                <div className="text-[11px] text-dim">{c.cat}</div>
              </div>
              <div className="flex flex-1 items-center gap-1.5">
                {[1, 2, 3].map((lvl) => (
                  <motion.span
                    key={lvl}
                    className="h-1 flex-1 rounded-full"
                    animate={{ backgroundColor: on[i] && sens[i] >= lvl ? "rgba(247,248,248,0.85)" : "rgba(255,255,255,0.08)" }}
                    transition={{ duration: 0.4 }}
                  />
                ))}
              </div>
              <span className={`relative h-[18px] w-8 shrink-0 rounded-full transition-colors duration-300 ${on[i] ? "bg-fg" : "bg-white/[0.12]"}`}>
                <motion.span
                  className={`absolute top-0.5 size-[14px] rounded-full ${on[i] ? "bg-bg" : "bg-white/70"}`}
                  animate={{ left: on[i] ? 16 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 32 }}
                />
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 h-9">
          <AnimatePresence mode="wait">
            {last && (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="flex h-9 items-center gap-2 rounded-lg bg-white/[0.04] px-3 text-[12.5px] text-muted"
              >
                <span className="size-1.5 rounded-full bg-ok" />
                <span className="truncate">
                  <span className="text-fg">{CFG[last.row].name}</span> zapisany, wysłano na 3 serwery bez restartu
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </FitBox>
  );
}
