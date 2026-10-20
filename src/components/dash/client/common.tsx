"use client";

import { motion } from "motion/react";
import { useState, type ComponentType, type ReactNode, type SVGProps } from "react";
import { IconDiscord, IconKey } from "../../icons";
import { useSite } from "../../site-context";
import { EASE } from "../../ui";

export const formatDate = (ms: number | null) =>
  ms ? new Date(ms).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" }) : "";

export const daysLeft = (ms: number | null) => (ms ? Math.max(0, Math.ceil((ms - Date.now()) / 86_400_000)) : null);

export function CopyKey({ value, className = "" }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className={`group flex w-full items-center gap-3 rounded-xl bg-black/30 px-4 py-3 text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] transition-colors hover:bg-black/40 ${className}`}
    >
      <IconKey className="size-4 shrink-0 text-dim" />
      <span className="min-w-0 flex-1 truncate font-mono text-[14px] tracking-wide">{value}</span>
      <motion.span key={String(copied)} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={`text-[12.5px] ${copied ? "text-ok" : "text-dim group-hover:text-muted"}`}>
        {copied ? "Skopiowano" : "Kopiuj"}
      </motion.span>
    </button>
  );
}

export function EmptyState({
  Icon,
  title,
  children,
  action,
}: {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <motion.span
        initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
        className="flex size-12 items-center justify-center rounded-2xl bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(255,255,255,0.08)]"
      >
        <Icon className="size-5 text-muted" />
      </motion.span>
      <p className="mt-4 text-[15px] font-medium">{title}</p>
      {children && <div className="mt-1.5 max-w-[380px] text-[13.5px] leading-relaxed text-muted">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function DiscordButton({ children = "Kup pakiet na Discordzie" }: { children?: string }) {
  const { discordUrl } = useSite();
  return (
    <a
      href={discordUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex h-10 items-center gap-2.5 rounded-full bg-[#5865f2] px-5 text-[14px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-[filter] hover:brightness-110"
    >
      <IconDiscord className="size-4 transition-transform duration-500 ease-out-expo group-hover:-rotate-12 group-hover:scale-110" />
      {children}
    </a>
  );
}

export function Locked({ email, children }: { email: string; children?: ReactNode }) {
  const steps = [
    { t: "Dołącz na nasz Discord", d: "Tam przyjmujemy płatności i odpowiadamy na pytania." },
    { t: "Wybierz i opłać pakiet", d: "Starter, Pro albo Network, miesięcznie lub dożywotnio." },
    { t: "Pakiet trafi na Twoje konto", d: `Podaj adres ${email}, a administrator przypisze go w kilka minut.` },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="card relative overflow-hidden p-6 sm:p-10"
    >
      <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[70%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,255,255,0.08),transparent)]" />
      <div className="relative mx-auto max-w-[560px] text-center">
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.1)]"
        >
          <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden>
            <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
            <motion.path
              d="M8 10.5V8a4 4 0 0 1 8 0v2.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
            />
          </svg>
        </motion.span>
        <h2 className="mt-6 text-[clamp(22px,2.6vw,30px)] font-medium tracking-[-0.03em]">{children ?? "Ta część odblokuje się z pakietem"}</h2>
        <p className="mt-2 text-[15px] text-muted">Pakiet kupujesz na Discordzie. Po przypisaniu do konta wszystko odblokuje się samo.</p>
      </div>
      <ol className="relative mx-auto mt-9 grid max-w-[760px] gap-3 sm:grid-cols-3">
        {steps.map((s, i) => (
          <motion.li
            key={s.t}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.2 + i * 0.08 }}
            className="rounded-2xl bg-white/[0.02] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.07)]"
          >
            <span className="flex size-6 items-center justify-center rounded-full font-mono text-[11.5px] shadow-[0_0_0_1px_rgba(255,255,255,0.18)]">{i + 1}</span>
            <div className="mt-3 text-[14px] font-medium">{s.t}</div>
            <div className="mt-1 text-[13px] leading-relaxed text-dim">{s.d}</div>
          </motion.li>
        ))}
      </ol>
      <div className="relative mt-8 flex justify-center">
        <DiscordButton />
      </div>
    </motion.div>
  );
}
