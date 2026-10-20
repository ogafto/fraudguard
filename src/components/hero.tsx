"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { useContent } from "./content-context";
import { useScrollTo } from "./nav";
import { Panel, Scaled } from "./panel";
import { Arrow, Badge, Button, EASE, SplitReveal } from "./ui";

export function Hero() {
  const scrollTo = useScrollTo();
  const { hero } = useContent("home");
  const stage = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: stage, offset: ["start end", "start 0.25"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const rotateX = useTransform(p, [0, 1], [24, 0]);
  const scale = useTransform(p, [0, 1], [0.92, 1]);
  const glow = useTransform(p, [0, 1], [0.6, 1]);
  const { scrollY } = useScroll();
  const copyY = useTransform(scrollY, [0, 600], [0, -90]);
  const copyOpacity = useTransform(scrollY, [0, 500], [1, 0.15]);

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 16, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 1, ease: EASE, delay },
  });

  return (
    <section id="top" className="relative isolate overflow-hidden pt-36 sm:pt-44">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[720px] w-[1400px] -translate-x-1/2 bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(255,255,255,0.11),transparent_70%)]" />
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:80px_80px] [mask-image:radial-gradient(ellipse_60%_45%_at_50%_0%,#000,transparent)]" />
      </div>

      <motion.div style={{ y: copyY, opacity: copyOpacity }} className="mx-auto flex max-w-[1100px] flex-col items-center px-5 text-center">
        <motion.a
          {...fadeUp(0.1)}
          href="#features"
          onClick={(e) => {
            e.preventDefault();
            scrollTo("#features");
          }}
          className="group mb-8"
        >
          <Badge className="py-1 pl-1 pr-3 transition-colors hover:bg-white/[0.06]">
            <span className="flex items-center gap-1.5 rounded-full bg-fg px-2 py-0.5 text-[12px] font-semibold text-bg">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-bg/60" />
                <span className="relative size-1.5 rounded-full bg-bg" />
              </span>
              {hero.badgeTag}
            </span>
            <span className="text-muted transition-colors group-hover:text-fg">
              <span className="sm:hidden">{hero.badgeShort}</span>
              <span className="hidden sm:inline">{hero.badgeLong}</span>
            </span>
            <Arrow className="size-3 text-muted transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5 group-hover:text-fg" />
          </Badge>
        </motion.a>

        <SplitReveal
          as="h1"
          play
          delay={0.2}
          segments={[hero.title1, "\n", { text: hero.title2, className: "text-white/45" }]}
          className="text-fg pb-2 text-[clamp(34px,7.2vw,92px)] font-medium leading-[1] tracking-[-0.045em]"
        />

        <motion.p {...fadeUp(0.55)} className="mt-6 max-w-[540px] text-[clamp(16px,1.35vw,19px)] leading-relaxed text-muted">
          {hero.lead}
        </motion.p>

        <motion.div {...fadeUp(0.7)} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button href="/rejestracja" arrow>
            {hero.primaryCta}
          </Button>
          <Button variant="secondary" onClick={() => scrollTo("#pricing")} href="#pricing">
            {hero.secondaryCta}
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        ref={stage}
        {...fadeUp(0.9)}
        className="relative mx-auto mt-20 max-w-[1280px] px-4 [perspective:2000px] sm:mt-24 sm:px-6"
      >
        <motion.div
          style={{ opacity: glow }}
          className="pointer-events-none absolute inset-x-[10%] -top-24 h-64 rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,255,255,0.16),transparent)] blur-2xl"
        />
        <motion.div style={{ rotateX, scale, transformOrigin: "50% 0%" }} className="relative">
          <div className="relative rounded-[18px] bg-white/[0.03] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_0_1px_rgba(255,255,255,0.09),0_50px_120px_-30px_rgba(0,0,0,0.9)]">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px overflow-hidden">
              <div className="h-px w-1/3 animate-beam bg-gradient-to-r from-transparent via-white to-transparent" />
            </div>
            <Scaled width={1240} className="overflow-hidden rounded-[14px]">
              <Panel />
            </Scaled>
          </div>
        </motion.div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-bg" />
      </motion.div>
    </section>
  );
}
