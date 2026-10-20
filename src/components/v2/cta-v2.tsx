"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import type { PointerEvent } from "react";
import { useContent } from "../content-context";
import { IconDiscord } from "../icons";
import { LogoMark } from "../logo";
import { useSite } from "../site-context";
import { Button, EASE } from "../ui";

export function CtaV2() {
  const { cta } = useContent("home");
  const { discordUrl } = useSite();
  const mx = useMotionValue(80);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 90, damping: 20 });
  const sy = useSpring(my, { stiffness: 90, damping: 20 });
  const light = useMotionTemplate`radial-gradient(420px circle at ${sx}% ${sy}%, rgba(255,255,255,0.08), transparent 60%)`;
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 100);
    my.set(((e.clientY - r.top) / r.height) * 100);
  };

  return (
    <section id="contact" className="px-4 py-24 sm:px-6 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.9, ease: EASE }}
        onPointerMove={onMove}
        className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[24px] bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_0_1px_rgba(255,255,255,0.08)]"
      >
        <motion.div className="pointer-events-none absolute inset-0" style={{ background: light }} />
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px overflow-hidden">
          <div className="h-px w-1/3 animate-beam bg-gradient-to-r from-transparent via-white to-transparent" />
        </div>

        <div className="relative flex flex-col gap-8 p-8 sm:p-10 md:flex-row md:items-center md:justify-between md:p-12">
          <div className="flex items-start gap-5">
            <motion.span
              initial={{ rotate: -20, scale: 0.7, opacity: 0 }}
              whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.2 }}
              className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-fg sm:flex"
            >
              <LogoMark className="size-6 text-bg" />
            </motion.span>
            <div>
              <h2 className="text-[clamp(24px,2.6vw,34px)] font-medium leading-[1.1] tracking-[-0.03em]">{cta.title}</h2>
              <p className="mt-2 text-[16px] text-muted">{cta.lead}</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Button href="/rejestracja" arrow>
              {cta.button}
            </Button>
            <a
              href={discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-11 items-center gap-2.5 rounded-full bg-white/[0.06] px-5 text-[14.5px] font-medium text-fg ring-1 ring-inset ring-white/[0.1] transition-colors duration-300 hover:bg-white/[0.1]"
            >
              <IconDiscord className="size-[18px] transition-transform duration-500 ease-out-expo group-hover:rotate-[-8deg] group-hover:scale-110" />
              Discord
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
