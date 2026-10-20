"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { EASE, Reveal, SectionHeading } from "./ui";

const FAQ = [
  {
    q: "Na jakich wersjach Minecrafta działa FraudGuard?",
    a: "Od 1.20 wzwyż, na silnikach Paper, Spigot, Purpur i Folia. Skupiamy się tylko na nowych wersjach, dzięki czemu checki są dokładniejsze.",
  },
  {
    q: "Czy anticheat będzie banował uczciwych graczy?",
    a: "Każdy check jest kalibrowany pod lagi, ping i nietypowe sytuacje jak knockback, lód czy slime. Kary działają progowo, więc zanim dojdzie do bana, gracz musi wielokrotnie i jednoznacznie łamać zasady.",
  },
  {
    q: "Jak duży jest wpływ na wydajność serwera?",
    a: "Średnio około 0.2 ms na tick. Analiza pakietów odbywa się asynchronicznie, poza głównym wątkiem serwera.",
  },
  {
    q: "Na ilu serwerach mogę używać licencji?",
    a: "Starter obejmuje jeden serwer, Pro do trzech, a Network nie ma limitu. Plan zmienisz w panelu klienta.",
  },
  {
    q: "Czy działa na sieci z Velocity lub BungeeCord?",
    a: "Tak. W planie Network flagi i kary są synchronizowane między wszystkimi serwerami w sieci.",
  },
  {
    q: "Jak wygląda wsparcie?",
    a: "Zespół odpowiada na Discordzie. W planach Pro i Network masz priorytet w kolejce.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative px-4 py-28 sm:px-6 md:py-36">
      <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading eyebrow="FAQ" title={["Częste", "\n", "pytania."]}>
            Nie ma tu Twojego pytania? Zapytaj na Discordzie, odpowiadamy zwykle w kilka godzin.
          </SectionHeading>
        </div>

        <ul className="space-y-2">
          {FAQ.map((item, i) => {
            const on = open === i;
            return (
              <Reveal key={item.q} from="up" distance={24} delay={i * 0.06}>
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
