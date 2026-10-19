"use client";

import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Button, EASE, Reveal, SectionHeading } from "./ui";

type Billing = "monthly" | "lifetime";

const PLANS = [
  {
    name: "Starter",
    desc: "Dla jednego serwera, który chce spokoju od pierwszego dnia.",
    limit: 1,
    price: { monthly: 29, lifetime: 149 },
    features: ["1 serwer", "Checki walki i ruchu", "Alerty w grze i komendy", "Aktualizacje", "Wsparcie na Discordzie"],
  },
  {
    name: "Pro",
    desc: "Pełna ochrona dla rosnących społeczności.",
    limit: 3,
    price: { monthly: 59, lifetime: 299 },
    features: ["Do 3 serwerów", "Wszystkie checki", "Panel webowy i statystyki", "Alerty na Discordzie", "Java + Bedrock", "Priorytetowe wsparcie"],
  },
  {
    name: "Network",
    desc: "Dla sieci serwerów z proxy i własnymi wymaganiami.",
    limit: Infinity,
    price: { monthly: 129, lifetime: 599 },
    features: ["Bez limitu serwerów", "Synchronizacja Velocity / Bungee", "Własne checki na zamówienie", "API i integracje", "Dedykowany opiekun"],
  },
];

/* ------------------------------------------------------------------ */
/* Odometer: each digit rolls to its new value                         */
/* ------------------------------------------------------------------ */

function Digit({ d }: { d: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden">
      <motion.span
        className="absolute left-0 top-0 flex flex-col"
        animate={{ y: `${-d * 10}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block h-[1em] leading-[1em]">
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function Odometer({ value }: { value: number }) {
  const digits = String(value).split("").map(Number);
  return (
    <span className="inline-flex tabular-nums leading-[1em]">
      <AnimatePresence initial={false} mode="popLayout">
        {digits.map((d, i) => (
          <motion.span
            key={digits.length - i}
            initial={{ opacity: 0, y: "0.3em" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-0.3em" }}
            transition={{ duration: 0.3 }}
          >
            <Digit d={d} />
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Card that tilts towards the cursor with a moving sheen              */
/* ------------------------------------------------------------------ */

function TiltCard({ children, className, highlight }: { children: ReactNode; className?: string; highlight: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [6, -6]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(px, [0, 1], [-6, 6]), { stiffness: 200, damping: 20 });
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const sheen = useMotionTemplate`radial-gradient(420px circle at ${gx} ${gy}, rgba(255,255,255,0.07), transparent 50%)`;

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const r = ref.current!.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };

  return (
    <div className="[perspective:1200px]">
      <motion.div
        ref={ref}
        onPointerMove={move}
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
        }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        animate={{ y: highlight ? -10 : 0, opacity: highlight ? 1 : 0.62, scale: highlight ? 1.015 : 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className={`card relative h-full ${highlight ? "bg-white/[0.045]" : ""} ${className ?? ""}`}
      >
        <motion.div className="pointer-events-none absolute inset-0 rounded-[16px]" style={{ background: sheen }} />
        {highlight && <span className="badge-ring pointer-events-none absolute inset-0 rounded-[16px]" />}
        {children}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export function Pricing() {
  const [servers, setServers] = useState(2);
  const [billing, setBilling] = useState<Billing>("monthly");
  const recommended = servers <= 1 ? 0 : servers <= 3 ? 1 : 2;
  const fill = ((servers - 1) / 11) * 100;

  return (
    <section id="pricing" className="relative px-4 py-28 sm:px-6 md:py-40">
      <div className="pointer-events-none absolute left-1/2 top-40 -z-10 h-[520px] w-[1000px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_65%)]" />
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col items-center">
          <SectionHeading center eyebrow="Cennik" title={["Dobierz plan", "\n", "do swojego serwera."]}>
            Przesuń suwak, a podświetlimy plan, który pasuje do Ciebie najlepiej.
          </SectionHeading>
        </div>

        {/* Configurator */}
        <Reveal from="scale" delay={0.1} className="mx-auto mt-12 max-w-[820px]">
          <div className="card flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-10 sm:p-7">
            <div className="flex-1">
              <div className="flex items-end justify-between">
                <span className="text-[14px] text-muted">Ile serwerów chcesz chronić?</span>
                <span className="text-[34px] font-medium leading-none tracking-[-0.03em]">
                  <Odometer value={servers} />
                  {servers === 12 && <span className="text-muted">+</span>}
                </span>
              </div>
              <div className="relative mt-5 h-6">
                <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/[0.07]" />
                <motion.div
                  className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-white/40 to-white"
                  animate={{ width: `${fill}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                {[1, 3].map((m) => (
                  <span
                    key={m}
                    className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-white/30"
                    style={{ left: `${((m - 0.5) / 11) * 100}%` }}
                  />
                ))}
                <motion.span
                  className="pointer-events-none absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg shadow-[0_0_0_4px_rgba(255,255,255,0.12)]"
                  animate={{ left: `${fill}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={servers}
                  onChange={(e) => setServers(Number(e.target.value))}
                  className="absolute inset-0 w-full cursor-pointer opacity-0"
                  aria-label="Liczba serwerów"
                />
              </div>
              <div className="mt-2 flex justify-between text-[12px] text-dim">
                <span>1</span>
                <span>6</span>
                <span>12+</span>
              </div>
            </div>
            <div className="flex shrink-0 rounded-full bg-white/[0.03] p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
              {(["monthly", "lifetime"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={`relative h-9 rounded-full px-4 text-[13.5px] transition-colors duration-300 ${billing === b ? "text-bg" : "text-muted hover:text-fg"}`}
                >
                  {billing === b && (
                    <motion.span layoutId="billing-pill" className="absolute inset-0 rounded-full bg-fg" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                  )}
                  <span className="relative">{b === "monthly" ? "Miesięcznie" : "Dożywotnio"}</span>
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Plans */}
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {PLANS.map((p, i) => {
            const isRec = i === recommended;
            const tooSmall = servers > p.limit;
            const price = p.price[billing];
            const perServer = Math.round(price / Math.min(servers, p.limit === Infinity ? servers : p.limit));
            return (
              <Reveal key={p.name} from="up" distance={90} delay={0.1 + i * 0.12}>
                <TiltCard highlight={isRec}>
                  <div className="relative flex h-full flex-col p-7 sm:p-8">
                    <div className="flex h-7 items-center justify-between">
                      <h3 className="text-[18px] font-medium">{p.name}</h3>
                      {isRec && (
                        <motion.span
                          layoutId="rec-badge"
                          className="rounded-full bg-fg px-2.5 py-1 text-[12px] font-semibold text-bg"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        >
                          Polecany dla Ciebie
                        </motion.span>
                      )}
                    </div>
                    <p className="mt-2 min-h-[44px] text-[14.5px] leading-relaxed text-muted">{p.desc}</p>

                    <div className="mt-8 flex items-end gap-2">
                      <span className="text-[60px] font-medium leading-none tracking-[-0.05em]">
                        <Odometer value={price} />
                      </span>
                      <span className="mb-1 text-[14px] text-muted">zł {billing === "monthly" ? "/ mies." : "jednorazowo"}</span>
                    </div>
                    <div className="mt-2 h-5 text-[13px]">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={`${tooSmall}-${perServer}-${billing}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.25 }}
                          className={tooSmall ? "text-warn" : "text-dim"}
                        >
                          {tooSmall
                            ? `Limit ${p.limit} ${p.limit === 1 ? "serwera" : "serwerów"}`
                            : billing === "monthly" && servers > 1
                              ? `ok. ${perServer} zł za serwer`
                              : " "}
                        </motion.span>
                      </AnimatePresence>
                    </div>

                    <Button href="/rejestracja" variant={isRec ? "primary" : "secondary"} arrow className="mt-7 w-full">
                      Wybierz {p.name}
                    </Button>

                    <ul className="mt-8 space-y-3 border-t border-line pt-7">
                      {p.features.map((f, k) => (
                        <motion.li
                          key={f}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, ease: EASE, delay: 0.3 + k * 0.05 }}
                          className="flex items-center gap-3 text-[14.5px] text-muted"
                        >
                          <svg viewBox="0 0 16 16" className={`size-4 shrink-0 ${isRec ? "text-fg" : "text-dim"}`} fill="none" aria-hidden>
                            <path d="m4 8.5 2.5 2.5L12 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {f}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
