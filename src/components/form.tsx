"use client";

import { Arrow } from "./ui";

export function Field({
  label,
  name,
  type = "text",
  textarea,
  placeholder,
  required = true,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  textarea?: boolean;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  const cls =
    "w-full rounded-lg bg-white/[0.03] px-3.5 text-[14.5px] text-fg outline-none shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-shadow duration-200 placeholder:text-dim hover:shadow-[0_0_0_1px_rgba(255,255,255,0.14)] focus:shadow-[0_0_0_1px_rgba(255,255,255,0.4),0_0_0_4px_rgba(255,255,255,0.06)]";
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-muted">{label}</span>
      {textarea ? (
        <textarea name={name} required={required} placeholder={placeholder} rows={4} className={`${cls} resize-none py-3`} />
      ) : (
        <input name={name} type={type} required={required} placeholder={placeholder} autoComplete={autoComplete} className={`${cls} h-11`} />
      )}
    </label>
  );
}

export function SubmitButton({ busy, children, busyLabel, className }: { busy: boolean; children: string; busyLabel: string; className?: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className={`group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-fg px-5 text-[14.5px] font-medium text-bg transition-colors hover:bg-[#e4e5e7] disabled:opacity-70 ${className ?? ""}`}
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
    </button>
  );
}
