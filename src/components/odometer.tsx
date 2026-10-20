"use client";

import { AnimatePresence, motion } from "motion/react";

function Digit({ d }: { d: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden">
      <motion.span
        className="absolute left-0 top-0 flex flex-col"
        animate={{ y: `${-d * 10}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block h-[1em] leading-[1em]">
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function Odometer({ value }: { value: number }) {
  const digits = String(value).split("").map(Number);
  return (
    <span className="inline-flex tabular-nums leading-[1em]">
      <AnimatePresence initial={false} mode="popLayout">
        {digits.map((d, i) => (
          <motion.span
            key={digits.length - i}
            initial={{ opacity: 0, y: "0.3em" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-0.3em" }}
            transition={{ duration: 0.3 }}
          >
            <Digit d={d} />
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}
