"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { IconDiscord } from "../icons";
import { Odometer } from "../odometer";
import { useContent } from "../content-context";
import { useSite } from "../site-context";
import { Button, EASE, FadeIn, Reveal, SectionHeading } from "../ui";

type Billing = "monthly" | "lifetime";

const COLS: Record<number, string> = { 1: "md:mx-auto md:max-w-[420px]", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" };

export function PricingV2() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const copy = useContent("pricing");
  const PLANS = copy.plans;
  const [hover, setHover] = useState(() => Math.max(0, PLANS.findIndex((p) => p.featured)));
  const rest = Math.max(0, PLANS.findIndex((p) => p.featured));
  const { discordUrl } = useSite();

  return (
    <section id="pricing" className="relative px-4 py-32 sm:px-6 md:py-44">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid items-end gap-8 md:grid-cols-[1fr_auto]">
          <SectionHeading eyebrow={copy.eyebrow} title={[copy.title1, "\n", copy.title2]} />
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
                  <span className="relative">{b === "monthly" ? copy.monthlyLabel : copy.lifetimeLabel}</span>
                </button>
              ))}
            </div>
          </FadeIn>
        </div>

        <Reveal from="up" distance={50} delay={0.1} className="mt-16">
          <div
            className={`relative grid overflow-hidden rounded-[24px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(255,255,255,0.08)] ${COLS[PLANS.length] ?? "md:grid-cols-3"}`}
            onPointerLeave={() => setHover(rest)}
          >
            {PLANS.map((p, i) => (
              <div
                key={p.id + i}
                onPointerEnter={() => setHover(i)}
                className={`relative flex flex-col p-8 sm:p-10 ${i > 0 ? "border-t border-line md:border-l md:border-t-0" : ""}`}
              >
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
                  {p.featured && <span className="text-[12.5px] text-muted">{copy.featuredBadge}</span>}
                </div>
                <p className="relative mt-3 min-h-[48px] text-[15px] leading-relaxed text-muted">{p.who}</p>

                <div className="relative mt-10 flex items-end gap-2">
                  <span className="text-[clamp(52px,5vw,72px)] font-medium leading-none tracking-[-0.055em]">
                    <Odometer value={billing === "monthly" ? p.monthly : p.lifetime} />
                  </span>
                  <span className="mb-1.5 text-[14px] text-muted">zł</span>
                </div>
                <div className="relative mt-2 h-5 text-[13.5px] text-dim">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={billing} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }} className="block">
                      {billing === "monthly" ? copy.monthlyNote : copy.lifetimeNote}
                    </motion.span>
                  </AnimatePresence>
                </div>

                <Button href={discordUrl} external variant={p.featured ? "primary" : "secondary"} arrow className="relative mt-10 w-full">
                  {copy.buttonPrefix} {p.name}
                </Button>

                <div className="relative mt-10 border-t border-line pt-8">
                  {p.lead && <div className="mb-4 text-[13px] text-dim">{p.lead}</div>}
                  <ul className="space-y-3.5">
                    {p.features.map((f, k) => (
                      <motion.li
                        key={k}
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

        <FadeIn delay={0.2} className="mt-6 flex justify-center">
          <a
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 text-center text-[14px] text-muted transition-colors hover:text-fg"
          >
            <IconDiscord className="size-4 shrink-0 transition-transform duration-500 ease-out-expo group-hover:-rotate-12 group-hover:scale-110" />
            {copy.footnote}
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
