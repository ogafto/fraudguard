"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Odometer } from "../odometer";
import { Button, EASE, FadeIn, Reveal, SectionHeading } from "../ui";

type Billing = "monthly" | "lifetime";

const PLANS: { name: string; who: string; price: Record<Billing, number>; featured?: boolean; lead?: string; features: string[] }[] = [
  {
    name: "Starter",
    who: "Jeden serwer, który chce spokoju od pierwszego dnia.",
    price: { monthly: 29, lifetime: 149 },
    features: ["1 serwer", "Alerty w grze i komendy", "Menu podglądu gracza", "Aktualizacje"],
  },
  {
    name: "Pro",
    who: "Rosnąca społeczność z kilkoma trybami gry.",
    price: { monthly: 59, lifetime: 299 },
    featured: true,
    lead: "Wszystko ze Startera, plus",
    features: ["Do 3 serwerów", "Panel webowy i statystyki", "Alerty na Discordzie", "Historia zmian konfiguracji", "Priorytetowe wsparcie"],
  },
  {
    name: "Network",
    who: "Sieć serwerów z proxy i własnymi wymaganiami.",
    price: { monthly: 129, lifetime: 599 },
    lead: "Wszystko z Pro, plus",
    features: ["Bez limitu serwerów", "Synchronizacja proxy", "Dedykowany opiekun"],
  },
];

export function PricingV2() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [hover, setHover] = useState(1);

  return (
    <section id="pricing" className="relative px-4 py-32 sm:px-6 md:py-44">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid items-end gap-8 md:grid-cols-[1fr_auto]">
          <SectionHeading eyebrow="Cennik" title={["Prosty cennik.", "\n", "Bez niespodzianek."]} />
          <FadeIn delay={0.15}>
            <div className="flex w-max rounded-full bg-white/[0.03] p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
              {(["monthly", "lifetime"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={`relative h-9 rounded-full px-4 text-[13.5px] transition-colors duration-300 ${billing === b ? "text-bg" : "text-muted hover:text-fg"}`}
                >
                  {billing === b && (
                    <motion.span layoutId="billing-v3" className="absolute inset-0 rounded-full bg-fg" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                  )}
                  <span className="relative">{b === "monthly" ? "Miesięcznie" : "Dożywotnio"}</span>
                </button>
              ))}
            </div>
          </FadeIn>
        </div>

        <Reveal from="up" distance={50} delay={0.1} className="mt-16">
          <div
            className="relative grid overflow-hidden rounded-[24px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(255,255,255,0.08)] md:grid-cols-3"
            onPointerLeave={() => setHover(1)}
          >
            {PLANS.map((p, i) => (
              <div
                key={p.name}
                onPointerEnter={() => setHover(i)}
                className={`relative flex flex-col p-8 sm:p-10 ${i > 0 ? "border-t border-line md:border-l md:border-t-0" : ""}`}
              >
                {/* highlight that glides between columns */}
                {hover === i && (
                  <motion.span
                    layoutId="price-hover"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,255,255,0.08),transparent_70%)]"
                    transition={{ type: "spring", stiffness: 260, damping: 32 }}
                  >
                    <span className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                  </motion.span>
                )}

                <div className="relative flex h-6 items-center justify-between">
                  <span className="text-[15px] font-medium">{p.name}</span>
                  {p.featured && <span className="text-[12.5px] text-muted">Najczęściej wybierany</span>}
                </div>
                <p className="relative mt-3 min-h-[48px] text-[15px] leading-relaxed text-muted">{p.who}</p>

                <div className="relative mt-10 flex items-end gap-2">
                  <span className="text-[clamp(52px,5vw,72px)] font-medium leading-none tracking-[-0.055em]">
                    <Odometer value={p.price[billing]} />
                  </span>
                  <span className="mb-1.5 text-[14px] text-muted">zł</span>
                </div>
                <div className="relative mt-2 h-5 text-[13.5px] text-dim">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={billing} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }} className="block">
                      {billing === "monthly" ? "miesięcznie, anulujesz kiedy chcesz" : "jednorazowo, na zawsze"}
                    </motion.span>
                  </AnimatePresence>
                </div>

                <Button href="/rejestracja" variant={p.featured ? "primary" : "secondary"} arrow className="relative mt-10 w-full">
                  Wybierz {p.name}
                </Button>

                <div className="relative mt-10 border-t border-line pt-8">
                  {p.lead && <div className="mb-4 text-[13px] text-dim">{p.lead}</div>}
                  <ul className="space-y-3.5">
                    {p.features.map((f, k) => (
                      <motion.li
                        key={f}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease: EASE, delay: 0.2 + i * 0.08 + k * 0.05 }}
                        className="flex items-center gap-3 text-[15px]"
                      >
                        <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-fg" fill="none" aria-hidden>
                          <path d="m4 8.5 2.5 2.5L12 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-fg/85">{f}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
