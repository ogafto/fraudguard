"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { IconDiscord } from "../icons";
import { FEATURE_EVENT } from "../nav";
import { McItem } from "../mc-ui";
import { EASE, FadeIn, Reveal, SectionHeading } from "../ui";
import { AlertsDemo, CommandDemo, ConfigDemo, DiscordDemo, GuiDemo, type DemoProps } from "./mc-demos";

type Feature = {
  tab: string;
  icon: ReactNode;
  title: string;
  body: string;
  points: string[];
  Demo: ComponentType<DemoProps>;
};

const ICON = "size-4 shrink-0";

const FEATURES: Feature[] = [
  {
    tab: "Alerty",
    icon: <McItem name="sword" className={ICON} />,
    title: "Widzisz cheatera, zanim ktoś go zgłosi.",
    body: "Alert pojawia się na czacie administracji w chwili, gdy gracz nie przejdzie checka. Najedź, żeby zobaczyć szczegóły, kliknij i jesteś przy nim.",
    points: ["Widoczne tylko dla administracji", "Szczegóły po najechaniu", "Teleport jednym kliknięciem"],
    Demo: AlertsDemo,
  },
  {
    tab: "Komendy",
    icon: <McItem name="command" className={ICON} />,
    title: "Jedna komenda. Wszystko o graczu.",
    body: "Profil, historia flag i ban z powodem pod /fg. Podpowiedzi działają dokładnie tak, jak w vanilli.",
    points: ["/fg info i /fg logs", "/fg ban z gotowym powodem", "Podpowiedzi przy wpisywaniu"],
    Demo: CommandDemo,
  },
  {
    tab: "Menu",
    icon: <McItem name="head" head="aftoxd" className={ICON} />,
    title: "Cała historia gracza w jednym menu.",
    body: "/fg gui otwiera menu z flagami w podziale na kategorie, teleportem i banem. Bez wpisywania czegokolwiek.",
    points: ["Flagi według kategorii", "Ban z gotowym powodem", "Historia z 30 dni"],
    Demo: GuiDemo,
  },
  {
    tab: "Discord",
    icon: <IconDiscord className={ICON} />,
    title: "Wiesz o wszystkim, nawet poza grą.",
    body: "Każda flaga, kick i ban trafia na kanał Twojego serwera na Discordzie, ze skinem gracza i wszystkimi szczegółami.",
    points: ["Webhook w 30 sekund", "Osobne kanały na bany", "Wszystkie serwery razem"],
    Demo: DiscordDemo,
  },
  {
    tab: "Panel",
    icon: <McItem name="comparator" className={ICON} />,
    title: "Zmieniasz czułość. Bez restartu.",
    body: "Każdy check ustawiasz w panelu. Serwery dostają zmiany od razu, bez przeładowania pluginu i bez wchodzenia na FTP.",
    points: ["Czułość dla każdego checka", "Wiele serwerów naraz", "Historia zmian"],
    Demo: ConfigDemo,
  },
];

/** Plays a demo timeline from 0 when it mounts. */
function Playing({ Demo }: { Demo: ComponentType<DemoProps> }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const id = setInterval(() => setT(performance.now() - start), 50);
    return () => clearInterval(id);
  }, []);
  return <Demo t={t} />;
}

export function FeaturesV2() {
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const seen = useInView(box, { once: true, margin: "-20% 0px" });
  const f = FEATURES[active];

  // The navbar's product menu can open a specific tab.
  useEffect(() => {
    const pick = (i: number) => {
      if (i >= 0 && i < FEATURES.length) setActive(i);
    };
    const onEvent = (e: Event) => pick(Number((e as CustomEvent).detail));
    window.addEventListener(FEATURE_EVENT, onEvent);
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(FEATURE_EVENT);
      sessionStorage.removeItem(FEATURE_EVENT);
    } catch {}
    const id = saved !== null ? setTimeout(() => pick(Number(saved)), 0) : undefined;
    return () => {
      window.removeEventListener(FEATURE_EVENT, onEvent);
      clearTimeout(id);
    };
  }, []);

  return (
    <section id="features" className="relative px-4 py-28 sm:px-6 md:py-40">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid items-end gap-8 md:grid-cols-[1fr_auto]">
          <SectionHeading eyebrow="Funkcje" title={["Tak wygląda", "\n", "FraudGuard w akcji."]} />
          <FadeIn delay={0.15} className="max-w-[340px] text-[16px] leading-relaxed text-muted">
            Wszystko, czego Twoja administracja używa na co dzień. W grze, na Discordzie i w panelu.
          </FadeIn>
        </div>

        {/* Switcher: the same pill as the billing toggle. On phones it becomes a 5 column bar, icon above label. */}
        <FadeIn delay={0.1} className="mt-12 flex justify-center md:mt-16">
          <div
            role="tablist"
            className="grid w-full grid-cols-5 gap-0.5 rounded-2xl bg-white/[0.03] p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] sm:flex sm:w-max sm:gap-0 sm:rounded-full"
          >
            {FEATURES.map((x, i) => (
              <button
                key={x.tab}
                role="tab"
                aria-selected={active === i}
                onClick={() => setActive(i)}
                className={`relative flex h-14 flex-col items-center justify-center rounded-xl text-[11.5px] transition-colors duration-300 sm:h-10 sm:flex-row sm:rounded-full sm:px-5 sm:text-[14px] ${active === i ? "text-bg" : "text-muted hover:text-fg"}`}
              >
                {active === i && (
                  <motion.span
                    layoutId="feature-tab"
                    className="absolute inset-0 rounded-xl bg-fg sm:rounded-full"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
                  {x.icon}
                  {x.tab}
                </span>
              </button>
            ))}
          </div>
        </FadeIn>

        <Reveal from="up" distance={40} delay={0.15} className="mt-8 md:mt-10">
          <div
            ref={box}
            className="relative overflow-hidden rounded-[24px] bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_0_1px_rgba(255,255,255,0.08)]"
          >
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              {/* Copy: every text sits in the same grid cell, so the height never jumps */}
              <div className="grid p-6 sm:p-10">
                {FEATURES.map((x, i) => (
                  <motion.div
                    key={x.tab}
                    aria-hidden={i !== active}
                    className={`flex flex-col [grid-area:1/1] lg:justify-center ${i === active ? "" : "pointer-events-none"}`}
                    initial={false}
                    animate={i === active ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.35, ease: EASE, delay: i === active ? 0.1 : 0 }}
                  >
                    <h3 className="text-[clamp(26px,3vw,40px)] font-medium leading-[1.08] tracking-[-0.04em]">{x.title}</h3>
                    <p className="mt-4 max-w-[440px] text-[15.5px] leading-relaxed text-muted sm:text-[16.5px]">{x.body}</p>
                    <ul className="mt-6 space-y-3 sm:mt-8">
                      {x.points.map((pt) => (
                        <li key={pt} className="flex items-center gap-3 text-[15px] text-fg/85">
                          <svg viewBox="0 0 16 16" className="size-4 shrink-0" fill="none" aria-hidden>
                            <path d="m4 8.5 2.5 2.5L12 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              {/* Demo */}
              <div className="relative m-3 mt-0 h-[400px] overflow-hidden rounded-[18px] bg-[#0a0b0d] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] sm:m-4 sm:mt-0 sm:h-[460px] lg:mt-4 lg:h-[500px]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(255,255,255,0.08),transparent_70%)]" />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active}
                    className="absolute inset-0 p-4 sm:p-6"
                    initial={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 1.01, filter: "blur(6px)" }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    {seen && <Playing Demo={f.Demo} />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
