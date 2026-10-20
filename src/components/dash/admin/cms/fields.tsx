"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import type { Field } from "@/lib/content";
import { EASE } from "../../../ui";
import { Input, Toggle } from "../../ui";

type Value = unknown;
type Obj = Record<string, Value>;
export type OnChange = (value: Value) => void;

const CONTROL =
  "w-full rounded-lg bg-white/[0.03] px-3 text-[14px] text-fg outline-none shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-shadow placeholder:text-dim focus:shadow-[0_0_0_1px_rgba(255,255,255,0.35)]";

function FieldLabel({ label, hint, children, aside }: { label: string; hint?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-[13px] text-muted">{label}</span>
        {aside}
      </div>
      {children}
      {hint && <p className="mt-1.5 text-[12px] leading-relaxed text-dim">{hint}</p>}
    </div>
  );
}

function AutoTextArea({ value, onChange, max, placeholder }: { value: string; onChange: (v: string) => void; max?: number; placeholder?: string }) {
  const rows = Math.min(14, Math.max(2, Math.ceil(value.length / 70) + value.split("\n").length - 1));
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} maxLength={max} placeholder={placeholder} className={`resize-y py-2 leading-relaxed ${CONTROL}`} />;
}

const Counter = ({ value, max }: { value: string; max?: number }) =>
  max && value.length > max * 0.8 ? <span className={`text-[11.5px] tabular-nums ${value.length >= max ? "text-danger" : "text-dim"}`}>{value.length}/{max}</span> : null;

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      className="flex size-7 items-center justify-center rounded-md text-dim transition-colors hover:bg-white/[0.06] hover:text-fg disabled:pointer-events-none disabled:opacity-30"
    >
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {children}
      </svg>
    </button>
  );
}

const UP = <path d="M8 12.5v-9M4 7l4-3.5L12 7" />;
const DOWN = <path d="M8 3.5v9M4 9l4 3.5L12 9" />;
const COPY = (
  <>
    <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
    <path d="M10.5 5.5V3.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
  </>
);
const TRASH = <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" />;

function ItemTools({ i, n, onMove, onCopy, onRemove, fixed }: { i: number; n: number; onMove: (to: number) => void; onCopy?: () => void; onRemove?: () => void; fixed?: boolean }) {
  return (
    <span className="flex items-center gap-0.5">
      <IconBtn label="Wyżej" onClick={() => onMove(i - 1)} disabled={i === 0}>
        {UP}
      </IconBtn>
      <IconBtn label="Niżej" onClick={() => onMove(i + 1)} disabled={i === n - 1}>
        {DOWN}
      </IconBtn>
      {!fixed && onCopy && (
        <IconBtn label="Duplikuj" onClick={onCopy}>
          {COPY}
        </IconBtn>
      )}
      {!fixed && onRemove && (
        <IconBtn label="Usuń" onClick={onRemove}>
          {TRASH}
        </IconBtn>
      )}
    </span>
  );
}

function AddButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/[0.12] text-[13px] text-muted transition-colors hover:border-white/25 hover:bg-white/[0.03] hover:text-fg disabled:pointer-events-none disabled:opacity-40"
    >
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
        <path d="M8 3.5v9M3.5 8h9" />
      </svg>
      {children}
    </button>
  );
}

const move = <T,>(arr: T[], from: number, to: number) => {
  if (to < 0 || to >= arr.length) return arr;
  const next = arr.slice();
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
};

function StringList({ items, onChange, item, max, multiline }: { items: string[]; onChange: (v: string[]) => void; item: string; max?: number; multiline?: boolean }) {
  const [keys, setKeys] = useState(() => items.map(() => crypto.randomUUID()));
  const k = keys.length === items.length ? keys : items.map((_, i) => keys[i] ?? crypto.randomUUID());
  const set = (next: string[], nextKeys: string[]) => {
    setKeys(nextKeys);
    onChange(next);
  };
  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {items.map((v, i) => (
          <motion.div
            key={k[i]}
            layout="position"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="flex items-start gap-2"
          >
            <span className="mt-2.5 w-5 shrink-0 text-right font-mono text-[11px] text-dim">{i + 1}</span>
            {multiline ? (
              <AutoTextArea value={v} onChange={(x) => set(items.map((y, j) => (j === i ? x : y)), k)} />
            ) : (
              <Input value={v} onChange={(e) => set(items.map((y, j) => (j === i ? e.target.value : y)), k)} className="w-full !text-[14px]" />
            )}
            <span className="mt-1">
              <ItemTools
                i={i}
                n={items.length}
                onMove={(to) => set(move(items, i, to), move(k, i, to))}
                onRemove={() =>
                  set(
                    items.filter((_, j) => j !== i),
                    k.filter((_, j) => j !== i),
                  )
                }
              />
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
      <AddButton onClick={() => set([...items, ""], [...k, crypto.randomUUID()])} disabled={max !== undefined && items.length >= max}>
        Dodaj {item}
      </AddButton>
    </div>
  );
}

function Blocks({ blocks, onChange }: { blocks: (string | string[])[]; onChange: (v: (string | string[])[]) => void }) {
  const [keys, setKeys] = useState(() => blocks.map(() => crypto.randomUUID()));
  const k = keys.length === blocks.length ? keys : blocks.map((_, i) => keys[i] ?? crypto.randomUUID());
  const set = (next: (string | string[])[], nextKeys: string[]) => {
    setKeys(nextKeys);
    onChange(next);
  };
  return (
    <div className="space-y-2.5">
      <AnimatePresence initial={false}>
        {blocks.map((b, i) => (
          <motion.div
            key={k[i]}
            layout="position"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <div className="rounded-xl bg-white/[0.015] p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => set(blocks.map((x, j) => (j === i ? (Array.isArray(x) ? x.join(" ") : x.split(/\n+/).filter(Boolean)) : x)), k)}
                  className="rounded-md px-1.5 py-0.5 text-[12px] text-dim transition-colors hover:bg-white/[0.05] hover:text-fg"
                  title="Zamień typ bloku"
                >
                  {Array.isArray(b) ? "Lista punktowana" : "Akapit"} ⇄
                </button>
                <ItemTools
                  i={i}
                  n={blocks.length}
                  onMove={(to) => set(move(blocks, i, to), move(k, i, to))}
                  onRemove={() =>
                    set(
                      blocks.filter((_, j) => j !== i),
                      k.filter((_, j) => j !== i),
                    )
                  }
                />
              </div>
              {Array.isArray(b) ? (
                <StringList items={b} item="punkt" multiline onChange={(v) => set(blocks.map((x, j) => (j === i ? v : x)), k)} />
              ) : (
                <AutoTextArea value={b} onChange={(v) => set(blocks.map((x, j) => (j === i ? v : x)), k)} />
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="grid grid-cols-2 gap-2">
        <AddButton onClick={() => set([...blocks, ""], [...k, crypto.randomUUID()])}>Akapit</AddButton>
        <AddButton onClick={() => set([...blocks, [""]], [...k, crypto.randomUUID()])}>Lista punktowana</AddButton>
      </div>
    </div>
  );
}

function emptyFor(fields: Field[]): Obj {
  const o: Obj = {};
  for (const f of fields) {
    o[f.key] =
      f.kind === "number" ? 0 : f.kind === "toggle" ? false : f.kind === "strings" || f.kind === "list" || f.kind === "blocks" ? [] : f.kind === "group" ? emptyFor(f.fields) : "";
  }
  return o;
}

function ObjectList({ field, items, onChange }: { field: Extract<Field, { kind: "list" }>; items: Obj[]; onChange: (v: Obj[]) => void }) {
  const [keys, setKeys] = useState(() => items.map(() => crypto.randomUUID()));
  const k = keys.length === items.length ? keys : items.map((_, i) => keys[i] ?? crypto.randomUUID());
  const [open, setOpen] = useState<string | null>(null);
  const set = (next: Obj[], nextKeys: string[]) => {
    setKeys(nextKeys);
    onChange(next);
  };
  const full = field.max !== undefined && items.length >= field.max;

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {items.map((it, i) => {
          const isOpen = open === k[i];
          const title = String(it[field.title] ?? "").trim() || `Nowy ${field.item}`;
          return (
            <motion.div
              key={k[i]}
              layout="position"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              <div className={`rounded-xl transition-[background-color,box-shadow] ${isOpen ? "bg-white/[0.025] shadow-[0_0_0_1px_rgba(255,255,255,0.1)]" : "shadow-[0_0_0_1px_rgba(255,255,255,0.06)] hover:bg-white/[0.015]"}`}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpen(isOpen ? null : k[i])}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setOpen(isOpen ? null : k[i]))}
                  className="flex cursor-pointer items-center gap-3 px-3.5 py-2.5"
                  aria-expanded={isOpen}
                >
                  <span className="w-5 shrink-0 text-right font-mono text-[11px] text-dim">{i + 1}</span>
                  <span className={`min-w-0 flex-1 truncate text-[14px] ${isOpen ? "text-fg" : "text-fg/85"}`}>{title}</span>
                  <ItemTools
                    i={i}
                    n={items.length}
                    fixed={field.fixed}
                    onMove={(to) => set(move(items, i, to), move(k, i, to))}
                    onCopy={full ? undefined : () => set([...items.slice(0, i + 1), structuredClone(it), ...items.slice(i + 1)], [...k.slice(0, i + 1), crypto.randomUUID(), ...k.slice(i + 1)])}
                    onRemove={() => {
                      if (!confirm(`Usunąć: ${title}?`)) return;
                      set(
                        items.filter((_, j) => j !== i),
                        k.filter((_, j) => j !== i),
                      );
                    }}
                  />
                  <motion.svg viewBox="0 0 16 16" className="size-3.5 shrink-0 text-dim" animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }} aria-hidden>
                    <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.svg>
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 border-t border-line px-3.5 pb-4 pt-4 sm:pl-11">
                        <Fields fields={field.fields} value={it} onChange={(v) => set(items.map((x, j) => (j === i ? v : x)), k)} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {!field.fixed && (
        <AddButton
          disabled={full}
          onClick={() => {
            const id = crypto.randomUUID();
            set([...items, emptyFor(field.fields)], [...k, id]);
            setOpen(id);
          }}
        >
          Dodaj {field.item}
          {field.max !== undefined && <span className="text-dim">({items.length}/{field.max})</span>}
        </AddButton>
      )}
    </div>
  );
}

export function FieldControl({ field, value, onChange }: { field: Field; value: Value; onChange: OnChange }) {
  switch (field.kind) {
    case "text": {
      const v = String(value ?? "");
      return (
        <FieldLabel label={field.label} hint={field.hint} aside={<Counter value={v} max={field.max} />}>
          <Input value={v} maxLength={field.max} onChange={(e) => onChange(e.target.value)} className="w-full !text-[14px]" />
        </FieldLabel>
      );
    }
    case "textarea": {
      const v = String(value ?? "");
      return (
        <FieldLabel label={field.label} hint={field.hint} aside={<Counter value={v} max={field.max} />}>
          <AutoTextArea value={v} max={field.max} onChange={onChange} />
        </FieldLabel>
      );
    }
    case "number":
      return (
        <FieldLabel label={field.label}>
          <div className="relative">
            <Input
              type="number"
              inputMode="decimal"
              min={field.min}
              max={field.max}
              step="0.01"
              value={String(value ?? 0)}
              onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
              className="w-full pr-10 !text-[14px] tabular-nums"
            />
            {field.suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-dim">{field.suffix}</span>}
          </div>
        </FieldLabel>
      );
    case "toggle":
      return (
        <div className="flex items-center justify-between gap-4 rounded-lg px-3 py-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
          <div>
            <div className="text-[14px]">{field.label}</div>
            {field.hint && <div className="mt-0.5 text-[12px] text-dim">{field.hint}</div>}
          </div>
          <Toggle on={!!value} onChange={onChange} label={field.label} />
        </div>
      );
    case "strings":
      return (
        <FieldLabel label={field.label}>
          <StringList items={Array.isArray(value) ? (value as string[]) : []} item={field.item} max={field.max} onChange={onChange} />
        </FieldLabel>
      );
    case "group":
      return (
        <div className="space-y-4">
          <Fields fields={field.fields} value={(value ?? {}) as Obj} onChange={onChange} />
        </div>
      );
    case "list":
      return (
        <FieldLabel label={field.label}>
          <ObjectList field={field} items={Array.isArray(value) ? (value as Obj[]) : []} onChange={onChange} />
        </FieldLabel>
      );
    case "blocks":
      return (
        <FieldLabel label={field.label}>
          <Blocks blocks={Array.isArray(value) ? (value as (string | string[])[]) : []} onChange={onChange} />
        </FieldLabel>
      );
  }
}

export function Fields({ fields, value, onChange }: { fields: Field[]; value: Obj; onChange: (v: Obj) => void }) {
  return (
    <>
      {fields.map((f) => (
        <FieldControl key={f.key} field={f} value={value[f.key]} onChange={(v) => onChange({ ...value, [f.key]: v })} />
      ))}
    </>
  );
}
