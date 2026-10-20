"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useContent } from "./content-context";
import { EASE, Reveal, SectionHeading } from "./ui";

export function Faq() {
  const copy = useContent("faq");
  const FAQ = copy.items;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative px-4 py-28 sm:px-6 md:py-36">
      <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading eyebrow={copy.eyebrow} title={[copy.title1, "\n", copy.title2]}>
            {copy.intro}
          </SectionHeading>
        </div>

        <ul className="space-y-2">
          {FAQ.map((item, i) => {
            const on = open === i;
            return (
              <Reveal key={i} from="up" distance={24} delay={i * 0.06}>
                <li
                  className={`rounded-xl transition-[background-color,box-shadow] duration-300 ${on ? "bg-white/[0.035] shadow-[0_0_0_1px_rgba(255,255,255,0.09)]" : "shadow-[0_0_0_1px_rgba(255,255,255,0.05)] hover:bg-white/[0.02]"}`}
                >
                  <button
                    onClick={() => setOpen(on ? null : i)}
                    className="flex w-full items-center gap-6 px-5 py-4.5 text-left sm:px-6"
                    aria-expanded={on}
                  >
                    <span className={`flex-1 text-[16px] transition-colors ${on ? "text-fg" : "text-muted"}`}>{item.q}</span>
                    <motion.svg
                      viewBox="0 0 16 16"
                      className="size-4 shrink-0 text-muted"
                      animate={{ rotate: on ? 45 : 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      aria-hidden
                    >
                      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </motion.svg>
                  </button>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-[15px] leading-relaxed text-muted sm:px-6">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
