"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { CHECK_CATEGORIES } from "@/lib/checks";
import { EASE } from "../../ui";
import { PageHeader, Pill, Toggle } from "../ui";

type Cfg = { on: boolean; sens: number; ban: number };

export function ClientChecks() {
  const [tab, setTab] = useState(CHECK_CATEGORIES[0].id);
  const [cfg, setCfg] = useState<Record<string, Cfg>>(() =>
    Object.fromEntries(
      CHECK_CATEGORIES.flatMap((c) => c.checks).map((ch) => [ch.name, { on: ch.status === "stabilny", sens: 2, ban: 15 }]),
    ),
  );
  const [saved, setSaved] = useState(false);
  const cat = CHECK_CATEGORIES.find((c) => c.id === tab)!;
  const set = (name: string, patch: Partial<Cfg>) => {
    setCfg((c) => ({ ...c, [name]: { ...c[name], ...patch } }));
    setSaved(false);
  };

  return (
    <>
      <PageHeader
        title="Checki"
        desc="Włączaj, wyłączaj i stroisz detekcje. Zmiany trafiają na serwery bez restartu."
        actions={
          <button
            onClick={() => setSaved(true)}
            className="inline-flex h-8 items-center rounded-full bg-fg px-3.5 text-[13px] font-medium text-bg transition-colors hover:bg-[#e4e5e7]"
          >
            {saved ? "Zapisano ✓" : "Zapisz zmiany"}
          </button>
        }
      />

      <div className="mb-4 flex w-fit rounded-full bg-white/[0.03] p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
        {CHECK_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setTab(c.id)}
            className={`relative h-8 rounded-full px-4 text-[13.5px] transition-colors ${tab === c.id ? "text-bg" : "text-muted hover:text-fg"}`}
          >
            {tab === c.id && (
              <motion.span layoutId="cfg-tab" className="absolute inset-0 rounded-full bg-fg" transition={{ type: "spring", stiffness: 450, damping: 35 }} />
            )}
            <span className="relative">{c.label}</span>
          </button>
        ))}
      </div>

      <div className="card divide-y divide-line/70">
        {cat.checks.map((ch, i) => {
          const c = cfg[ch.name];
          return (
            <motion.div
              key={`${tab}-${ch.name}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: i * 0.03 }}
              className={`grid gap-4 p-5 transition-opacity md:grid-cols-[1.3fr_1fr_1fr_auto] md:items-center ${c.on ? "" : "opacity-55"}`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-medium">{ch.name}</span>
                  {ch.status === "beta" && <Pill tone="warn">beta</Pill>}
                </div>
                <p className="mt-1 text-[13.5px] text-muted">{ch.desc}</p>
              </div>
              <label className="block">
                <span className="flex justify-between text-[12.5px] text-dim">
                  Czułość <span className="text-muted">{["niska", "średnia", "wysoka"][c.sens - 1]}</span>
                </span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  value={c.sens}
                  disabled={!c.on}
                  onChange={(e) => set(ch.name, { sens: Number(e.target.value) })}
                  className="mt-2 w-full accent-white"
                />
              </label>
              <label className="block">
                <span className="flex justify-between text-[12.5px] text-dim">
                  Ban od VL <span className="font-mono text-muted">{c.ban}</span>
                </span>
                <input
                  type="range"
                  min={5}
                  max={40}
                  value={c.ban}
                  disabled={!c.on}
                  onChange={(e) => set(ch.name, { ban: Number(e.target.value) })}
                  className="mt-2 w-full accent-white"
                />
              </label>
              <Toggle on={c.on} onChange={(v) => set(ch.name, { on: v })} label={`Włącz ${ch.name}`} />
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
