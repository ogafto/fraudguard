"use client";

import { animate, motion, useInView } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import type { AlertAction } from "@/lib/mock";
import { McHead } from "../mc-head";
import { EASE } from "../ui";

export function PageHeader({ title, desc, actions }: { title: string; desc?: string; actions?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
    >
      <div>
        <h1 className="text-[26px] font-medium tracking-[-0.03em]">{title}</h1>
        {desc && <p className="mt-1 text-[14.5px] text-muted">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </motion.div>
  );
}

/** Animated container used by every dashboard block. */
export function Block({
  children,
  className,
  delay = 0,
  title,
  action,
  pad = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  title?: string;
  action?: ReactNode;
  pad?: boolean;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE, delay }}
      className={`card overflow-hidden ${className ?? ""}`}
    >
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <h2 className="text-[14px] font-medium">{title}</h2>
          {action}
        </div>
      )}
      <div className={pad ? "p-5" : ""}>{children}</div>
    </motion.section>
  );
}

/** Counts the number inside a string like "3 912", "18 420 zł" or "0,21 ms" up from zero. */
function CountUp({ value, delay = 0 }: { value: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const done = useRef(false);
  useEffect(() => {
    const m = value.match(/^(\D*?)(\d[\d\s\u00a0]*(?:,\d+)?)(.*)$/);
    if (!ref.current) return;
    // Count once; later value changes (live data) just show the new number.
    if (!m || done.current) {
      ref.current.textContent = value;
      return;
    }
    if (!inView) return;
    const [, pre, num, post] = m;
    const decimals = num.includes(",") ? num.split(",")[1].length : 0;
    const target = parseFloat(num.replace(/[\s\u00a0]/g, "").replace(",", "."));
    const el = ref.current;
    const ctrl = animate(0, target, {
      duration: 1.4,
      delay: delay + 0.15,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = pre + v.toLocaleString("pl-PL", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + post;
      },
      onComplete: () => {
        done.current = true;
        el.textContent = value;
      },
    });
    return () => ctrl.stop();
  }, [inView, delay, value]);
  return <span ref={ref}>{value}</span>;
}

export function Stat({
  label,
  value,
  delta,
  positive = true,
  delay = 0,
  spark,
}: {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
  delay?: number;
  spark?: number[];
}) {
  const pts = spark ?? [];
  const max = Math.max(...pts, 1);
  const min = Math.min(...pts, 0);
  const d = pts.map((v, i) => `${(i / (pts.length - 1)) * 100},${30 - ((v - min) / (max - min || 1)) * 26}`).join(" ");
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE, delay }}
      whileHover={{ y: -3 }}
      className="card group p-5 transition-shadow duration-500 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_0_0_1px_rgba(255,255,255,0.14),0_20px_40px_-20px_rgba(0,0,0,0.9)]"
    >
      <div className="text-[13px] text-muted">{label}</div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <div className="text-[28px] font-medium leading-none tracking-[-0.03em] tabular-nums">
            <CountUp value={value} delay={delay} />
          </div>
          {delta && <div className={`mt-2 text-[12.5px] ${positive ? "text-ok" : "text-danger"}`}>{delta}</div>}
        </div>
        {pts.length > 1 && (
          <svg viewBox="0 0 100 32" className="h-8 w-24" preserveAspectRatio="none">
            <motion.polyline
              points={d}
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1.4"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: EASE, delay: delay + 0.2 }}
            />
          </svg>
        )}
      </div>
    </motion.div>
  );
}

const ACTION_STYLE: Record<AlertAction, string> = {
  flaga: "text-muted bg-white/[0.05]",
  cofnięcie: "text-warn bg-warn/10",
  kick: "text-fg bg-white/[0.09]",
  ban: "text-danger bg-danger/10",
};

export function ActionBadge({ action }: { action: AlertAction }) {
  return <span className={`rounded-md px-1.5 py-0.5 text-[12px] font-medium ${ACTION_STYLE[action]}`}>{action}</span>;
}

export function StatusDot({ tone = "ok", children }: { tone?: "ok" | "warn" | "danger" | "dim"; children: ReactNode }) {
  const c = { ok: "bg-ok", warn: "bg-warn", danger: "bg-danger", dim: "bg-dim" }[tone];
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px]">
      <span className={`size-1.5 rounded-full ${c}`} />
      {children}
    </span>
  );
}

export function Pill({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "ok" | "warn" | "danger" }) {
  const c = {
    default: "bg-white/[0.06] text-muted",
    ok: "bg-ok/10 text-ok",
    warn: "bg-warn/10 text-warn",
    danger: "bg-danger/10 text-danger",
  }[tone];
  return <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[12px] font-medium ${c}`}>{children}</span>;
}

export function Player({ name, sub }: { name: string; sub?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <McHead name={name} className="size-6 shrink-0 rounded-[5px]" />
      <span className="min-w-0">
        <span className="block truncate text-[13.5px] text-fg">{name}</span>
        {sub && <span className="block truncate text-[12px] text-dim">{sub}</span>}
      </span>
    </span>
  );
}

/** Simple table with sticky header styling. */
export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left">
        <thead>
          <tr className="border-b border-line text-[12px] text-dim">
            {head.map((h, i) => (
              <th key={h + i} className={`px-5 py-2.5 font-medium ${i === head.length - 1 ? "text-right" : ""}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[13.5px] [&>tr:last-child]:border-0 [&>tr]:border-b [&>tr]:border-line/70 [&>tr]:transition-colors [&>tr:hover]:bg-white/[0.02]">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function Td({ children, right = false, className }: { children: ReactNode; right?: boolean; className?: string }) {
  return <td className={`px-5 py-3 ${right ? "text-right" : ""} ${className ?? ""}`}>{children}</td>;
}

/** Stacked bar chart (e.g. detections by category per day). */
export function StackedBars({
  data,
  keys,
  labelKey,
}: {
  data: Record<string, number | string>[];
  keys: { key: string; label: string; className: string }[];
  labelKey: string;
}) {
  const totals = data.map((d) => keys.reduce((a, k) => a + Number(d[k.key]), 0));
  const max = Math.max(...totals);
  return (
    <div>
      <div className="flex h-48 items-end gap-3">
        {data.map((d, i) => (
          <div key={String(d[labelKey])} className="flex h-full flex-1 flex-col justify-end gap-[3px]">
            {keys
              .slice()
              .reverse()
              .map((k, j) => (
                <motion.div
                  key={k.key}
                  className={`w-full rounded-[4px] ${k.className}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${(Number(d[k.key]) / max) * 100}%` }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.05 + j * 0.03 }}
                />
              ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3">
        {data.map((d) => (
          <div key={String(d[labelKey])} className="flex-1 text-center text-[12px] text-dim">
            {String(d[labelKey])}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-[12.5px] text-muted">
        {keys.map((k) => (
          <span key={k.key} className="flex items-center gap-2">
            <span className={`size-2 rounded-sm ${k.className}`} />
            {k.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Smooth area chart for a single series. */
export function AreaLine({ values, labels }: { values: number[]; labels: string[] }) {
  const W = 600;
  const H = 180;
  const max = Math.max(...values) * 1.1;
  const p = values.map((v, i) => [(i / (values.length - 1)) * W, H - (v / max) * H] as const);
  let d = `M${p[0][0]},${p[0][1].toFixed(1)}`;
  for (let i = 1; i < p.length; i++) {
    const cx = (p[i - 1][0] + p[i][0]) / 2;
    d += ` C${cx.toFixed(1)},${p[i - 1][1].toFixed(1)} ${cx.toFixed(1)},${p[i][1].toFixed(1)} ${p[i][0].toFixed(1)},${p[i][1].toFixed(1)}`;
  }
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-48 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="dash-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="rgba(255,255,255,0.05)" />
        ))}
        <motion.path d={`${d} L${W},${H} L0,${H} Z`} fill="url(#dash-area)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }} />
        <motion.path
          d={d}
          fill="none"
          stroke="#f7f8f8"
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
        />
      </svg>
      <div className="mt-2 flex justify-between text-[12px] text-dim">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300 ${on ? "bg-fg" : "bg-white/[0.12]"}`}
      aria-pressed={on}
      aria-label={label}
    >
      <motion.span
        className={`absolute top-0.5 size-4 rounded-full ${on ? "bg-bg" : "bg-white/70"}`}
        animate={{ left: on ? 18 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
      />
    </button>
  );
}

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={`h-9 rounded-lg bg-white/[0.03] px-3 text-[13.5px] text-fg outline-none shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-shadow placeholder:text-dim focus:shadow-[0_0_0_1px_rgba(255,255,255,0.35)] ${className ?? ""}`}
    />
  );
}
