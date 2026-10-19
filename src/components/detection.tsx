"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CHECK_CATEGORIES } from "@/lib/checks";
import { LogoMark } from "./logo";
import { McItem, type SpriteName } from "./mc-ui";
import { EASE, Reveal, SectionHeading } from "./ui";

const ICONS: SpriteName[] = ["sword", "feather", "grass", "clock"];
const PERIOD = 8; // seconds per radar sweep
const RADII = [118, 178, 236, 148, 206, 258];

type Node = { cat: number; idx: number; angle: number; r: number; x: number; y: number };

const NODES: Node[] = CHECK_CATEGORIES.flatMap((c, ci) =>
  c.checks.map((_, j) => {
    const angle = ci * 90 + 12 + j * (66 / (c.checks.length - 1));
    const r = RADII[j % RADII.length];
    const rad = (angle * Math.PI) / 180;
    return { cat: ci, idx: j, angle, r, x: Math.round(Math.sin(rad) * r * 10) / 10, y: Math.round(-Math.cos(rad) * r * 10) / 10 };
  }),
);

const wedge = (from: number, to: number, R: number) => {
  const p = (a: number) => {
    const rad = (a * Math.PI) / 180;
    return `${(Math.sin(rad) * R).toFixed(1)},${(-Math.cos(rad) * R).toFixed(1)}`;
  };
  return `M0,0 L${p(from)} A${R},${R} 0 0 1 ${p(to)} Z`;
};

function Radar({
  cat,
  sel,
  onPick,
}: {
  cat: number;
  sel: { cat: number; idx: number };
  onPick: (cat: number, idx: number) => void;
}) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[600px]">
      {/* sweeping beam (HTML conic gradient rotating behind the SVG) */}
      <div className="absolute inset-[6%] overflow-hidden rounded-full">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent 0deg, transparent 290deg, rgba(255,255,255,0.03) 320deg, rgba(255,255,255,0.16) 359deg, transparent 360deg)",
            animation: `radar-spin ${PERIOD}s linear infinite`,
          }}
        />
        <div className="absolute left-1/2 top-0 h-1/2 w-px origin-bottom bg-gradient-to-t from-transparent to-white/70" style={{ animation: `radar-spin ${PERIOD}s linear infinite` }} />
      </div>

      <svg viewBox="-300 -300 600 600" className="relative size-full overflow-visible">
        {/* rings + cross */}
        {[70, 140, 210, 270].map((r) => (
          <circle key={r} r={r} fill="none" stroke="rgba(255,255,255,0.07)" />
        ))}
        <line x1="-282" x2="282" y1="0" y2="0" stroke="rgba(255,255,255,0.05)" />
        <line y1="-282" y2="282" x1="0" x2="0" stroke="rgba(255,255,255,0.05)" />
        {Array.from({ length: 72 }, (_, i) => {
          const a = (i * 5 * Math.PI) / 180;
          const r1 = i % 3 === 0 ? 262 : 266;
          return (
            <line
              key={i}
              x1={(Math.sin(a) * r1).toFixed(1)}
              y1={(-Math.cos(a) * r1).toFixed(1)}
              x2={(Math.sin(a) * 270).toFixed(1)}
              y2={(-Math.cos(a) * 270).toFixed(1)}
              stroke="rgba(255,255,255,0.18)"
            />
          );
        })}

        {/* active quadrant */}
        <motion.g animate={{ rotate: cat * 90 }} transition={{ type: "spring", stiffness: 70, damping: 16 }}>
          <path d={wedge(0, 90, 270)} fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.12)" />
        </motion.g>

        {/* quadrant labels */}
        {CHECK_CATEGORIES.map((c, i) => {
          const a = ((i * 90 + 45) * Math.PI) / 180;
          return (
            <text
              key={c.id}
              x={(Math.sin(a) * 292).toFixed(1)}
              y={(-Math.cos(a) * 292).toFixed(1)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="13"
              fill={i === cat ? "#f7f8f8" : "rgba(255,255,255,0.35)"}
              style={{ transition: "fill .4s" }}
            >
              {c.label}
            </text>
          );
        })}

        {/* nodes */}
        {NODES.map((n) => {
          const isSel = sel.cat === n.cat && sel.idx === n.idx;
          const inCat = n.cat === cat;
          const name = CHECK_CATEGORIES[n.cat].checks[n.idx].name;
          return (
            <g
              key={`${n.cat}-${n.idx}`}
              transform={`translate(${n.x} ${n.y})`}
              onPointerEnter={() => onPick(n.cat, n.idx)}
              className="cursor-pointer"
            >
              <circle r="16" fill="transparent" />
              {isSel && (
                <circle r="9" fill="none" stroke="#fff" strokeOpacity="0.6">
                  <animate attributeName="r" from="7" to="22" dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="stroke-opacity" from="0.7" to="0" dur="1.6s" repeatCount="indefinite" />
                </circle>
              )}
              <rect
                x={isSel ? -5.5 : -3.5}
                y={isSel ? -5.5 : -3.5}
                width={isSel ? 11 : 7}
                height={isSel ? 11 : 7}
                fill={isSel ? "#f7f8f8" : inCat ? "rgba(247,248,248,0.85)" : "rgba(247,248,248,0.5)"}
                className="radar-node"
                style={{ animation: `radar-ping ${PERIOD}s linear infinite`, animationDelay: `${(n.angle / 360) * PERIOD}s` }}
              />
              <text
                x={n.x >= 0 ? 12 : -12}
                y="4"
                textAnchor={n.x >= 0 ? "start" : "end"}
                fontSize="12"
                fill={isSel ? "#f7f8f8" : "rgba(255,255,255,0.55)"}
                style={{ opacity: inCat ? 1 : 0, transition: "opacity .5s, fill .3s" }}
              >
                {name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* center */}
      <div className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-bg shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_0_40px_-4px_rgba(255,255,255,0.25)]">
        <LogoMark className="size-6 text-fg" />
      </div>
      <style>{`
        @keyframes radar-spin { to { transform: rotate(360deg); } }
        @keyframes radar-ping {
          0% { opacity: 1; filter: drop-shadow(0 0 6px rgba(255,255,255,0.9)); }
          12% { opacity: 0.9; }
          40%, 100% { opacity: 0.45; filter: none; }
        }
      `}</style>
    </div>
  );
}

export function Detection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const [sel, setSel] = useState({ cat: 0, idx: 0 });
  const [auto, setAuto] = useState(true);

  // Walk through every check until the visitor takes over.
  useEffect(() => {
    if (!inView || !auto) return;
    const id = setInterval(() => {
      setSel((s) => {
        const len = CHECK_CATEGORIES[s.cat].checks.length;
        return s.idx + 1 < len ? { cat: s.cat, idx: s.idx + 1 } : { cat: (s.cat + 1) % CHECK_CATEGORIES.length, idx: 0 };
      });
    }, 2200);
    return () => clearInterval(id);
  }, [inView, auto]);

  const pick = (cat: number, idx: number) => {
    setAuto(false);
    setSel({ cat, idx });
  };
  const check = CHECK_CATEGORIES[sel.cat].checks[sel.idx];

  return (
    <section ref={ref} id="detection" className="relative px-4 py-28 sm:px-6 md:py-40">
      <div className="mx-auto grid max-w-[1200px] items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <SectionHeading eyebrow="Wykrywanie" title={["124 checki.", "\n", "Cztery warstwy ochrony."]}>
            Najedź na punkt na radarze albo wybierz kategorię, żeby zobaczyć, co dokładnie wykrywa FraudGuard.
          </SectionHeading>

          <Reveal delay={0.15} className="mt-10">
            <div className="grid grid-cols-2 gap-2">
              {CHECK_CATEGORIES.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => pick(i, 0)}
                  className={`relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-colors ${sel.cat === i ? "" : "hover:bg-white/[0.025]"}`}
                >
                  {sel.cat === i && (
                    <motion.span
                      layoutId="det-cat"
                      className="absolute inset-0 rounded-2xl bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(255,255,255,0.12)]"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                  <McItem name={ICONS[i]} className="relative size-7" />
                  <span className="relative">
                    <span className={`block text-[15px] font-medium transition-colors ${sel.cat === i ? "text-fg" : "text-muted"}`}>{c.label}</span>
                    <span className="block text-[12.5px] text-dim">{c.checks.length} checków</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="card relative mt-4 min-h-[156px] overflow-hidden p-6">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${sel.cat}-${sel.idx}`}
                  initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[22px] font-medium tracking-[-0.02em]">{check.name}</span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[12px] font-medium ${check.status === "beta" ? "bg-warn/10 text-warn" : "bg-white/[0.06] text-muted"}`}
                    >
                      {check.status}
                    </span>
                  </div>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{check.desc}</p>
                  <div className="mt-4 flex gap-4 text-[13px] text-dim">
                    <span>{CHECK_CATEGORIES[sel.cat].label}</span>
                    <span>
                      {check.types} {check.types === 1 ? "typ" : check.types < 5 ? "typy" : "typów"} detekcji
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
              {auto && (
                <motion.span
                  key={`bar-${sel.cat}-${sel.idx}`}
                  className="absolute bottom-0 left-0 h-px bg-white/50"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.2, ease: "linear" }}
                />
              )}
            </div>
          </Reveal>
        </div>

        <Reveal from="scale" delay={0.1}>
          <motion.div initial={{ rotate: -25 }} whileInView={{ rotate: 0 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: EASE }}>
            <Radar cat={sel.cat} sel={sel} onPick={pick} />
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
