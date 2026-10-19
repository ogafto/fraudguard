"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Wordmark } from "./logo";
import { McText } from "./mc-ui";
import { Button, EASE } from "./ui";

export function NotFoundView() {
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 14, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } },
    transition: { duration: 0.9, ease: EASE, delay },
  });

  return (
    <div className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[1200px] -translate-x-1/2 bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(255,255,255,0.09),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:80px_80px] [mask-image:radial-gradient(ellipse_55%_50%_at_50%_30%,#000,transparent)]" />

      <header className="relative mx-auto flex h-16 w-full max-w-[1200px] items-center px-5">
        <Link href="/" className="transition-opacity hover:opacity-75">
          <Wordmark />
        </Link>
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center px-5 pb-24 text-center">
        <motion.div
          {...fade(0)}
          className="select-none text-[clamp(120px,22vw,260px)] font-medium leading-none tracking-[-0.06em] text-white/[0.07]"
          aria-hidden
        >
          404
        </motion.div>

        <motion.div {...fade(0.25)} className="-mt-[clamp(40px,6vw,80px)] w-full max-w-[560px] rounded-lg bg-black/60 px-3 py-2 text-left text-[clamp(11px,1.6vw,14px)] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
          <McText>§8[§fFG§8] §cta-strona §7nie przeszła §fExists §8(A) §8[§cVL 404§8]</McText>
        </motion.div>

        <motion.h1 {...fade(0.4)} className="mt-10 text-[clamp(32px,4.4vw,52px)] font-medium leading-[1.05] tracking-[-0.04em]">
          Tej strony nie ma.
        </motion.h1>
        <motion.p {...fade(0.5)} className="mt-4 max-w-[420px] text-[17px] leading-relaxed text-muted">
          Albo nigdy nie istniała, albo FraudGuard uznał ją za podejrzaną i usunął z serwera.
        </motion.p>
        <motion.div {...fade(0.6)} className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href="/" arrow>
            Wróć na stronę główną
          </Button>
          <Button href="/panel" variant="secondary">
            Przejdź do panelu
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
