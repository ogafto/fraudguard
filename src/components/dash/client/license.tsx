"use client";

import { motion } from "motion/react";
import type { AccountLicense, Release } from "@/lib/server/account";
import { IconBox, IconDownload, IconKey } from "../../icons";
import { EASE } from "../../ui";
import { Block, PageHeader, Pill } from "../ui";
import { CopyKey, daysLeft, DiscordButton, EmptyState, formatDate, Locked } from "./common";

export function ClientLicense({ email, licenses, releases }: { email: string; licenses: AccountLicense[]; releases: Release[] }) {
  const active = licenses.filter((l) => l.active);
  const latest = releases[0] ?? null;

  if (active.length === 0) {
    return (
      <>
        <PageHeader title="Pakiet i pobieranie" desc="Twój klucz licencji i plik pluginu." />
        <Locked email={email}>Nie masz jeszcze aktywnego pakietu</Locked>
        {licenses.length > 0 && <History licenses={licenses} />}
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Pakiet i pobieranie"
        desc="Klucz licencji wpisujesz w config.yml pluginu."
        actions={
          latest ? (
            <a href={latest.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-2 rounded-full bg-fg px-4 text-[13.5px] font-medium text-bg transition-colors hover:bg-[#e4e5e7]">
              <IconDownload className="size-4" />
              Pobierz {latest.version}
            </a>
          ) : undefined
        }
      />

      <div className="grid gap-4">
        {active.map((l, i) => {
          const left = daysLeft(l.expiresAt);
          return (
            <motion.section
              key={l.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE, delay: i * 0.06 }}
              className="card p-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-white/[0.05] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                  <IconKey className="size-[18px]" />
                </span>
                <div>
                  <div className="text-[16px] font-medium">Pakiet {l.planName}</div>
                  <div className="text-[13px] text-dim">
                    {l.billing === "lifetime" ? "Dożywotnio" : `Ważny do ${formatDate(l.expiresAt)}${left !== null ? `, zostało ${left} dni` : ""}`}
                  </div>
                </div>
                <span className="ml-auto">
                  <Pill tone={left !== null && left <= 5 ? "warn" : "ok"}>{left !== null && left <= 5 ? "kończy się" : "aktywny"}</Pill>
                </span>
              </div>
              <CopyKey value={l.key} className="mt-5" />
              {l.billing === "monthly" && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-dim">
                  Przedłużenie opłacasz na Discordzie, a dni dopiszą się do tego samego klucza.
                  <DiscordButton>Przedłuż pakiet</DiscordButton>
                </div>
              )}
            </motion.section>
          );
        })}

        <Block title="Wersje pluginu" pad={false} delay={0.1}>
          {releases.length === 0 ? (
            <EmptyState Icon={IconBox} title="Pierwsza wersja pojawi się tutaj">
              Dostaniesz ją od razu po publikacji. Informację znajdziesz też na naszym Discordzie.
            </EmptyState>
          ) : (
            <ul className="divide-y divide-line">
              {releases.map((r, i) => (
                <li key={r.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[14.5px]">v{r.version}</span>
                      {i === 0 && <Pill tone="ok">najnowsza</Pill>}
                      <span className="text-[12.5px] text-dim">{formatDate(r.createdAt)}</span>
                    </div>
                    {r.notes && (
                      <ul className="mt-2 space-y-1 text-[13px] text-muted">
                        {r.notes
                          .split("\n")
                          .filter((x) => x.trim())
                          .map((x, k) => (
                            <li key={k} className="flex gap-2">
                              <span className="mt-[0.6em] size-1 shrink-0 rounded-full bg-white/30" />
                              {x.trim()}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 shrink-0 items-center gap-1.5 self-start rounded-full bg-white/[0.05] px-3.5 text-[12.5px] shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-colors hover:bg-white/[0.09]">
                    <IconDownload className="size-3.5" />
                    Pobierz
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Block>
        {licenses.length > active.length && <History licenses={licenses.filter((l) => !l.active)} />}
      </div>
    </>
  );
}

function History({ licenses }: { licenses: AccountLicense[] }) {
  return (
    <Block title="Wcześniejsze pakiety" pad={false} className="mt-4" delay={0.15}>
      <ul className="divide-y divide-line">
        {licenses.map((l) => (
          <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-3.5 text-[13.5px]">
            <span>Pakiet {l.planName}</span>
            <span className="text-dim">{l.status === "suspended" ? "wstrzymany" : `wygasł ${formatDate(l.expiresAt)}`}</span>
          </li>
        ))}
      </ul>
    </Block>
  );
}
