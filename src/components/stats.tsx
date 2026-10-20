"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";
import { EASE, FadeIn } from "./ui";

function Counter({ to, decimals = 0, suffix = "" }: { to: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  useEffect(() => {
    if (!inView) return;
    const fmt = (v: number) => v.toLocaleString("pl-PL", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    const ctrl = animate(0, to, {
      duration: 1.8,
      ease: EASE,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = fmt(v) + suffix;
      },
    });
    return () => ctrl.stop();
  }, [inView, to, decimals, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

// Product facts only: no invented user counts or accuracy percentages.
const STATS: { to?: number; text?: string; decimals?: number; prefix?: string; suffix?: string; label: string }[] = [
  { text: "1.20+", label: "tylko nowe wersje gry" },
  { to: 0.2, decimals: 1, prefix: "~", suffix: " ms", label: "średni koszt na tick" },
  { to: 30, suffix: " s", label: "instalacja na serwerze" },
  { text: "Discord", label: "alerty i wsparcie" },
];

export function Stats() {
  return (
    <section className="px-4 pb-6 pt-8 sm:px-6" aria-label="FraudGuard w liczbach">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-2 gap-y-10 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.06} className={`px-2 text-center ${i % 2 ? "border-l border-line" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
              <div className="text-fg whitespace-nowrap text-[clamp(26px,3.2vw,42px)] font-medium leading-none tracking-[-0.04em]">
                {s.to !== undefined ? (
                  <>
                    {s.prefix}
                    <Counter to={s.to} decimals={s.decimals} suffix={s.suffix} />
                  </>
                ) : (
                  s.text
                )}
              </div>
              <div className="mt-3 text-[14px] text-dim">{s.label}</div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
