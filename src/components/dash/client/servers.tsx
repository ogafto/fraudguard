"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { LICENSE, SERVERS } from "@/lib/mock";
import { IconCopy, IconPlus } from "../../icons";
import { EASE } from "../../ui";
import { Input, PageHeader, Pill, StatusDot } from "../ui";

export function ClientServers() {
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <>
      <PageHeader
        title="Serwery"
        desc={`Serwery podpięte do licencji ${LICENSE.plan} · ${LICENSE.servers} z ${LICENSE.maxServers} miejsc`}
        actions={
          <button
            onClick={() => setAdding(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-fg px-3.5 text-[13px] font-medium text-bg transition-colors hover:bg-[#e4e5e7]"
          >
            <IconPlus className="size-3.5" />
            Dodaj serwer
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {SERVERS.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: i * 0.05 }}
            className="card p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-[16px] font-medium">{s.name}</h3>
                  {s.plugin !== "2.0.0" && <Pill tone="warn">aktualizacja dostępna</Pill>}
                </div>
                <div className="mt-1 font-mono text-[12.5px] text-dim">{s.ip}</div>
              </div>
              <StatusDot tone={s.online ? "ok" : "dim"}>{s.online ? "online" : "offline"}</StatusDot>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                ["Gracze", s.online ? `${s.players.toLocaleString("pl-PL")}/${s.max.toLocaleString("pl-PL")}` : "brak"],
                ["TPS", s.online ? s.tps.toFixed(1) : "brak"],
                ["Tick", s.online ? `${s.tick.toFixed(2)} ms` : "brak"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-white/[0.025] px-3 py-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
                  <div className="text-[12px] text-dim">{k}</div>
                  <div className="mt-0.5 text-[15px] font-medium">{v}</div>
                </div>
              ))}
            </div>

            {s.online && (
              <div className="mt-4">
                <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-full bg-white/60"
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.players / s.max) * 100}%` }}
                    transition={{ duration: 1, ease: EASE, delay: 0.2 + i * 0.05 }}
                  />
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-[13px] text-muted">
              <span>
                {s.version} · FraudGuard {s.plugin}
              </span>
              <button className="text-muted transition-colors hover:text-fg">Ustawienia</button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAdding(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.35, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="card w-full max-w-[460px] bg-panel p-6"
            >
              <h3 className="text-[18px] font-medium">Dodaj serwer</h3>
              <p className="mt-1.5 text-[14px] text-muted">
                Wklej token do <span className="font-mono text-fg">plugins/FraudGuard/config.yml</span> i zrestartuj serwer. Pojawi się tu automatycznie.
              </p>
              <div className="mt-5 flex items-center gap-2 rounded-lg bg-white/[0.03] p-1 pl-3 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                <code className="flex-1 truncate font-mono text-[13px]">server-token: fgs_8XkQ2mP91dLz</code>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText("fgs_8XkQ2mP91dLz").catch(() => {});
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md bg-white/[0.06] px-3 text-[12.5px] transition-colors hover:bg-white/[0.1]"
                >
                  <IconCopy className="size-3.5" />
                  {copied ? "Skopiowano" : "Kopiuj"}
                </button>
              </div>
              <label className="mt-5 block">
                <span className="mb-1.5 block text-[13px] text-muted">Nazwa serwera (opcjonalnie)</span>
                <Input placeholder="np. Survival EU" className="w-full" />
              </label>
              {LICENSE.servers >= LICENSE.maxServers && (
                <p className="mt-4 rounded-lg bg-warn/10 px-3 py-2 text-[13px] text-warn">
                  Wykorzystujesz wszystkie miejsca w planie {LICENSE.plan}. Odepnij serwer lub przejdź na plan Network.
                </p>
              )}
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setAdding(false)} className="h-9 rounded-full px-4 text-[13.5px] text-muted hover:text-fg">
                  Anuluj
                </button>
                <button onClick={() => setAdding(false)} className="h-9 rounded-full bg-fg px-4 text-[13.5px] font-medium text-bg hover:bg-[#e4e5e7]">
                  Gotowe
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
