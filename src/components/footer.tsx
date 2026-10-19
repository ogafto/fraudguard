"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { IconDiscord } from "./icons";
import { LogoMark, Wordmark } from "./logo";
import { NAV_LINKS, useScrollTo } from "./nav";
import { BlockGrid } from "./block-grid";
import { Arrow, Button, FadeIn, SplitReveal } from "./ui";

/* ------------------------------------------------------------------ */
/* Closing CTA: interactive block grid                                 */
/* ------------------------------------------------------------------ */

export function FinalCta() {
  const box = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: box, offset: ["start end", "start 0.35"] });
  const clip = useTransform(scrollYProgress, [0, 1], ["inset(8% 10% 8% 10% round 64px)", "inset(0% 0% 0% 0% round 32px)"]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);

  return (
    <section id="contact" className="relative px-4 py-28 sm:px-6 md:py-40">
      <motion.div
        ref={box}
        style={{ clipPath: clip, scale }}
        className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[32px] bg-[#0b0c0e] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.08)]"
      >
        <div className="absolute inset-0">
          <BlockGrid />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_55%_at_50%_50%,rgba(11,12,14,0.92),rgba(11,12,14,0.55)_60%,transparent)]" />

        <div className="pointer-events-none relative flex flex-col items-center px-6 py-28 text-center sm:py-36">
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 160, damping: 14 }}
            className="mb-9 flex size-16 items-center justify-center rounded-2xl bg-fg"
          >
            <LogoMark className="size-8 text-bg" />
          </motion.div>
          <SplitReveal
            segments={["Twój serwer zasługuje", "\n", { text: "na uczciwą grę.", className: "text-white/45" }]}
            className="pb-1 text-[clamp(36px,5.6vw,72px)] font-medium leading-[1.02] tracking-[-0.045em] text-fg"
          />
          <FadeIn delay={0.25} className="mt-6 max-w-[460px] text-[17px] leading-relaxed text-muted">
            Załóż konto i zabezpiecz serwer jeszcze dziś. Masz pytania? Wpadnij na nasz Discord, pomożemy od razu.
          </FadeIn>
          <FadeIn delay={0.4} className="pointer-events-auto mt-10 flex flex-wrap justify-center gap-3">
            <Button href="/rejestracja" arrow>
              Załóż konto
            </Button>
            <a
              href={SITE.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-11 items-center gap-2.5 rounded-full bg-[#5865f2] px-5 text-[14.5px] font-medium text-white transition-[background-color,transform] duration-300 hover:-translate-y-px hover:bg-[#4752c4]"
            >
              <IconDiscord className="size-[18px] transition-transform duration-500 ease-out-expo group-hover:rotate-[-8deg] group-hover:scale-110" />
              Dołącz na Discorda
            </a>
          </FadeIn>
          <FadeIn delay={0.55} className="pointer-events-auto mt-8 text-[14px] text-dim">
            albo napisz na{" "}
            <a href={`mailto:${SITE.email}`} className="text-muted underline-offset-4 transition-colors hover:text-fg hover:underline">
              {SITE.email}
            </a>
          </FadeIn>
        </div>
      </motion.div>
    </section>
  );
}

export function Footer() {
  const scrollTo = useScrollTo();
  const cols = [
    { h: "Produkt", items: [NAV_LINKS[0], NAV_LINKS[1], NAV_LINKS[2]] },
    { h: "Wsparcie", items: [NAV_LINKS[3], { label: "Kontakt", href: "#contact" }, { label: "Discord", href: SITE.discordUrl }] },
    {
      h: "Konto",
      items: [
        { label: "Zaloguj się", href: "/logowanie" },
        { label: "Załóż konto", href: "/rejestracja" },
        { label: "Regulamin", href: "#" },
        { label: "Prywatność", href: "#" },
      ],
    },
  ];

  return (
    <footer className="border-t border-line px-4 sm:px-6">
      <div className="mx-auto grid max-w-[1200px] gap-12 py-16 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-[260px] text-[14px] leading-relaxed text-dim">
            Anticheat dla serwerów Minecraft. Cheaterzy nie mają szans.
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.h}>
            <div className="mb-4 text-[13px] font-medium text-fg">{col.h}</div>
            <ul className="space-y-2.5">
              {col.items.map((it) => (
                <li key={it.label}>
                  {it.href.startsWith("/") ? (
                    <Link href={it.href} className="text-[14px] text-dim transition-colors hover:text-fg">
                      {it.label}
                    </Link>
                  ) : it.href.startsWith("http") ? (
                    <a href={it.href} target="_blank" rel="noopener noreferrer" className="text-[14px] text-dim transition-colors hover:text-fg">
                      {it.label}
                    </a>
                  ) : (
                    <a
                      href={it.href}
                      onClick={(e) => {
                        if (it.href.length > 1) {
                          e.preventDefault();
                          scrollTo(it.href);
                        }
                      }}
                      className="text-[14px] text-dim transition-colors hover:text-fg"
                    >
                      {it.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-2 border-t border-line py-6 text-[13px] text-dim sm:flex-row">
        <span>© 2026 FraudGuard · Nie jesteśmy powiązani z Mojang Studios ani Microsoft.</span>
        <a
          href="https://afto.works"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 transition-colors hover:text-fg"
        >
          Strona wykonana przez <span className="font-medium text-muted transition-colors group-hover:text-fg">afto.works</span>
          <Arrow className="size-3 -rotate-45 transition-transform duration-500 ease-out-expo group-hover:rotate-0" />
        </a>
      </div>
    </footer>
  );
}
