"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import type { Plan } from "@/lib/content";
import { IconSearch } from "../../icons";
import { McHead } from "../../mc-head";
import { EASE } from "../../ui";

export type PickUser = { email: string; nick: string; verified: boolean };
export type Billing = "monthly" | "lifetime";

export function FieldLabel({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <span className="text-[13px] font-medium text-muted">{children}</span>
      {hint && <span className="text-[12px] text-dim">{hint}</span>}
    </div>
  );
}

export function UserPicker({
  users,
  value,
  onChange,
  allowEmpty,
  emptyLabel = "Bez właściciela",
}: {
  users: PickUser[];
  value: string;
  onChange: (email: string) => void;
  allowEmpty?: boolean;
  emptyLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const selected = users.find((u) => u.email === value) ?? null;

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return users.filter((u) => `${u.nick} ${u.email}`.toLowerCase().includes(t)).slice(0, 8);
  }, [users, q]);
  const options: (PickUser | null)[] = allowEmpty && !q ? [null, ...list] : list;
  const cur = Math.min(sel, Math.max(0, options.length - 1));

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  const pick = (u: PickUser | null) => {
    onChange(u?.email ?? "");
    setOpen(false);
    setQ("");
  };

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setSel(0);
          setTimeout(() => input.current?.focus(), 30);
        }}
        className={`flex h-14 w-full items-center gap-3 rounded-xl bg-white/[0.03] px-3 text-left transition-shadow duration-200 ${open ? "shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_0_0_4px_rgba(255,255,255,0.05)]" : "shadow-[0_0_0_1px_rgba(255,255,255,0.08)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.16)]"}`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={selected?.email ?? "none"}
            initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
            className="shrink-0"
          >
            {selected ? (
              <McHead name={selected.nick} className="size-9 rounded-lg" />
            ) : (
              <span className="flex size-9 items-center justify-center rounded-lg bg-white/[0.05] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                <IconSearch className="size-4 text-dim" />
              </span>
            )}
          </motion.span>
        </AnimatePresence>
        <span className="min-w-0 flex-1">
          {selected ? (
            <>
              <span className="block truncate text-[14.5px] font-medium">{selected.nick}</span>
              <span className="block truncate text-[12.5px] text-dim">{selected.email}</span>
            </>
          ) : (
            <span className="text-[14px] text-dim">{allowEmpty ? emptyLabel : "Wybierz konto klienta"}</span>
          )}
        </span>
        <motion.svg viewBox="0 0 16 16" className="size-3.5 text-dim" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} aria-hidden>
          <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE }}
            style={{ transformOrigin: "50% 0%" }}
            className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl bg-[#131416] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(255,255,255,0.1),0_24px_60px_-16px_rgba(0,0,0,0.95)]"
          >
            <div className="flex items-center gap-2 border-b border-line px-3">
              <IconSearch className="size-3.5 text-dim" />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSel(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSel((v) => Math.min(options.length - 1, v + 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSel((v) => Math.max(0, v - 1));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    if (options.length) pick(options[cur]);
                  } else if (e.key === "Escape") setOpen(false);
                }}
                placeholder="Szukaj po nicku lub e-mailu…"
                className="h-11 flex-1 bg-transparent text-[14px] outline-none placeholder:text-dim"
              />
            </div>
            <ul className="max-h-64 overflow-y-auto p-1.5">
              {options.length === 0 && <li className="px-3 py-6 text-center text-[13px] text-dim">Nie ma takiego konta. Klient musi najpierw się zarejestrować.</li>}
              {options.map((u, i) => (
                <li key={u?.email ?? "none"}>
                  <button
                    type="button"
                    onMouseEnter={() => setSel(i)}
                    onClick={() => pick(u)}
                    className={`relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${i === cur ? "text-fg" : "text-muted"}`}
                  >
                    {i === cur && <motion.span layoutId="user-pick-sel" className="absolute inset-0 rounded-lg bg-white/[0.06]" transition={{ type: "spring", stiffness: 600, damping: 40 }} />}
                    {u ? (
                      <>
                        <McHead name={u.nick} className="relative size-7 rounded-md" />
                        <span className="relative min-w-0 flex-1">
                          <span className="block truncate text-[13.5px]">{u.nick}</span>
                          <span className="block truncate text-[12px] text-dim">{u.email}</span>
                        </span>
                        {!u.verified && <span className="relative rounded-md bg-warn/10 px-1.5 py-0.5 text-[11px] text-warn">bez weryfikacji</span>}
                        {u.email === value && (
                          <svg viewBox="0 0 16 16" className="relative size-4 text-fg" aria-hidden>
                            <path d="m4 8.5 2.5 2.5L12 5.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </>
                    ) : (
                      <span className="relative py-1 text-[13.5px]">{emptyLabel}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PlanPicker({ plans, value, onChange, billing }: { plans: Plan[]; value: string; onChange: (id: string) => void; billing: Billing }) {
  const id = useId();
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {plans.map((p, i) => {
        const on = p.id === value;
        return (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE, delay: i * 0.05 }}
            whileTap={{ scale: 0.97 }}
            className={`relative flex flex-col items-start rounded-xl p-3.5 text-left transition-colors ${on ? "text-fg" : "text-muted hover:bg-white/[0.03]"} shadow-[0_0_0_1px_rgba(255,255,255,0.07)]`}
          >
            {on && (
              <motion.span
                layoutId={`plan-${id}`}
                className="absolute inset-0 rounded-xl bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.4)]"
                transition={{ type: "spring", stiffness: 480, damping: 36 }}
              />
            )}
            <span className="relative flex w-full items-center justify-between">
              <span className="text-[14.5px] font-medium">{p.name}</span>
              <span className={`flex size-4 items-center justify-center rounded-full transition-colors ${on ? "bg-fg" : "shadow-[0_0_0_1.5px_rgba(255,255,255,0.25)]"}`}>
                {on && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="size-1.5 rounded-full bg-bg" />}
              </span>
            </span>
            <span className="relative mt-3 flex items-end gap-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={billing}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="text-[22px] font-medium leading-none tracking-[-0.03em] tabular-nums"
                >
                  {billing === "monthly" ? p.monthly : p.lifetime}
                </motion.span>
              </AnimatePresence>
              <span className="pb-0.5 text-[12px] text-dim">zł</span>
            </span>
            <span className="relative mt-1.5 text-[12px] text-dim">{p.features[0]}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

export function BillingPicker({ value, onChange }: { value: Billing; onChange: (b: Billing) => void }) {
  const id = useId();
  const items: { value: Billing; label: string; sub: string }[] = [
    { value: "monthly", label: "30 dni", sub: "odnawiane ręcznie" },
    { value: "lifetime", label: "Dożywotnio", sub: "bez wygaśnięcia" },
  ];
  return (
    <div className="grid grid-cols-2 gap-1 rounded-2xl bg-white/[0.03] p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          onClick={() => onChange(it.value)}
          className={`relative rounded-xl px-3 py-2 text-center transition-colors ${value === it.value ? "text-bg" : "text-muted hover:text-fg"}`}
        >
          {value === it.value && <motion.span layoutId={`billing-${id}`} className="absolute inset-0 rounded-xl bg-fg" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
          <span className="relative block text-[13.5px] font-medium">{it.label}</span>
          <span className={`relative block text-[11.5px] ${value === it.value ? "text-bg/60" : "text-dim"}`}>{it.sub}</span>
        </button>
      ))}
    </div>
  );
}

export function AmountInput({ value, onChange, suggested }: { value: string; onChange: (v: string) => void; suggested: number | null }) {
  const custom = suggested !== null && Number(value.replace(",", ".")) !== suggested;
  return (
    <div>
      <div className="group flex items-baseline gap-2 rounded-xl bg-white/[0.03] px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-shadow focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_0_0_4px_rgba(255,255,255,0.05)]">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ""))}
          inputMode="decimal"
          required
          className="w-full min-w-0 bg-transparent text-[30px] font-medium tracking-[-0.03em] tabular-nums outline-none"
        />
        <span className="text-[15px] text-dim">zł</span>
      </div>
      <AnimatePresence initial={false}>
        {custom && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease: EASE }} className="overflow-hidden">
            <button type="button" onClick={() => onChange(String(suggested))} className="mt-2 rounded-full bg-white/[0.05] px-3 py-1 text-[12px] text-muted shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-colors hover:text-fg">
              Wróć do ceny z cennika: {suggested} zł
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SuccessKey({ text, licenseKey, onClose }: { text: string; licenseKey: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-6 flex flex-col items-center text-center">
      <div className="relative flex size-16 items-center justify-center">
        {[0, 1].map((k) => (
          <motion.span
            key={k}
            className="absolute inset-0 rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.4)]"
            initial={{ scale: 0.6, opacity: 0.8 }}
            animate={{ scale: 2.1, opacity: 0 }}
            transition={{ duration: 1.3, ease: EASE, delay: 0.2 + k * 0.22 }}
          />
        ))}
        <motion.span className="absolute inset-0 rounded-full bg-fg" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} />
        <svg viewBox="0 0 24 24" className="relative size-7 text-bg" aria-hidden>
          <motion.path
            d="m6 12.5 4 4 8-9"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.2 }}
          />
        </svg>
      </div>
      <p className="mt-6 max-w-[400px] text-[14px] leading-relaxed text-muted">{text}</p>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(licenseKey);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
        className="group mt-5 flex w-full items-center gap-3 rounded-xl bg-black/30 px-4 py-3.5 text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] transition-colors hover:bg-black/40"
      >
        <span className="min-w-0 flex-1 truncate font-mono text-[15px] tracking-wide">{licenseKey}</span>
        <motion.span key={String(copied)} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={`text-[12.5px] ${copied ? "text-ok" : "text-dim group-hover:text-muted"}`}>
          {copied ? "Skopiowano" : "Kopiuj"}
        </motion.span>
      </button>
      <button type="button" onClick={onClose} className="mt-6 h-10 w-full rounded-full bg-fg text-[14px] font-medium text-bg transition-colors hover:bg-[#e4e5e7]">
        Gotowe
      </button>
    </div>
  );
}
