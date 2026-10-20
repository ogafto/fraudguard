"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

/**
 * The same product frame as the hero shot: silver glow above, a light beam
 * travelling along the top edge, and a tilt that flattens as it scrolls in.
 */
export function AppFrame({
  children,
  title,
  right,
  tilt = 16,
  className,
}: {
  children: ReactNode;
  title?: ReactNode;
  right?: ReactNode;
  tilt?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.3"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const rotateX = useTransform(p, [0, 1], [tilt, 0]);
  const scale = useTransform(p, [0, 1], [0.94, 1]);
  const glow = useTransform(p, [0, 1], [0.4, 1]);

  return (
    <div ref={ref} className={`relative [perspective:2000px] ${className ?? ""}`}>
      <motion.div
        style={{ opacity: glow }}
        className="pointer-events-none absolute inset-x-[10%] -top-24 h-64 rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,255,255,0.14),transparent)] blur-2xl"
      />
      <motion.div style={{ rotateX, scale, transformOrigin: "50% 0%" }} className="relative">
        <div className="relative rounded-[18px] bg-white/[0.03] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_0_1px_rgba(255,255,255,0.09),0_50px_120px_-30px_rgba(0,0,0,0.9)]">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px overflow-hidden">
            <div className="h-px w-1/3 animate-beam bg-gradient-to-r from-transparent via-white to-transparent" />
          </div>
          <div className="overflow-hidden rounded-[14px] bg-[#0b0c0e]">
            {title !== undefined && (
              <header className="flex h-12 items-center gap-2 border-b border-line px-5 text-[13px]">
                {title}
                <span className="ml-auto flex items-center gap-2">{right}</span>
              </header>
            )}
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function LivePill({ children = "Na żywo" }: { children?: ReactNode }) {
  return (
    <span className="flex items-center gap-2 rounded-full px-2.5 py-1 text-[11.5px] text-muted shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
      <span className="size-1.5 animate-pulse-dot rounded-full bg-ok text-ok/50" />
      {children}
    </span>
  );
}

/** Small card used inside frames — same surface as the hero panel cards. */
export function PanelCard({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-white/[0.02] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] ${className ?? ""}`}>
      {title && <div className="mb-3 text-[13px] font-medium">{title}</div>}
      {children}
    </div>
  );
}
