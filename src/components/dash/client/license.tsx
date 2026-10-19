"use client";

import { useState } from "react";
import { LICENSE, RELEASES } from "@/lib/mock";
import { IconCopy, IconDownload } from "../../icons";
import { Block, PageHeader, Pill, StatusDot } from "../ui";

export function ClientLicense() {
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState(false);
  const key = reveal ? LICENSE.key : LICENSE.key.replace(/(?<=FG-).+/, "••••-••••-••••-••••");

  return (
    <>
      <PageHeader title="Licencja i pobieranie" desc="Klucz licencyjny, pliki pluginu i historia zmian." />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Block title="Klucz licencyjny">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[20px] font-medium">Plan {LICENSE.plan}</div>
              <div className="mt-1 text-[13.5px] text-muted">Odnowienie {LICENSE.renews}</div>
            </div>
            <StatusDot>aktywna</StatusDot>
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-lg bg-white/[0.03] p-1 pl-3 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <code className="flex-1 truncate font-mono text-[14px] tracking-wide">{key}</code>
            <button onClick={() => setReveal((r) => !r)} className="h-8 rounded-md px-3 text-[12.5px] text-muted transition-colors hover:text-fg">
              {reveal ? "Ukryj" : "Pokaż"}
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(LICENSE.key).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-white/[0.06] px-3 text-[12.5px] transition-colors hover:bg-white/[0.1]"
            >
              <IconCopy className="size-3.5" />
              {copied ? "Skopiowano" : "Kopiuj"}
            </button>
          </div>
          <p className="mt-3 text-[13px] text-dim">Nie udostępniaj klucza. Możesz go w każdej chwili wygenerować ponownie.</p>
          <button className="mt-4 text-[13px] text-muted underline-offset-4 transition-colors hover:text-fg hover:underline">
            Wygeneruj nowy klucz
          </button>
        </Block>

        <Block title="Instalacja">
          <ol className="space-y-4 text-[14px]">
            {[
              "Pobierz plik FraudGuard-2.0.0.jar poniżej.",
              "Wrzuć go do folderu /plugins na serwerze.",
              "Wpisz klucz w plugins/FraudGuard/config.yml.",
              "Zrestartuj serwer i gotowe.",
            ].map((t, i) => (
              <li key={t} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[12px] font-medium">{i + 1}</span>
                <span className="pt-0.5 text-muted">{t}</span>
              </li>
            ))}
          </ol>
        </Block>
      </div>

      <Block title="Wersje" pad={false} className="mt-4" delay={0.1}>
        <ul className="divide-y divide-line/70">
          {RELEASES.map((r) => (
            <li key={r.version} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
              <div className="w-44 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[15px]">{r.version}</span>
                  <Pill tone={r.channel === "beta" ? "warn" : "default"}>{r.channel}</Pill>
                </div>
                <div className="mt-1 text-[12.5px] text-dim">
                  {r.date} · {r.size}
                </div>
              </div>
              <ul className="flex-1 space-y-1 text-[13.5px] text-muted">
                {r.notes.map((n) => (
                  <li key={n} className="flex gap-2"><span className="mt-[9px] size-1 shrink-0 rounded-full bg-white/40" />{n}</li>
                ))}
              </ul>
              <button className="inline-flex h-9 items-center gap-2 self-start rounded-full bg-white/[0.06] px-4 text-[13px] font-medium ring-1 ring-inset ring-white/[0.1] transition-colors hover:bg-white/[0.1]">
                <IconDownload className="size-3.5" />
                Pobierz .jar
              </button>
            </li>
          ))}
        </ul>
      </Block>
    </>
  );
}
