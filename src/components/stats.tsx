"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";
import { useContent } from "./content-context";
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

type StatView = { to?: number; text?: string; decimals?: number; prefix?: string; suffix?: string; label: string };

/** "~0,2 ms" counts up as a number with a prefix and suffix; text without a number, or with a dot like "1.20+", is shown as is. */
function parse(value: string, label: string): StatView {
  const m = value.match(/^([^\d.]*?)(\d+(?:,\d+)?)([^\d.]*)$/);
  if (!m) return { text: value, label };
  const decimals = m[2].includes(",") ? m[2].split(",")[1].length : 0;
  return { to: Number(m[2].replace(",", ".")), decimals, prefix: m[1], suffix: m[3], label };
}

export function Stats() {
  // Product facts only: no invented user counts or accuracy percentages. Edited in the CMS.
  const STATS = useContent("home").stats.map((s) => parse(s.value, s.label));
  return (
    <section className="px-4 pb-6 pt-8 sm:px-6" aria-label="FraudGuard w liczbach">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-2 gap-y-10 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <FadeIn key={s.label + i} delay={i * 0.06} className={`px-2 text-center ${i % 2 ? "border-l border-line" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
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
