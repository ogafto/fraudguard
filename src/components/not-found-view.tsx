"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Wordmark } from "./logo";
import { McItem } from "./mc-ui";
import { Button, EASE } from "./ui";

// "404" drawn on a 3×5 grid per digit, built out of real block textures.
const DIGITS: Record<string, string[]> = {
  "4": ["#.#", "#.#", "###", "..#", "..#"],
  "0": ["###", "#.#", "#.#", "#.#", "###"],
};

type Cell = { id: string; block: "grass" | "tnt"; col: number; row: number };

const CELLS: Cell[] = "404".split("").flatMap((d, di) =>
  DIGITS[d].flatMap((line, row) =>
    line.split("").flatMap((ch, col) => (ch === "#" ? [{ id: `${di}-${row}-${col}`, block: d === "0" ? ("tnt" as const) : ("grass" as const), col: di * 4 + col, row }] : [])),
  ),
);

const PARTICLES = [
  [-1, -1.2],
  [1.1, -1],
  [-0.9, 0.8],
  [1, 1.1],
  [0, -1.5],
  [-1.4, 0.1],
];

function Block({ cell, i }: { cell: Cell; i: number }) {
  const [broken, setBroken] = useState(0);
  const [gone, setGone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => clearTimeout(timer.current ?? undefined), []);

  const breakIt = () => {
    if (gone) return;
    setGone(true);
    setBroken((b) => b + 1);
    timer.current = setTimeout(() => setGone(false), 1600);
  };

  return (
    <div className="relative aspect-square" style={{ gridColumn: cell.col + 1, gridRow: cell.row + 1 }}>
      <AnimatePresence>
        {!gone && (
          <motion.button
            key={broken}
            aria-label="Zniszcz blok"
            onClick={breakIt}
            className="absolute inset-0 cursor-pointer outline-none"
            initial={{ y: broken ? -60 : -320, opacity: 0, rotate: broken ? 0 : (i % 2 ? 14 : -14) }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.2, opacity: 0, rotate: 30, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 260, damping: 16, delay: broken ? 0 : 0.15 + (cell.col * 0.04 + (4 - cell.row) * 0.05) }}
            whileHover={{ y: -6, scale: 1.06 }}
            whileTap={{ scale: 0.85 }}
          >
            <McItem name={cell.block} className="size-full scale-[1.18] drop-shadow-[0_10px_14px_rgba(0,0,0,0.6)]" />
          </motion.button>
        )}
      </AnimatePresence>
      {/* break particles: tiny bits of the same texture flying out */}
      <AnimatePresence>
        {gone &&
          PARTICLES.map(([x, y], k) => (
            <motion.span
              key={`${broken}-${k}`}
              className="pointer-events-none absolute left-1/2 top-1/2 size-[22%] overflow-hidden"
              initial={{ x: "-50%", y: "-50%", opacity: 1, scale: 1 }}
              animate={{ x: `${-50 + x * 160}%`, y: `${-50 + y * 160 + 120}%`, opacity: 0, scale: 0.6, rotate: x * 90 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.2, 0.6, 0.4, 1] }}
            >
              <McItem name={cell.block} className="size-[400%] max-w-none" />
            </motion.span>
          ))}
      </AnimatePresence>
    </div>
  );
}

export function NotFoundView() {
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 14, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } },
    transition: { duration: 0.9, ease: EASE, delay },
  });

  // The block sign leans a little towards the cursor.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [8, -8]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-10, 10]), { stiffness: 120, damping: 18 });
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    mx.set((e.clientX / window.innerWidth) * 2 - 1);
    my.set((e.clientY / window.innerHeight) * 2 - 1);
  };

  return (
    <div className="relative flex min-h-[100svh] flex-col overflow-hidden" onPointerMove={onMove}>
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[1200px] -translate-x-1/2 bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:80px_80px] [mask-image:radial-gradient(ellipse_55%_50%_at_50%_30%,#000,transparent)]" />

      <header className="relative mx-auto flex h-16 w-full max-w-[1200px] items-center px-5">
        <Link href="/" className="transition-opacity hover:opacity-75">
          <Wordmark />
        </Link>
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center px-5 pb-20 pt-6 text-center">
        <div className="[perspective:900px]">
          <motion.div
            style={{ rotateX: rx, rotateY: ry }}
            className="grid w-[min(86vw,500px)] grid-cols-11"
            aria-label="404"
            role="img"
          >
            {CELLS.map((c, i) => (
              <Block key={c.id} cell={c} i={i} />
            ))}
          </motion.div>
        </div>


        <motion.h1 {...fade(0.9)} className="mt-12 text-[clamp(32px,4.4vw,52px)] font-medium leading-[1.05] tracking-[-0.04em]">
          Tej strony nie ma.
        </motion.h1>
        <motion.div {...fade(1.05)} className="mt-10 flex flex-wrap justify-center gap-3">
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
