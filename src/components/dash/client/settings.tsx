"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, useTransition, type ReactNode } from "react";
import { changePasswordAction, logoutEverywhereAction, updateNickAction, type AccountResult } from "@/lib/account-actions";
import { McHead } from "../../mc-head";
import { EASE } from "../../ui";
import { Input, PageHeader } from "../ui";

function Card({ title, desc, children, delay = 0 }: { title: string; desc: string; children: ReactNode; delay?: number }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE, delay }} className="card p-6">
      <h2 className="text-[15.5px] font-medium">{title}</h2>
      <p className="mt-1 text-[13.5px] text-muted">{desc}</p>
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}

function Result({ res }: { res: AccountResult | null }) {
  return (
    <AnimatePresence initial={false}>
      {res && (
        <motion.p
          key={res.message}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className={`overflow-hidden text-[13px] ${res.ok ? "text-ok" : "text-danger"}`}
        >
          <span className="block pt-3">{res.message}</span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function Save({ busy, disabled, children }: { busy: boolean; disabled?: boolean; children: string }) {
  return (
    <button
      type="submit"
      disabled={busy || disabled}
      className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-fg px-4 text-[13.5px] font-medium text-bg transition-[background-color,opacity] hover:bg-[#e4e5e7] disabled:opacity-40"
    >
      {busy && <span className="size-3 animate-spin rounded-full border-[1.5px] border-bg/25 border-t-bg" />}
      {children}
    </button>
  );
}

export function ClientSettings({ nick, email }: { nick: string; email: string }) {
  const [name, setName] = useState(nick);
  const [nickRes, setNickRes] = useState<AccountResult | null>(null);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [passRes, setPassRes] = useState<AccountResult | null>(null);
  const [busy, start] = useTransition();
  const preview = /^[A-Za-z0-9_]{3,16}$/.test(name) ? name : nick;

  return (
    <>
      <PageHeader title="Ustawienia konta" desc={email} />
      <div className="grid max-w-[720px] gap-4">
        <Card title="Nick w Minecraft" desc="Od niego zależy główka przy Twoim koncie.">
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => setNickRes(await updateNickAction(name)));
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={preview} initial={{ scale: 0.6, opacity: 0, rotate: -15 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}>
                <McHead name={preview} className="size-10 rounded-lg" />
              </motion.span>
            </AnimatePresence>
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={16} className="h-10 flex-1" />
            <Save busy={busy} disabled={name.trim() === nick}>
              Zapisz
            </Save>
          </form>
          <Result res={nickRes} />
        </Card>

        <Card title="Hasło" desc="Po zmianie hasła wylogujemy Cię na innych urządzeniach." delay={0.06}>
          <form
            className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const res = await changePasswordAction(current, next);
                setPassRes(res);
                if (res.ok) {
                  setCurrent("");
                  setNext("");
                }
              });
            }}
          >
            <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Obecne hasło" autoComplete="current-password" className="h-10" />
            <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Nowe hasło, min. 8 znaków" autoComplete="new-password" className="h-10" />
            <Save busy={busy} disabled={!current || next.length < 8}>
              Zmień hasło
            </Save>
          </form>
          <Result res={passRes} />
        </Card>

        <Card title="Sesje" desc="Wyloguj się ze wszystkich urządzeń, na których jesteś zalogowany." delay={0.12}>
          <form action={logoutEverywhereAction}>
            <button className="h-9 rounded-full bg-danger/[0.08] px-4 text-[13.5px] font-medium text-danger shadow-[0_0_0_1px_rgba(239,90,90,0.25)] transition-colors hover:bg-danger/[0.14]">
              Wyloguj wszędzie
            </button>
          </form>
        </Card>
      </div>
    </>
  );
}
