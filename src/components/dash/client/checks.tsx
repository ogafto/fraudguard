"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import { resetAnticheatAction, saveAnticheatAction } from "@/lib/account-actions";
import { ACTION_LABEL, BAN_LABEL, type AnticheatSettings, type BanDuration, type CheckAction, type CheckSetting } from "@/lib/anticheat";
import { CHECK_CATEGORIES } from "@/lib/checks";
import { IconSearch } from "../../icons";
import { EASE } from "../../ui";
import { Input, PageHeader, Pill, Toggle } from "../ui";
import { Locked } from "./common";

type Tab = "checks" | "alerts" | "punish";
const TABS: { id: Tab; label: string }[] = [
  { id: "checks", label: "Checki" },
  { id: "alerts", label: "Alerty" },
  { id: "punish", label: "Kary" },
];
const SENS = ["Niska", "Średnia", "Wysoka"];

function Segmented<T extends string | number>({ value, options, onChange, id, small }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; id: string; small?: boolean }) {
  return (
    <div className="inline-flex rounded-full bg-white/[0.03] p-0.5 shadow-[0_0_0_1px_rgba(255,255,255,0.07)]">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={`relative rounded-full transition-colors ${small ? "h-7 px-2.5 text-[12px]" : "h-8 px-3.5 text-[13px]"} ${value === o.value ? "text-bg" : "text-muted hover:text-fg"}`}
        >
          {value === o.value && <motion.span layoutId={id} className="absolute inset-0 rounded-full bg-fg" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

function Row({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="text-[14px]">{title}</div>
        {desc && <div className="mt-0.5 text-[12.5px] leading-relaxed text-dim">{desc}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function TextField({ value, onChange, placeholder, mono, wide }: { value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean; wide?: boolean }) {
  return <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${wide ? "w-full sm:w-[420px]" : "w-full sm:w-64"} ${mono ? "font-mono" : ""}`} />;
}

function CheckRow({ name, desc, beta, value, onChange, index }: { name: string; desc: string; beta: boolean; value: CheckSetting; onChange: (v: CheckSetting) => void; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE, delay: Math.min(index, 10) * 0.025 }}
      className={`grid gap-4 px-5 py-4 transition-opacity duration-300 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center ${value.enabled ? "" : "opacity-55"}`}
    >
      <div className="flex min-w-0 items-start gap-3.5">
        <div className="pt-0.5">
          <Toggle on={value.enabled} onChange={(enabled) => onChange({ ...value, enabled })} label={`Włącz ${name}`} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[14.5px] font-medium">
            {name}
            {beta && <Pill tone="warn">beta</Pill>}
          </div>
          <div className="mt-0.5 text-[12.5px] leading-relaxed text-dim">{desc}</div>
        </div>
      </div>
      <div className={`flex flex-wrap items-center gap-2 pl-[50px] lg:pl-0 ${value.enabled ? "" : "pointer-events-none"}`}>
        <Segmented
          small
          id={`sens-${name}`}
          value={value.sensitivity}
          options={[1, 2, 3].map((v) => ({ value: v as 1 | 2 | 3, label: SENS[v - 1] }))}
          onChange={(sensitivity) => onChange({ ...value, sensitivity })}
        />
        <Segmented
          small
          id={`act-${name}`}
          value={value.action}
          options={(Object.keys(ACTION_LABEL) as CheckAction[]).map((a) => ({ value: a, label: ACTION_LABEL[a] }))}
          onChange={(action) => onChange({ ...value, action })}
        />
        <label className="flex h-7 items-center gap-1.5 rounded-full bg-white/[0.03] pl-3 pr-1 text-[12px] text-dim shadow-[0_0_0_1px_rgba(255,255,255,0.07)]" title="Po ilu naruszeniach wykonać karę">
          VL
          <input
            type="number"
            min={1}
            max={200}
            value={value.vl}
            onChange={(e) => onChange({ ...value, vl: Math.max(1, Math.min(200, Number(e.target.value) || 1)) })}
            className="h-6 w-12 rounded-full bg-transparent text-center font-mono text-[12px] text-fg outline-none"
          />
        </label>
      </div>
    </motion.div>
  );
}

export function ClientChecks({ email, locked, initial }: { email: string; locked: boolean; initial: AnticheatSettings }) {
  const [saved, setSaved] = useState(initial);
  const [s, setS] = useState(initial);
  const [tab, setTab] = useState<Tab>("checks");
  const [cat, setCat] = useState(CHECK_CATEGORIES[0].id);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, start] = useTransition();

  const dirty = useMemo(() => JSON.stringify(s) !== JSON.stringify(saved), [s, saved]);
  const all = CHECK_CATEGORIES.flatMap((c) => c.checks);
  const enabled = all.filter((c) => s.checks[c.name]?.enabled).length;

  if (locked) {
    return (
      <>
        <PageHeader title="Ustawienia anticheata" desc="Czułość checków, kary i alerty dla wszystkich Twoich serwerów." />
        <Locked email={email}>Ustawienia anticheata odblokują się z pakietem</Locked>
      </>
    );
  }

  const query = q.trim().toLowerCase();
  const visible = query ? all.filter((c) => `${c.name} ${c.desc}`.toLowerCase().includes(query)) : CHECK_CATEGORIES.find((c) => c.id === cat)!.checks;
  const setCheck = (name: string, v: CheckSetting) => setS((p) => ({ ...p, checks: { ...p.checks, [name]: v } }));
  const setAll = (on: boolean) => setS((p) => ({ ...p, checks: { ...p.checks, ...Object.fromEntries(visible.map((c) => [c.name, { ...p.checks[c.name], enabled: on }])) } }));

  const save = () =>
    start(async () => {
      const res = await saveAnticheatAction(s);
      setMsg(res);
      if (res.ok) setSaved(s);
    });
  const reset = () => {
    if (!window.confirm("Przywrócić wszystkie ustawienia do domyślnych?")) return;
    start(async () => {
      const res = await resetAnticheatAction();
      setMsg(res);
      if (res.ok) window.location.reload();
    });
  };

  return (
    <>
      <PageHeader
        title="Ustawienia anticheata"
        desc={`${enabled} z ${all.length} checków włączonych. Zmiany obowiązują na wszystkich Twoich serwerach.`}
        actions={
          <button onClick={reset} disabled={busy} className="h-9 rounded-full px-4 text-[13.5px] text-muted transition-colors hover:text-fg">
            Przywróć domyślne
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Segmented id="ac-tab" value={tab} options={TABS.map((t) => ({ value: t.id, label: t.label }))} onChange={setTab} />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: EASE }}>
          {tab === "checks" && (
            <section className="card overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-1">
                  {CHECK_CATEGORIES.map((c) => {
                    const on = c.checks.filter((x) => s.checks[x.name]?.enabled).length;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setCat(c.id);
                          setQ("");
                        }}
                        className={`relative h-8 rounded-full px-3 text-[13px] transition-colors ${cat === c.id && !query ? "text-fg" : "text-muted hover:text-fg"}`}
                      >
                        {cat === c.id && !query && <motion.span layoutId="ac-cat" className="absolute inset-0 rounded-full bg-white/[0.08]" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                        <span className="relative">
                          {c.label} <span className="text-dim">{on}/{c.checks.length}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 lg:w-60">
                    <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-dim" />
                    <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj checka…" className="w-full pl-8" />
                  </div>
                  <button onClick={() => setAll(true)} className="h-9 shrink-0 rounded-full px-3 text-[12.5px] text-muted transition-colors hover:text-fg">
                    Włącz wszystkie
                  </button>
                  <button onClick={() => setAll(false)} className="h-9 shrink-0 rounded-full px-3 text-[12.5px] text-muted transition-colors hover:text-fg">
                    Wyłącz
                  </button>
                </div>
              </div>
              <div className="divide-y divide-line">
                {visible.map((c, i) => (
                  <CheckRow key={c.name} index={i} name={c.name} desc={c.desc} beta={c.status === "beta"} value={s.checks[c.name]} onChange={(v) => setCheck(c.name, v)} />
                ))}
                {visible.length === 0 && <p className="px-5 py-10 text-center text-[14px] text-dim">Nie ma checka o takiej nazwie.</p>}
              </div>
            </section>
          )}

          {tab === "alerts" && (
            <section className="card divide-y divide-line overflow-hidden">
              <Row title="Alerty na czacie" desc="Administracja widzi flagi w grze w czasie rzeczywistym.">
                <Toggle on={s.alerts.inGame} onChange={(inGame) => setS((p) => ({ ...p, alerts: { ...p.alerts, inGame } }))} label="Alerty na czacie" />
              </Row>
              <Row title="Uprawnienie do alertów" desc="Gracze z tym uprawnieniem dostają alerty.">
                <TextField mono value={s.alerts.permission} onChange={(permission) => setS((p) => ({ ...p, alerts: { ...p.alerts, permission } }))} />
              </Row>
              <Row title="Minimalne VL alertu" desc="Pomija pojedyncze, przypadkowe flagi.">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={s.alerts.minVl}
                  onChange={(e) => setS((p) => ({ ...p, alerts: { ...p.alerts, minVl: Math.max(1, Math.min(100, Number(e.target.value) || 1)) } }))}
                  className="w-24 text-center font-mono"
                />
              </Row>
              <Row title="Webhook Discorda" desc="Alerty i kary z Twoich serwerów trafią na wybrany kanał. Zostaw puste, żeby wyłączyć.">
                <TextField wide mono value={s.alerts.discordWebhook} placeholder="https://discord.com/api/webhooks/…" onChange={(discordWebhook) => setS((p) => ({ ...p, alerts: { ...p.alerts, discordWebhook } }))} />
              </Row>
            </section>
          )}

          {tab === "punish" && (
            <section className="card divide-y divide-line overflow-hidden">
              <Row title="Czas bana" desc="Dla checków ustawionych na Ban.">
                <Segmented
                  id="ban-dur"
                  value={s.punish.banDuration}
                  options={(Object.keys(BAN_LABEL) as BanDuration[]).map((d) => ({ value: d, label: BAN_LABEL[d] }))}
                  onChange={(banDuration) => setS((p) => ({ ...p, punish: { ...p.punish, banDuration } }))}
                />
              </Row>
              <Row title="Wiadomość przy kicku" desc="{check} zamieni się na nazwę checka.">
                <TextField wide value={s.punish.kickMessage} onChange={(kickMessage) => setS((p) => ({ ...p, punish: { ...p.punish, kickMessage } }))} />
              </Row>
              <Row title="Wiadomość przy banie" desc="{check} zamieni się na nazwę checka.">
                <TextField wide value={s.punish.banMessage} onChange={(banMessage) => setS((p) => ({ ...p, punish: { ...p.punish, banMessage } }))} />
              </Row>
              <Row title="Ogłaszaj bany na czacie" desc="Wszyscy gracze zobaczą, że cheater został usunięty.">
                <Toggle on={s.punish.broadcast} onChange={(broadcast) => setS((p) => ({ ...p, punish: { ...p.punish, broadcast } }))} label="Ogłaszaj bany" />
              </Row>
              <Row title="Uprawnienie omijające" desc="Gracze z tym uprawnieniem nie są sprawdzani.">
                <TextField mono value={s.bypassPermission} onChange={(bypassPermission) => setS((p) => ({ ...p, bypassPermission }))} />
              </Row>
            </section>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {(dirty || msg) && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-[620px] items-center gap-3 rounded-2xl bg-[#111214]/95 p-2 pl-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.12),0_30px_80px_-20px_rgba(0,0,0,0.95)] backdrop-blur-xl lg:left-[248px]"
          >
            <span className={`min-w-0 flex-1 truncate text-[13.5px] ${dirty ? "text-fg" : msg?.ok ? "text-ok" : "text-danger"}`}>
              {dirty ? "Masz niezapisane zmiany" : msg?.message}
            </span>
            {dirty ? (
              <>
                <button onClick={() => setS(saved)} className="h-9 shrink-0 rounded-full px-4 text-[13.5px] text-muted transition-colors hover:text-fg">
                  Cofnij
                </button>
                <button
                  onClick={save}
                  disabled={busy}
                  className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-fg px-4 text-[13.5px] font-medium text-bg transition-colors hover:bg-[#e4e5e7] disabled:opacity-60"
                >
                  {busy && <span className="size-3 animate-spin rounded-full border-[1.5px] border-bg/25 border-t-bg" />}
                  Zapisz zmiany
                </button>
              </>
            ) : (
              <button onClick={() => setMsg(null)} className="h-9 shrink-0 rounded-full px-4 text-[13.5px] text-muted transition-colors hover:text-fg">
                OK
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
