"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { EASE } from "../../ui";

export const zl = (grosze: number) =>
  (grosze / 100).toLocaleString("pl-PL", { minimumFractionDigits: grosze % 100 ? 2 : 0, maximumFractionDigits: 2 }) + " zł";

export const date = (ms: number | null | undefined, withTime = false) =>
  ms == null
    ? "bez limitu"
    : new Date(ms).toLocaleString("pl-PL", { day: "numeric", month: "short", year: "numeric", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}) });

export const BILLING_LABEL = { monthly: "miesięcznie", lifetime: "dożywotnio" } as const;

export type Notice = { ok: boolean; message: string } | null;

export function NoticeBar({ notice, className = "mt-4" }: { notice: Notice; className?: string }) {
  return (
    <AnimatePresence initial={false}>
      {notice && (
        <motion.div
          key={notice.message}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="overflow-hidden"
        >
          <div className={`${className} flex items-center gap-2 rounded-xl px-3.5 py-3 text-[13.5px] ${notice.ok ? "bg-ok/[0.07] text-ok" : "bg-danger/[0.08] text-danger"}`}>
            <svg viewBox="0 0 16 16" className="size-4 shrink-0" fill="none" aria-hidden>
              <motion.path
                d={notice.ok ? "m4 8.5 2.5 2.5L12 5.5" : "M5 5l6 6M11 5l-6 6"}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4 }}
              />
            </svg>
            {notice.message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Btn({
  children,
  onClick,
  busy,
  primary,
  danger,
  type = "button",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  busy?: boolean;
  primary?: boolean;
  danger?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const tone = primary
    ? "bg-fg text-bg hover:bg-[#e4e5e7]"
    : danger
      ? "bg-danger/[0.08] text-danger shadow-[0_0_0_1px_rgba(239,90,90,0.25)] hover:bg-danger/[0.14]"
      : "bg-white/[0.05] text-fg shadow-[0_0_0_1px_rgba(255,255,255,0.08)] hover:bg-white/[0.09]";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={busy || disabled}
      className={`inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-[13.5px] font-medium transition-[background-color,opacity] disabled:opacity-50 ${tone} ${className}`}
    >
      {busy && <span className={`size-3 animate-spin rounded-full border-[1.5px] ${primary ? "border-bg/25 border-t-bg" : "border-white/20 border-t-fg"}`} />}
      {children}
    </button>
  );
}

export function RowAction({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className="text-[13px] text-muted transition-colors hover:text-fg disabled:opacity-40">
      {children}
    </button>
  );
}

export function Label({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[12px] leading-relaxed text-dim">{hint}</span>}
    </label>
  );
}

const CONTROL =
  "w-full rounded-lg bg-white/[0.03] px-3 text-[13.5px] text-fg outline-none shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-shadow placeholder:text-dim focus:shadow-[0_0_0_1px_rgba(255,255,255,0.35)]";

export function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`h-9 ${CONTROL}`}>
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-panel">
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function TextArea({ value, onChange, rows = 3, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className={`resize-y py-2 leading-relaxed ${CONTROL}`} />;
}

export function Modal({ open, onClose, title, desc, children }: { open: boolean; onClose: () => void; title: string; desc?: string; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-3 backdrop-blur-md sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-label={title}
            initial={{ opacity: 0, y: 24, scale: 0.97, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 12, scale: 0.98, filter: "blur(6px)" }}
            transition={{ duration: 0.4, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[92svh] w-full max-w-[560px] overflow-y-auto rounded-3xl bg-[#0e0f11] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.1),0_40px_120px_-30px_rgba(0,0,0,0.95)] sm:p-7"
          >
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[80%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,255,255,0.07),transparent)]" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[20px] font-medium tracking-[-0.02em]">{title}</h3>
                {desc && <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{desc}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Zamknij"
                className="-mr-1 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-dim transition-colors hover:bg-white/[0.06] hover:text-fg"
              >
                <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="relative">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function KeyBox({ value }: { value: string }) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(value)}
      title="Kopiuj"
      className="mt-4 block w-full rounded-lg bg-white/[0.04] px-3 py-2.5 text-left font-mono text-[14px] shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-colors hover:bg-white/[0.07]"
    >
      {value}
    </button>
  );
}
