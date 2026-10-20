"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, type ChangeEvent, type ClipboardEvent, type KeyboardEvent, type ReactNode } from "react";
import { Arrow, EASE } from "./ui";

const INPUT =
  "w-full rounded-xl bg-white/[0.03] px-3.5 text-[14.5px] text-fg outline-none shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-shadow duration-200 placeholder:text-dim hover:shadow-[0_0_0_1px_rgba(255,255,255,0.14)] focus:shadow-[0_0_0_1px_rgba(255,255,255,0.4),0_0_0_4px_rgba(255,255,255,0.06)]";

export function Field({
  label,
  name,
  type = "text",
  placeholder,
  required = true,
  autoComplete,
  value,
  onChange,
  right,
  adornment,
  minLength,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  value?: string;
  onChange?: (v: string) => void;
  /** Element shown at the right edge inside the input. */
  right?: ReactNode;
  /** Element shown at the left edge inside the input. */
  adornment?: ReactNode;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-muted">{label}</span>
      <span className="relative block">
        {adornment && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">{adornment}</span>}
        <input
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          value={value}
          onChange={onChange ? (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value) : undefined}
          className={`${INPUT} h-12 ${adornment ? "pl-11" : ""} ${right ? "pr-12" : ""}`}
        />
        {right && <span className="absolute right-1.5 top-1/2 -translate-y-1/2">{right}</span>}
      </span>
    </label>
  );
}

/** Rough strength score 0 to 4 for the meter under the password field. */
function strength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
  return p ? Math.max(1, s) : 0;
}
const STRENGTH = ["", "Słabe", "Może być", "Dobre", "Bardzo dobre"];

export function PasswordField({
  label = "Hasło",
  value,
  onChange,
  meter = false,
  autoComplete,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  meter?: boolean;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  const s = strength(value);
  return (
    <div>
      <Field
        label={label}
        name="password"
        type={show ? "text" : "password"}
        placeholder="Co najmniej 8 znaków"
        autoComplete={autoComplete}
        minLength={8}
        value={value}
        onChange={onChange}
        right={
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Ukryj hasło" : "Pokaż hasło"}
            className="flex size-9 items-center justify-center rounded-lg text-dim transition-colors hover:bg-white/[0.06] hover:text-fg"
          >
            <svg viewBox="0 0 20 20" className="size-[18px]" fill="none" aria-hidden>
              <path d="M1.8 10S4.8 4.5 10 4.5 18.2 10 18.2 10 15.2 15.5 10 15.5 1.8 10 1.8 10Z" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
              <motion.path d="M3 17 17 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" initial={false} animate={{ pathLength: show ? 0 : 1 }} transition={{ duration: 0.25 }} />
            </svg>
          </button>
        }
      />
      {meter && (
        <AnimatePresence initial={false}>
          {value && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 pt-2.5">
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3, 4].map((k) => (
                    <motion.span
                      key={k}
                      className="h-1 flex-1 rounded-full"
                      animate={{ backgroundColor: s >= k ? (s <= 1 ? "#ef5a5a" : s === 2 ? "#e8b04b" : "rgba(247,248,248,0.85)") : "rgba(255,255,255,0.08)" }}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
                <span className="w-20 text-right text-[12px] text-dim">{STRENGTH[s]}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

/** Six boxes for the email code: typing moves forward, backspace moves back, pasting fills all. */
export function OtpInput({ value, onChange, error, disabled }: { value: string; onChange: (v: string) => void; error?: boolean; disabled?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const set = (i: number, d: string) => {
    const next = (value.slice(0, i) + d + value.slice(i + 1)).slice(0, 6);
    onChange(next.replace(/\D/g, ""));
  };
  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
      set(i - 1, "");
    }
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
  };
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const d = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!d) return;
    e.preventDefault();
    onChange(d);
    refs.current[Math.min(5, d.length)]?.focus();
  };

  return (
    <motion.div className="grid grid-cols-6 gap-2 sm:gap-2.5" animate={error ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }} transition={{ duration: 0.4 }}>
      {digits.map((d, i) => (
        <motion.input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Cyfra ${i + 1}`}
          maxLength={1}
          disabled={disabled}
          value={d}
          onPaste={onPaste}
          onKeyDown={(e) => onKey(i, e)}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(-1);
            set(i, v);
            if (v && i < 5) refs.current[i + 1]?.focus();
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, scale: d ? [1, 1.06, 1] : 1 }}
          transition={{ duration: 0.35, ease: EASE, delay: value ? 0 : 0.15 + i * 0.04 }}
          className={`aspect-[4/5] w-full rounded-xl bg-white/[0.03] text-center font-mono text-[22px] text-fg caret-transparent outline-none transition-shadow duration-200 focus:shadow-[0_0_0_1px_rgba(255,255,255,0.5),0_0_0_4px_rgba(255,255,255,0.07)] disabled:opacity-60 ${error ? "shadow-[0_0_0_1px_rgba(239,90,90,0.6)]" : d ? "shadow-[0_0_0_1px_rgba(255,255,255,0.3)]" : "shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"}`}
        />
      ))}
    </motion.div>
  );
}

export function FormError({ children }: { children?: string | null }) {
  return (
    <AnimatePresence initial={false}>
      {children && (
        <motion.p
          role="alert"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="overflow-hidden text-[13.5px] text-danger"
        >
          <span className="block pt-1">{children}</span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export function SubmitButton({
  busy,
  children,
  busyLabel,
  className,
  disabled,
}: {
  busy: boolean;
  children: string;
  busyLabel: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={busy || disabled}
      className={`group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-fg px-5 text-[14.5px] font-medium text-bg transition-[background-color,opacity] hover:bg-[#e4e5e7] disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={busy ? "busy" : "idle"}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="flex items-center gap-2"
        >
          {busy ? (
            <>
              <span className="size-3.5 animate-spin rounded-full border-[1.5px] border-bg/25 border-t-bg" />
              {busyLabel}
            </>
          ) : (
            <>
              {children}
              <Arrow className="size-3.5 transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5" />
            </>
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
