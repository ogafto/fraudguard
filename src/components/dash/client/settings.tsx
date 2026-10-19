"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { IconDiscord } from "../../icons";
import { Block, Input, PageHeader, Toggle } from "../ui";

export function ClientSettings() {
  const [hook, setHook] = useState("https://discord.com/api/webhooks/1290…/fg-alerts");
  const [sent, setSent] = useState(false);
  const [prefs, setPrefs] = useState({ bans: true, kicks: true, flags: false, updates: true, weekly: true });

  return (
    <>
      <PageHeader title="Ustawienia" desc="Integracje, powiadomienia i konto." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Block title="Discord">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#5865f2]">
              <IconDiscord className="size-4 text-white" />
            </span>
            <div>
              <div className="text-[14px] font-medium">Webhook alertów</div>
              <div className="text-[12.5px] text-dim">Alerty trafią na wybrany kanał Twojego Discorda.</div>
            </div>
          </div>
          <label className="mt-5 block">
            <span className="mb-1.5 block text-[13px] text-muted">URL webhooka</span>
            <Input value={hook} onChange={(e) => setHook(e.target.value)} className="w-full font-mono text-[12.5px]" />
          </label>
          <div className="mt-5 space-y-3">
            {(
              [
                ["bans", "Bany"],
                ["kicks", "Kicki"],
                ["flags", "Każda flaga (dużo wiadomości)"],
              ] as const
            ).map(([k, label]) => (
              <div key={k} className="flex items-center justify-between text-[14px]">
                <span className="text-muted">{label}</span>
                <Toggle on={prefs[k]} onChange={(v) => setPrefs((p) => ({ ...p, [k]: v }))} label={label} />
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => {
                setSent(true);
                setTimeout(() => setSent(false), 2000);
              }}
              className="h-9 rounded-full bg-fg px-4 text-[13px] font-medium text-bg transition-colors hover:bg-[#e4e5e7]"
            >
              Wyślij test
            </button>
            <AnimatePresence>
              {sent && (
                <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-[13px] text-ok">
                  Wiadomość testowa wysłana
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </Block>

        <Block title="Powiadomienia e-mail" delay={0.05}>
          <div className="space-y-4">
            {(
              [
                ["updates", "Nowe wersje pluginu", "Informacja o każdej wersji stabilnej."],
                ["weekly", "Tygodniowy raport", "Podsumowanie wykryć i banów co poniedziałek."],
              ] as const
            ).map(([k, label, desc]) => (
              <div key={k} className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[14px]">{label}</div>
                  <div className="text-[12.5px] text-dim">{desc}</div>
                </div>
                <Toggle on={prefs[k]} onChange={(v) => setPrefs((p) => ({ ...p, [k]: v }))} label={label} />
              </div>
            ))}
          </div>
        </Block>

        <Block title="Konto" delay={0.1}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[13px] text-muted">Nazwa</span>
              <Input defaultValue="Survival.pl" className="w-full" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] text-muted">E-mail</span>
              <Input defaultValue="admin@survival.pl" type="email" className="w-full" />
            </label>
          </div>
          <div className="mt-5 flex gap-2">
            <button className="h-9 rounded-full bg-fg px-4 text-[13px] font-medium text-bg transition-colors hover:bg-[#e4e5e7]">Zapisz</button>
            <button className="h-9 rounded-full px-4 text-[13px] text-muted ring-1 ring-inset ring-white/[0.1] transition-colors hover:text-fg">
              Zmień hasło
            </button>
          </div>
        </Block>

        <Block title="Strefa zagrożenia" delay={0.15}>
          <p className="text-[14px] text-muted">Usunięcie konta odpina wszystkie serwery i anuluje subskrypcję. Tej operacji nie da się cofnąć.</p>
          <button className="mt-5 h-9 rounded-full bg-danger/10 px-4 text-[13px] font-medium text-danger transition-colors hover:bg-danger/20">
            Usuń konto
          </button>
        </Block>
      </div>
    </>
  );
}
