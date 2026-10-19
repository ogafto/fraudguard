"use client";

import { AnimatePresence, motion, useInView, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { CommandsAuto, DiscordChannel, InGameAlerts, LiveConfig, PlayerGui } from "./feature-mocks";
import { EASE, SectionHeading } from "./ui";

type Step = {
  title: string;
  body: string;
  points: string[];
  frame: string;
  Mock: ComponentType;
};

const STEPS: Step[] = [
  {
    title: "Alerty prosto na czacie",
    body: "Gdy ktoś oszukuje, moderatorzy widzą to od razu w grze. Najedź na alert, żeby zobaczyć szczegóły, kliknij i jesteś przy graczu.",
    points: ["Tylko dla rangi z uprawnieniem", "Grupowanie powtórzonych flag", "Własny format i próg VL"],
    frame: "Minecraft 1.21.1 · Survival EU",
    Mock: InGameAlerts,
  },
  {
    title: "Komendy dla moderatorów",
    body: "Profil gracza, historia flag, ban z powodem i przeładowanie konfiguracji. Wszystko pod jedną komendą /fg.",
    points: ["/fg info", "/fg logs", "/fg ban", "/fg reload"],
    frame: "Minecraft 1.21.1 · czat",
    Mock: CommandsAuto,
  },
  {
    title: "Podgląd gracza w GUI",
    body: "Komenda /fg gui otwiera menu z całą historią gracza. Flagi według kategorii, teleport i ban bez wpisywania czegokolwiek.",
    points: ["Szczegóły po najechaniu", "Ban jednym kliknięciem", "Działa też z konsoli"],
    frame: "Minecraft 1.21.1 · /fg gui",
    Mock: PlayerGui,
  },
  {
    title: "Alerty na Discordzie",
    body: "Każda akcja anticheata trafia na kanał Twojej administracji. Widzisz gracza, check, VL i serwer, nawet gdy nie ma Cię w grze.",
    points: ["Webhook w 30 sekund", "Osobne kanały dla banów i flag", "Wszystkie serwery w jednym miejscu"],
    frame: "Discord · #fraudguard-alerty",
    Mock: DiscordChannel,
  },
  {
    title: "Konfiguracja bez restartu",
    body: "Włączasz, wyłączasz i stroisz checki w panelu webowym. Zmiany trafiają na wszystkie serwery w niecałą sekundę.",
    points: ["Czułość dla każdego checka", "Progi kar per serwer", "Historia zmian"],
    frame: "panel.fraudguard.net · Checki",
    Mock: LiveConfig,
  },
];

function StepText({ step, index, active, onActive }: { step: Step; index: number; active: boolean; onActive: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);
  const { Mock } = step;

  return (
    <div ref={ref} id={`feature-${index}`} className="flex flex-col justify-center py-10 lg:min-h-[78vh] lg:py-0">
      <motion.div
        animate={{ opacity: active ? 1 : 0.28, x: active ? 0 : -6 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="max-lg:!opacity-100 max-lg:!translate-x-0"
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-[13px] text-dim">0{index + 1}</span>
          <span className="h-px w-8 bg-line-strong" />
        </div>
        <h3 className="mt-4 text-[clamp(28px,3vw,40px)] font-medium leading-[1.08] tracking-[-0.035em]">{step.title}</h3>
        <p className="mt-4 max-w-[440px] text-[16.5px] leading-relaxed text-muted">{step.body}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {step.points.map((p, i) => (
            <motion.li
              key={p}
              initial={false}
              animate={{ opacity: active ? 1 : 0.6, y: active ? 0 : 4 }}
              transition={{ duration: 0.5, ease: EASE, delay: active ? 0.1 + i * 0.05 : 0 }}
              className={`rounded-full px-3 py-1.5 text-[13px] shadow-[0_0_0_1px_rgba(255,255,255,0.1)] ${p.startsWith("/") ? "font-mono text-fg" : "text-muted"}`}
            >
              {p}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Mobile: the mock sits under its text */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.9, ease: EASE }}
        className="mt-8 lg:hidden"
      >
        <Frame label={step.frame} index={index}>
          <Mock />
        </Frame>
      </motion.div>
    </div>
  );
}

function Frame({ label, index, children }: { label: string; index: number; children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] bg-white/[0.03] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.08),0_50px_120px_-40px_rgba(0,0,0,0.95)]">
      <div className="flex items-center gap-2 px-3 pb-2 pt-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-2.5 rounded-full bg-white/[0.1]" />
        ))}
        <div className="relative ml-3 h-5 flex-1 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={label}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="absolute inset-0 truncate font-mono text-[11.5px] leading-5 text-dim"
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </div>
        <span className="font-mono text-[11.5px] text-dim">0{index + 1} / 0{STEPS.length}</span>
      </div>
      <div className="relative overflow-hidden rounded-[14px]">{children}</div>
    </div>
  );
}

export function Features() {
  const [active, setActive] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 0.5", "end 0.5"] });
  const rail = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const Active = STEPS[active].Mock;

  return (
    <section id="features" className="relative px-4 pt-28 sm:px-6 md:pt-40">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col items-center">
          <SectionHeading center eyebrow="Funkcje" title={["Tak wygląda", "\n", "FraudGuard w akcji."]}>
            Od alertu na czacie po bana jednym kliknięciem. Zobacz, jak Twoja administracja będzie pracować z anticheatem na co dzień.
          </SectionHeading>
        </div>

        <div className="relative mt-16 lg:mt-24 lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Left: steps with a progress rail */}
          <div ref={list} className="relative lg:pl-8">
            <div className="absolute bottom-[39vh] left-0 top-[39vh] hidden w-px bg-line lg:block">
              <motion.div style={{ scaleY: rail }} className="h-full w-px origin-top bg-gradient-to-b from-white/30 to-white" />
            </div>
            {STEPS.map((s, i) => (
              <StepText key={s.title} step={s} index={i} active={active === i} onActive={setActive} />
            ))}
          </div>

          {/* Right: one sticky screen that morphs between views */}
          <div className="hidden lg:block">
            <div className="sticky top-[15vh] flex h-[70vh] items-center">
              <div className="relative w-full">
                <div className="pointer-events-none absolute -inset-x-10 -top-16 h-56 rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,255,255,0.1),transparent)] blur-2xl" />
                <Frame label={STEPS[active].frame} index={active}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={active}
                      initial={{ opacity: 0, scale: 1.06, filter: "blur(12px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
                      exit={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
                      transition={{ duration: 0.7, ease: EASE }}
                    >
                      <Active />
                    </motion.div>
                  </AnimatePresence>
                </Frame>
                {/* step dots */}
                <div className="mt-6 flex justify-center gap-2">
                  {STEPS.map((_, i) => (
                    <motion.span
                      key={i}
                      animate={{ width: i === active ? 28 : 8, opacity: i === active ? 1 : 0.3 }}
                      transition={{ duration: 0.5, ease: EASE }}
                      className="h-2 rounded-full bg-fg"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
