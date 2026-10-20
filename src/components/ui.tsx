"use client";

import { motion, useInView, useScroll, useTransform, type HTMLMotionProps } from "motion/react";
import { useRouter } from "next/navigation";
import { useRef, type ComponentProps, type PointerEvent, type ReactNode } from "react";

export const EASE = [0.16, 1, 0.3, 1] as const;

type Segment = string | { text: string; className?: string };

export function SplitReveal({
  segments,
  className,
  delay = 0,
  play,
  stagger = 0.045,
  as: Tag = "h2",
}: {
  segments: Segment[];
  className?: string;
  delay?: number;
  play?: boolean;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p";
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const show = play ?? inView;

  type Word = { br: true } | { br?: false; w: string; cls?: string; idx: number };
  let i = 0;
  const words = segments.flatMap((seg): Word[] => {
    if (seg === "\n") return [{ br: true }];
    const { text, className: cls } = typeof seg === "string" ? { text: seg, className: "" } : seg;
    return text
      .split(" ")
      .filter(Boolean)
      .map((w) => ({ w, cls, idx: i++ }));
  });

  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{segments.map((s) => (typeof s === "string" ? s : s.text)).join(" ")}</span>
      <span aria-hidden>
        {words.map((word, k) =>
          word.br ? (
            <br key={`br-${k}`} />
          ) : (
            <motion.span
              key={k}
              className={`inline-block ${word.cls ?? ""}`}
              initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
              animate={show ? { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } } : undefined}
              transition={{ duration: 0.9, ease: EASE, delay: delay + word.idx * stagger }}
            >
              {word.w}
              {" "}
            </motion.span>
          ),
        )}
      </span>
    </Tag>
  );
}

export function FadeIn({
  children,
  delay = 0,
  y = 18,
  className,
  ...rest
}: { children: ReactNode; delay?: number; y?: number } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function Reveal({
  children,
  from = "up",
  delay = 0,
  distance = 60,
  className,
}: {
  children: ReactNode;
  from?: "up" | "left" | "right" | "scale";
  delay?: number;
  distance?: number;
  className?: string;
}) {
  const initial =
    from === "left"
      ? { opacity: 0, x: -distance }
      : from === "right"
        ? { opacity: 0, x: distance }
        : from === "scale"
          ? { opacity: 0, scale: 0.92, y: 20 }
          : { opacity: 0, y: distance };
  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.1, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Parallax({ children, offset = 60, className }: { children: ReactNode; offset?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`badge-ring relative inline-flex items-center gap-2 rounded-full bg-white/[0.035] px-3 py-1 text-[13px] font-medium text-fg/90 ${className ?? ""}`}
    >
      {children}
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <Badge>
      <svg viewBox="0 0 16 16" className="size-3.5 text-muted" fill="none" aria-hidden>
        <path d="M8 1.8 13.5 5v6L8 14.2 2.5 11V5L8 1.8Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M2.5 5 8 8.2 13.5 5M8 8.2v6" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
      {children}
    </Badge>
  );
}

function muteAfterBreak(title: Segment[]): Segment[] {
  let after = false;
  return title.map((s) => {
    if (s === "\n") {
      after = true;
      return s;
    }
    return after && typeof s === "string" ? { text: s, className: "text-white/45" } : s;
  });
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  center = false,
}: {
  eyebrow: string;
  title: Segment[];
  children?: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={`flex flex-col ${center ? "items-center text-center" : "items-start"}`}>
      <FadeIn>
        <Eyebrow>{eyebrow}</Eyebrow>
      </FadeIn>
      <SplitReveal
        segments={muteAfterBreak(title)}
        className="text-fg mt-5 max-w-[20ch] pb-1 text-[clamp(34px,4.4vw,56px)] font-medium leading-[1.05] tracking-[-0.035em]"
      />
      {children && (
        <FadeIn delay={0.15} className={`mt-5 max-w-[480px] text-[17px] leading-relaxed text-muted ${center ? "mx-auto" : ""}`}>
          {children}
        </FadeIn>
      )}
    </div>
  );
}

export function Card({ className, children, ...rest }: ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerEnter={() => ref.current?.style.setProperty("--o", "1")}
      onPointerLeave={() => ref.current?.style.setProperty("--o", "0")}
      className={`card spot overflow-hidden ${className ?? ""}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className ?? "size-3.5"} aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Roll({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-flex h-[1.25em] flex-col overflow-hidden leading-[1.25em]">
      <span className="transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">{children}</span>
      <span aria-hidden className="absolute top-full transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">
        {children}
      </span>
    </span>
  );
}

export function Button({
  children,
  variant = "primary",
  href,
  className,
  onClick,
  arrow = false,
  size = "md",
  external = false,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary";
  href?: string;
  className?: string;
  onClick?: () => void;
  arrow?: boolean;
  size?: "sm" | "md";
  external?: boolean;
}) {
  const router = useRouter();
  const styles =
    variant === "primary"
      ? "bg-fg text-bg hover:bg-[#e4e5e7]"
      : "bg-white/[0.06] text-fg ring-1 ring-inset ring-white/[0.1] hover:bg-white/[0.1] hover:ring-white/[0.16]";
  const sizing = size === "sm" ? "h-8 px-3.5 text-[13px]" : "h-11 px-5 text-[14.5px]";

  return (
    <motion.a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        } else if (href?.startsWith("/")) {
          e.preventDefault();
          router.push(href);
        }
      }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97, y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`group inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background-color,box-shadow] duration-300 ${sizing} ${styles} ${className ?? ""}`}
    >
      <Roll>{children}</Roll>
      {arrow && (
        <span className="relative flex size-3.5 overflow-hidden">
          <Arrow className="absolute size-3.5 transition-transform duration-500 ease-out-expo group-hover:translate-x-full" />
          <Arrow className="absolute size-3.5 -translate-x-full transition-transform duration-500 ease-out-expo group-hover:translate-x-0" />
        </span>
      )}
    </motion.a>
  );
}
