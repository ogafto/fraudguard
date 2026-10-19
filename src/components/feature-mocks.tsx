"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { McGui, McItem, McScene, McSlot, McText, McTooltip, type SpriteName } from "./mc-ui";
import { EASE } from "./ui";

/* ------------------------------------------------------------------ */
/* 1. In-game alerts                                                   */
/* ------------------------------------------------------------------ */

const ALERTS = [
  "§8[§fFG§8] §cxX_Sn1per_Xx §7nie przeszedł §fKillAura §8(C) §7x3 §8[§cVL 14§8]",
  "§7<§fSteve§7> §fktoś widział tego gościa na spawnie?",
  "§8[§fFG§8] §eq1ckscope §7nie przeszedł §fReach §8(A) §7· §f3.41 bl. §8[§eVL 6§8]",
  "§8[§fFG§8] §6Dr34mer §7nie przeszedł §fFly §8(B) §8[§6VL 9§8]",
  "§8[§fFG§8] §cxX_Sn1per_Xx §7nie przeszedł §fKillAura §8(C) §7x5 §8[§cVL 17§8]",
  "§c§lFraudGuard §8» §7Gracz §cxX_Sn1per_Xx §7został zbanowany za cheaty.",
  "§7<§fAlex§7> §fw końcu xd",
];

export function InGameAlerts() {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref, { margin: "-15% 0px" });
  const [n, setN] = useState(3);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setN((v) => v + 1), 1700);
    return () => clearInterval(id);
  }, [active]);

  const lines = Array.from({ length: Math.min(n, 6) }, (_, i) => {
    const k = n - Math.min(n, 6) + i;
    return { k, text: ALERTS[k % ALERTS.length] };
  });
  const last = lines[lines.length - 1];
  const showTip = last.text.includes("nie przeszedł");

  return (
    <div ref={ref}>
      <McScene className="aspect-[16/10]">
        <div className="absolute bottom-[29%] left-[3%] w-[min(78%,520px)]">
          <div className="flex flex-col">
            <AnimatePresence initial={false}>
              {lines.map((l) => (
                <motion.div
                  key={l.k}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="bg-black/45 px-1.5 py-[1px] text-[clamp(10px,1.25vw,14px)] leading-[1.45]"
                >
                  <McText>{l.text}</McText>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {showTip && (
              <motion.div
                key={last.k}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute -top-2 left-[55%] hidden -translate-y-full sm:block"
              >
                <McTooltip
                  title="§eKliknij, aby się teleportować"
                  lines={["§7Ping: §f38 ms", "§7TPS: §a20.0", "§7Klient: §fForge 1.20.4"]}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </McScene>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Staff commands                                                   */
/* ------------------------------------------------------------------ */

export const COMMANDS: { cmd: string; desc: string; out: string[] }[] = [
  {
    cmd: "/fg info xX_Sn1per_Xx",
    desc: "Profil gracza i jego naruszenia",
    out: [
      "§8§m          §r §fFraudGuard §8§m          ",
      "§7Gracz: §fxX_Sn1per_Xx §8(Java 1.20.4, Forge)",
      "§7Ping: §f38 ms §8| §7Na serwerze: §f2h 14m",
      "§7Naruszenia (24h): §c17",
      " §8▪ §fKillAura C §8· §c9",
      " §8▪ §fReach A §8· §e6",
      " §8▪ §fAutoClicker F §8· §72",
    ],
  },
  {
    cmd: "/fg alerts",
    desc: "Włącza lub wyłącza alerty na czacie",
    out: ["§8[§fFG§8] §7Alerty: §awłączone", "§8[§fFG§8] §7Widzisz flagi od §fVL 3 §7w górę."],
  },
  {
    cmd: "/fg logs q1ckscope",
    desc: "Historia flag z ostatnich dni",
    out: [
      "§8[§fFG§8] §7Ostatnie flagi gracza §fq1ckscope§7:",
      " §821:36 §fReach A §7· §e3.41 bl.",
      " §821:31 §fReach A §7· §e3.18 bl.",
      " §8wczoraj §fAimAssist B §7· §e88%",
      "§8[§fFG§8] §7Strona §f1/4 §8· §e[Następna]",
    ],
  },
  {
    cmd: "/fg ban xX_Sn1per_Xx 30d",
    desc: "Ręczny ban z powodem i czasem",
    out: [
      "§8[§fFG§8] §7Zbanowano §cxX_Sn1per_Xx §7na §f30 dni §8(§fKillAura C§8)",
      "§c§lFraudGuard §8» §7Gracz §cxX_Sn1per_Xx §7został zbanowany za cheaty.",
    ],
  },
  {
    cmd: "/fg reload",
    desc: "Przeładowanie konfiguracji bez restartu",
    out: ["§8[§fFG§8] §aPrzeładowano konfigurację §8(124 checki, 38 ms)"],
  },
];

export function CommandsMock({ index, active }: { index: number; active: boolean }) {
  const c = COMMANDS[index];
  const [typed, setTyped] = useState(0);
  const [shown, setShown] = useState(0);

  // Remounted per command (keyed by index), so state starts empty each time.
  useEffect(() => {
    if (!active) return;
    let t = 0;
    let o = 0;
    let out: ReturnType<typeof setInterval> | undefined;
    const type = setInterval(() => {
      t++;
      setTyped(t);
      if (t >= c.cmd.length) {
        clearInterval(type);
        out = setInterval(() => {
          o++;
          setShown(o);
          if (o >= c.out.length) clearInterval(out);
        }, 140);
      }
    }, 35);
    return () => {
      clearInterval(type);
      clearInterval(out);
    };
  }, [active, c.cmd.length, c.out.length]);

  const done = typed >= c.cmd.length;

  return (
    <McScene className="aspect-[16/10]" hud={false}>
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute bottom-[13%] left-[3%] right-[3%] flex flex-col">
        {c.out.slice(0, shown).map((l, i) => (
          <motion.div
            key={`${index}-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-fit max-w-full bg-black/45 px-1.5 py-[1px] text-[clamp(10px,1.25vw,14px)] leading-[1.45]"
          >
            <McText>{l}</McText>
          </motion.div>
        ))}
      </div>
      <div className="absolute inset-x-[1.5%] bottom-[3%] flex h-[7%] items-center bg-black/60 px-2 text-[clamp(10px,1.3vw,15px)]">
        <McText>{done ? "" : `§f${c.cmd.slice(0, typed)}`}</McText>
        <span className="ml-[1px] font-pixel text-white animate-blink">_</span>
      </div>
    </McScene>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Player GUI                                                       */
/* ------------------------------------------------------------------ */

const GUI_ITEMS: { slot: number; item: SpriteName; title: string; lines: string[] }[] = [
  { slot: 4, item: "head", title: "§fxX_Sn1per_Xx", lines: ["§7Wersja: §f1.20.4 §8(Forge)", "§7Ping: §f38 ms", "§7Na serwerze: §f2h 14m"] },
  { slot: 10, item: "sword", title: "§cWalka", lines: ["§7Flagi (24h): §c9", "§8▪ §7KillAura C §8· §c6", "§8▪ §7Reach A §8· §e3"] },
  { slot: 11, item: "feather", title: "§bRuch", lines: ["§7Flagi (24h): §a0", "§7Brak podejrzanych ruchów."] },
  { slot: 12, item: "grass", title: "§aŚwiat", lines: ["§7Flagi (24h): §e1", "§8▪ §7Scaffold D §8· §e1"] },
  { slot: 13, item: "clock", title: "§ePakiety", lines: ["§7Flagi (24h): §e2", "§8▪ §7Timer A §8· §e2"] },
  { slot: 15, item: "book", title: "§fHistoria", lines: ["§7Wszystkie flagi z 30 dni", "§eKliknij, aby otworzyć"] },
  { slot: 16, item: "pearl", title: "§dTeleportuj", lines: ["§7Przenieś się do gracza", "§eKliknij"] },
  { slot: 22, item: "barrier", title: "§cZbanuj", lines: ["§7Powód: §fKillAura C", "§7Czas: §f30 dni", "§eShift + klik, aby potwierdzić"] },
];

export function PlayerGui() {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref, { margin: "-15% 0px" });
  const [cur, setCur] = useState(1);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!active || hover) return;
    const id = setInterval(() => setCur((c) => (c + 1) % GUI_ITEMS.length), 2200);
    return () => clearInterval(id);
  }, [active, hover]);

  const it = GUI_ITEMS[cur];
  const col = it.slot % 9;
  const row = Math.floor(it.slot / 9);

  return (
    <div ref={ref}>
      <McScene className="aspect-[16/10]" hud={false}>
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 flex items-center justify-center p-[4%]">
          <McGui title="FraudGuard » xX_Sn1per_Xx" className="w-[min(100%,440px)]">
            <div
              className="relative grid grid-cols-9 gap-[2px]"
              onPointerEnter={() => setHover(true)}
              onPointerLeave={() => setHover(false)}
            >
              {Array.from({ length: 27 }, (_, s) => {
                const gi = GUI_ITEMS.findIndex((g) => g.slot === s);
                const g = GUI_ITEMS[gi];
                return (
                  <McSlot key={s} active={gi === cur} onEnter={g ? () => setCur(gi) : undefined}>
                    {g ? (
                      <McItem name={g.item} head="xX_Sn1per_Xx" className="size-[68%]" />
                    ) : (
                      <span className="absolute inset-[2px] bg-[#3b3b3b]/40" />
                    )}
                  </McSlot>
                );
              })}

              {/* Cursor + tooltip follow the active slot */}
              <motion.div
                className="pointer-events-none absolute z-10"
                animate={{ left: `${((col + 0.6) / 9) * 100}%`, top: `${((row + 0.55) / 3) * 100}%` }}
                transition={{ type: "spring", stiffness: 160, damping: 22 }}
              >
                <svg viewBox="0 0 10 14" className="size-4" shapeRendering="crispEdges" aria-hidden>
                  <path d="M0 0h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1H6v1h1v2H6v1H5v-2H4v-1H3v1H2v1H1v1H0Z" fill="#fff" stroke="#000" strokeWidth="0.6" />
                </svg>
                <div className={`absolute top-3 ${col > 5 ? "right-4" : "left-4"}`}>
                  <McTooltip title={it.title} lines={it.lines} className="whitespace-nowrap" />
                </div>
              </motion.div>
            </div>
          </McGui>
        </div>
      </McScene>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/* 4. Discord channel                                                  */
/* ------------------------------------------------------------------ */

const EMBEDS = [
  { title: "Gracz zbanowany", color: "#ed4245", player: "xX_Sn1per_Xx", check: "KillAura (C)", vl: "17/15", server: "Survival EU" },
  { title: "Gracz wyrzucony", color: "#fee75c", player: "BlockBreaker", check: "Scaffold (D)", vl: "12/15", server: "SkyBlock" },
  { title: "Nowa flaga", color: "#80848e", player: "q1ckscope", check: "Reach (A)", vl: "6/15", server: "BoxPvP" },
  { title: "Gracz zbanowany", color: "#ed4245", player: "Dr34mer", check: "Fly (B)", vl: "16/15", server: "Survival EU" },
];

export function DiscordChannel() {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref, { margin: "-15% 0px" });
  const [n, setN] = useState(2);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setN((v) => v + 1), 2600);
    return () => clearInterval(id);
  }, [active]);
  const shown = Array.from({ length: Math.min(n, 3) }, (_, i) => n - Math.min(n, 3) + i);

  return (
    <div ref={ref} className="flex aspect-[16/10] w-full overflow-hidden bg-[#313338] text-left text-[#dbdee1]">
      <aside className="hidden w-[26%] shrink-0 flex-col bg-[#2b2d31] p-3 sm:flex">
        <div className="mb-3 truncate border-b border-black/30 pb-3 text-[13px] font-semibold text-white">Survival.pl</div>
        {["ogólny", "fraudguard-alerty", "zgłoszenia", "ogłoszenia"].map((c) => (
          <div
            key={c}
            className={`mb-0.5 flex items-center gap-1.5 truncate rounded px-2 py-1 text-[12.5px] ${c === "fraudguard-alerty" ? "bg-[#404249] text-white" : "text-[#949ba4]"}`}
          >
            <span className="text-[15px] leading-none text-[#80848e]">#</span>
            {c}
          </div>
        ))}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1.5 border-b border-black/25 px-4 py-2.5 text-[13px] font-semibold text-white">
          <span className="text-[17px] leading-none text-[#80848e]">#</span>fraudguard-alerty
        </div>
        <div className="flex flex-1 flex-col justify-end gap-3 overflow-hidden px-4 pb-4">
          <AnimatePresence initial={false}>
            {shown.map((k) => {
              const e = EMBEDS[k % EMBEDS.length];
              return (
                <motion.div
                  key={k}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className="flex gap-3"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-white">
                    <svg viewBox="0 0 240 240" className="size-4" aria-hidden>
                      <path fill="#111" d="M84.66,50.83L178.06,50.83L198.17,16L24.33,16ZM135.2,154.34L80.05,58.81L19.72,23.98L135.2,224ZM142.47,92.6L134.07,107.14L142.47,121.69L163.27,121.69L144.42,154.34L144.42,224L220.28,92.6Z" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[13px]">
                      <span className="font-semibold text-white">FraudGuard</span>
                      <span className="rounded bg-[#5865f2] px-1 text-[9.5px] font-semibold text-white">APP</span>
                      <span className="text-[11px] text-[#949ba4]">dziś o 21:{37 + (k % 20)}</span>
                    </div>
                    <div className="mt-1.5 max-w-[420px] rounded border-l-4 bg-[#2b2d31] p-3" style={{ borderColor: e.color }}>
                      <div className="text-[13px] font-semibold text-white">{e.title}</div>
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px] sm:grid-cols-4">
                        {[
                          ["Gracz", e.player],
                          ["Check", e.check],
                          ["VL", e.vl],
                          ["Serwer", e.server],
                        ].map(([kk, v]) => (
                          <div key={kk} className="min-w-0">
                            <div className="font-semibold text-[#dbdee1]">{kk}</div>
                            <div className="truncate text-[#b5bac1]">{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Live config                                                      */
/* ------------------------------------------------------------------ */

const CFG = [
  { name: "KillAura", cat: "Walka" },
  { name: "Reach", cat: "Walka" },
  { name: "Fly", cat: "Ruch" },
  { name: "Speed", cat: "Ruch" },
  { name: "Scaffold", cat: "Świat" },
  { name: "Timer", cat: "Pakiety" },
];

export function LiveConfig() {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref, { margin: "-15% 0px" });
  const [on, setOn] = useState([true, true, true, true, false, true]);
  const [sens, setSens] = useState([3, 2, 2, 2, 1, 2]);
  const [toast, setToast] = useState<{ k: number; text: string } | null>(null);
  const [cursor, setCursor] = useState(4);

  useEffect(() => {
    if (!active) return;
    let step = 0;
    const id = setInterval(() => {
      step++;
      const i = (step * 3) % CFG.length;
      setCursor(i);
      if (step % 2) {
        setOn((o) => o.map((v, j) => (j === i ? !v : v)));
        setToast({ k: step, text: `${CFG[i].name} zapisany · zastosowano na 3 serwerach w 0,4 s` });
      } else {
        setSens((s) => s.map((v, j) => (j === i ? (v % 3) + 1 : v)));
        setToast({ k: step, text: `${CFG[i].name}: zmieniono czułość · bez restartu` });
      }
    }, 2400);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div ref={ref} className="relative flex aspect-[16/10] w-full flex-col bg-[#0b0c0e] p-4 text-left sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[15px] font-medium">Checki</div>
          <div className="text-[12px] text-dim">Survival EU · SkyBlock · BoxPvP</div>
        </div>
        <span className="rounded-full px-2.5 py-1 text-[11.5px] text-muted shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">3 serwery połączone</span>
      </div>
      <div className="mt-3 flex-1 divide-y divide-line/70 overflow-hidden rounded-xl shadow-[0_0_0_1px_rgba(255,255,255,0.07)]">
        {CFG.map((c, i) => (
          <div key={c.name} className={`relative flex items-center gap-4 px-4 py-[7px] transition-colors duration-500 ${cursor === i ? "bg-white/[0.04]" : ""}`}>
            <div className="w-24 sm:w-28">
              <div className="text-[13px]">{c.name}</div>
              <div className="text-[11px] text-dim">{c.cat}</div>
            </div>
            <div className="flex flex-1 items-center gap-1.5">
              {[1, 2, 3].map((lvl) => (
                <motion.span
                  key={lvl}
                  className="h-1 flex-1 rounded-full"
                  animate={{ backgroundColor: on[i] && sens[i] >= lvl ? "rgba(247,248,248,0.8)" : "rgba(255,255,255,0.08)" }}
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
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.k}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="absolute bottom-5 right-5 flex items-center gap-2 rounded-xl bg-[#16171a] px-3.5 py-2.5 text-[12.5px] shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_20px_40px_-15px_rgba(0,0,0,0.9)]"
          >
            <span className="size-1.5 rounded-full bg-ok" />
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Cycles through the staff commands on its own. */
export function CommandsAuto() {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref, { margin: "-15% 0px" });
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % COMMANDS.length), 5200);
    return () => clearInterval(id);
  }, [active]);
  return (
    <div ref={ref}>
      <CommandsMock key={index} index={index} active={active} />
    </div>
  );
}
