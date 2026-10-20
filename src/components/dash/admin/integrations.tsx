"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import {
  clearIntegrationAction,
  saveDiscordLinkAction,
  saveIntegrationAction,
  sendTestMailAction,
  testIntegrationAction,
  type ActionResult,
  type IntegrationState,
} from "@/lib/integration-actions";
import type { IntegrationName } from "@/lib/server/integrations";
import { IconDiscord } from "../../icons";
import { EASE } from "../../ui";
import { PageHeader } from "../ui";

type FieldDef = { name: string; label: string; placeholder: string; hint?: string };

const DEFS: Record<IntegrationName, { title: string; desc: string; icon: ReactNode; docs: string; fields: FieldDef[] }> = {
  resend: {
    title: "Resend",
    desc: "Wysyłka maili: kody weryfikacyjne, linki do zmiany hasła.",
    icon: (
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" aria-hidden>
        <rect x="3" y="5.5" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="m3.8 7 8.2 6 8.2-6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    docs: "https://resend.com/api-keys",
    fields: [
      { name: "apiKey", label: "Klucz API", placeholder: "re_…" },
      { name: "from", label: "Nadawca", placeholder: "FraudGuard <no-reply@twojadomena.pl>", hint: "Domena nadawcy musi być zweryfikowana w Resend." },
    ],
  },
  discord: {
    title: "Discord",
    desc: "Powiadomienia o nowych kontach i zakupach na kanale administracji.",
    icon: <IconDiscord className="size-[18px]" />,
    docs: "https://support.discord.com/hc/pl/articles/228383668",
    fields: [{ name: "webhookUrl", label: "Adres webhooka", placeholder: "https://discord.com/api/webhooks/…" }],
  },
};

const ORDER: IntegrationName[] = ["resend", "discord"];

function Status({ fields }: { fields: IntegrationState[IntegrationName] }) {
  const main = Object.values(fields)[0];
  const on = main.source !== "none";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[12px] ${on ? "bg-ok/10 text-ok" : "text-dim shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"}`}
    >
      <span className={`size-1.5 rounded-full ${on ? "animate-pulse-dot bg-ok text-ok/50" : "bg-dim"}`} />
      {on ? (main.source === "saved" ? "Podłączono w panelu" : "Podłączono z pliku .env") : "Nie podłączono"}
    </span>
  );
}

function Result({ result }: { result: ActionResult | null }) {
  return (
    <AnimatePresence initial={false}>
      {result && (
        <motion.div
          key={result.message}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="overflow-hidden"
        >
          <div className={`mt-4 rounded-xl px-3.5 py-3 text-[13.5px] ${result.ok ? "bg-ok/[0.07] text-ok" : "bg-danger/[0.08] text-danger"}`}>
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 16 16" className="size-4 shrink-0" fill="none" aria-hidden>
                <motion.path
                  d={result.ok ? "m4 8.5 2.5 2.5L12 5.5" : "M5 5l6 6M11 5l-6 6"}
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4 }}
                />
              </svg>
              {result.message}
            </div>
            {result.details && result.details.length > 0 && (
              <ul className="mt-2 space-y-0.5 pl-6 text-[12.5px] text-muted">
                {result.details.map((d) => (
                  <li key={d} className="break-all">
                    {d}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Button({ children, onClick, busy, primary, type = "button", disabled }: { children: string; onClick?: () => void; busy?: boolean; primary?: boolean; type?: "button" | "submit"; disabled?: boolean }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={busy || disabled}
      className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-[13.5px] font-medium transition-[background-color,opacity] disabled:opacity-50 ${primary ? "bg-fg text-bg hover:bg-[#e4e5e7]" : "bg-white/[0.05] text-fg shadow-[0_0_0_1px_rgba(255,255,255,0.08)] hover:bg-white/[0.09]"}`}
    >
      {busy && <span className={`size-3 animate-spin rounded-full border-[1.5px] ${primary ? "border-bg/25 border-t-bg" : "border-white/20 border-t-fg"}`} />}
      {children}
    </button>
  );
}

function IntegrationCard({ name, fields, email, index }: { name: IntegrationName; fields: IntegrationState[IntegrationName]; email: string; index: number }) {
  const def = DEFS[name];
  const router = useRouter();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const connected = Object.values(fields)[0].source !== "none";

  const run = async (label: string, fn: () => Promise<ActionResult>) => {
    setBusy(label);
    setResult(null);
    try {
      setResult(await fn());
    } catch {
      setResult({ ok: false, message: "Coś poszło nie tak. Odśwież stronę i spróbuj ponownie." });
    }
    setBusy(null);
    startTransition(() => router.refresh());
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE, delay: 0.05 + index * 0.07 }}
      className="card p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(255,255,255,0.08)]">
            {def.icon}
          </span>
          <div>
            <h2 className="text-[16px] font-medium">{def.title}</h2>
            <p className="text-[13px] text-muted">{def.desc}</p>
          </div>
        </div>
        <Status fields={fields} />
      </div>

      <form
        className="mt-5 grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          run("save", () => saveIntegrationAction(name, form)).then(() => e.currentTarget?.reset());
        }}
      >
        {def.fields.map((f) => {
          const state = fields[f.name];
          const secret = state?.secret;
          return (
            <label key={f.name} className={def.fields.length === 1 ? "sm:col-span-2" : ""}>
              <span className="mb-1.5 flex items-center justify-between text-[12.5px] font-medium text-muted">
                {f.label}
                {state?.source === "env" && <span className="font-normal text-dim">z pliku .env</span>}
              </span>
              <input
                name={f.name}
                type={secret ? "password" : "text"}
                autoComplete="off"
                spellCheck={false}
                defaultValue={secret ? "" : state?.value}
                placeholder={secret && state?.value ? `${state.value}  (zostaw puste, żeby nie zmieniać)` : f.placeholder}
                className="h-10 w-full rounded-lg bg-white/[0.03] px-3 font-mono text-[13px] text-fg outline-none shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-shadow placeholder:font-sans placeholder:text-dim focus:shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_0_0_4px_rgba(255,255,255,0.05)]"
              />
              {f.hint && <span className="mt-1.5 block text-[12px] text-dim">{f.hint}</span>}
            </label>
          );
        })}

        <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
          <Button type="submit" primary busy={busy === "save"}>
            Zapisz
          </Button>
          <Button onClick={() => run("test", () => testIntegrationAction(name))} busy={busy === "test"} disabled={!connected}>
            Testuj połączenie
          </Button>
          {name === "resend" && (
            <Button onClick={() => run("mail", sendTestMailAction)} busy={busy === "mail"} disabled={!connected}>
              {`Wyślij test na ${email}`}
            </Button>
          )}
          {Object.values(fields).some((f) => f.source === "saved") && (
            <button
              type="button"
              onClick={() => run("clear", () => clearIntegrationAction(name))}
              className="ml-auto text-[13px] text-dim transition-colors hover:text-danger"
            >
              Odłącz
            </button>
          )}
          <a href={def.docs} target="_blank" rel="noopener noreferrer" className={`text-[13px] text-dim transition-colors hover:text-fg ${Object.values(fields).some((f) => f.source === "saved") ? "" : "ml-auto"}`}>
            Skąd wziąć klucz?
          </a>
        </div>
      </form>

      <Result result={result} />
    </motion.section>
  );
}

/** The one Discord invite used across the site: footer, CTA, documents and every pricing button. */
function DiscordLinkCard({ discordUrl }: { discordUrl: string }) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [value, setValue] = useState(discordUrl);
  const changed = value.trim() !== discordUrl;

  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE }} className="card relative overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_100%_0%,rgba(88,101,242,0.12),transparent_60%)]" />
      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#5865f2] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
            <IconDiscord className="size-[18px]" />
          </span>
          <div>
            <h2 className="text-[16px] font-medium">Serwer Discord</h2>
            <p className="text-[13px] text-muted">Jeden link dla całej strony: cennik, stopka, CTA i dokumenty.</p>
          </div>
        </div>
        <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="text-[13px] text-muted transition-colors hover:text-fg">
          Otwórz obecny link ↗
        </a>
      </div>
      <form
        className="relative mt-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setResult(null);
          try {
            setResult(await saveDiscordLinkAction(new FormData(e.currentTarget)));
          } catch {
            setResult({ ok: false, message: "Nie udało się zapisać. Odśwież stronę i spróbuj ponownie." });
          }
          setBusy(false);
          router.refresh();
        }}
      >
        <input
          name="discordUrl"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          spellCheck={false}
          placeholder="https://discord.gg/…"
          className="h-10 flex-1 rounded-lg bg-white/[0.03] px-3 font-mono text-[13px] text-fg outline-none shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-shadow placeholder:text-dim focus:shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_0_0_4px_rgba(255,255,255,0.05)]"
        />
        <Button type="submit" primary busy={busy} disabled={!changed}>
          Zapisz link
        </Button>
      </form>
      <Result result={result} />
    </motion.section>
  );
}

export function AdminIntegrations({ state, secretReady, email, discordUrl }: { state: IntegrationState; secretReady: boolean; email: string; discordUrl: string }) {
  return (
    <>
      <PageHeader title="Integracje" desc="Link do Discorda i usługi, z których korzysta strona. Klucze są zapisywane w bazie w formie zaszyfrowanej." />
      {!secretReady && (
        <div className="mb-5 rounded-xl bg-warn/[0.08] px-4 py-3 text-[13.5px] text-warn">
          Na serwerze brakuje zmiennej APP_SECRET. Bez niej kluczy nie da się bezpiecznie zapisać w panelu.
        </div>
      )}
      <div className="grid gap-4">
        <DiscordLinkCard discordUrl={discordUrl} />
        {ORDER.map((n, i) => (
          <IntegrationCard key={n} name={n} fields={state[n]} email={email} index={i + 1} />
        ))}
      </div>
    </>
  );
}
