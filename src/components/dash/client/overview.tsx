"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { AccountLicense, Release } from "@/lib/server/account";
import { IconDownload, IconServer, IconSliders } from "../../icons";
import { McHead } from "../../mc-head";
import { EASE } from "../../ui";
import { PageHeader, Pill } from "../ui";
import { CopyKey, daysLeft, formatDate, Locked } from "./common";

function Shortcut({ href, Icon, title, value, delay }: { href: string; Icon: typeof IconSliders; title: string; value: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay }}>
      <Link
        href={href}
        className="card group flex items-center gap-4 p-5 transition-shadow duration-500 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_0_0_1px_rgba(255,255,255,0.16)]"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-white/[0.05] shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-transform duration-500 ease-out-expo group-hover:-rotate-6 group-hover:scale-110">
          <Icon className="size-[18px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] text-muted">{title}</span>
          <span className="block text-[15px] font-medium leading-snug">{value}</span>
        </span>
        <span className="text-dim transition-transform duration-500 ease-out-expo group-hover:translate-x-1">→</span>
      </Link>
    </motion.div>
  );
}

export function ClientOverview({
  nick,
  email,
  license,
  release,
  enabledChecks,
  totalChecks,
}: {
  nick: string;
  email: string;
  license: AccountLicense | null;
  release: Release | null;
  enabledChecks: number;
  totalChecks: number;
}) {
  if (!license) {
    return (
      <>
        <PageHeader title={`Cześć, ${nick}`} desc="Twoje konto jest gotowe. Brakuje tylko pakietu." />
        <Locked email={email}>Zacznij od wybrania pakietu</Locked>
      </>
    );
  }

  const left = daysLeft(license.expiresAt);
  const progress = left === null ? 1 : Math.min(1, left / 30);
  const steps = [
    { t: "Pobierz plugin", d: release ? `Najnowsza wersja to ${release.version}.` : "Plik pojawi się tutaj, gdy opublikujemy pierwszą wersję." },
    { t: "Wrzuć plik do folderu plugins", d: "Na każdym serwerze, który ma być chroniony." },
    { t: "Wpisz klucz w config.yml", d: "W pliku plugins/FraudGuard/config.yml, w polu license." },
    { t: "Zrestartuj serwer", d: "Serwer pojawi się w zakładce Serwery, a ustawienia z panelu wczytają się same." },
  ];

  return (
    <>
      <PageHeader title={`Cześć, ${nick}`} desc={`Pakiet ${license.planName} ${license.billing === "lifetime" ? "dożywotnio" : `do ${formatDate(license.expiresAt)}`}.`} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="card relative overflow-hidden p-6 sm:p-7"
        >
          <div className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.08),transparent)]" />
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px overflow-hidden">
            <div className="h-px w-1/3 animate-beam bg-gradient-to-r from-transparent via-white to-transparent" />
          </div>
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <McHead name={nick} className="size-14 rounded-xl" />
              <div>
                <div className="text-[13px] text-muted">Twój pakiet</div>
                <div className="text-[28px] font-medium leading-tight tracking-[-0.03em]">{license.planName}</div>
              </div>
            </div>
            <Pill tone="ok">aktywny</Pill>
          </div>

          <div className="relative mt-7">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted">{license.billing === "lifetime" ? "Bez daty wygaśnięcia" : "Pozostało"}</span>
              <span className="tabular-nums">{left === null ? "dożywotnio" : `${left} ${left === 1 ? "dzień" : "dni"}`}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className={`h-full origin-left rounded-full ${left !== null && left <= 5 ? "bg-warn" : "bg-fg"}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: progress }}
                transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
              />
            </div>
          </div>

          <div className="relative mt-7 text-[13px] text-muted">Klucz licencji</div>
          <CopyKey value={license.key} className="relative mt-2" />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
          className="card p-6 sm:p-7"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-medium">Uruchomienie w 4 krokach</h2>
            {release && (
              <a href={release.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-fg px-3.5 py-1.5 text-[12.5px] font-medium text-bg transition-colors hover:bg-[#e4e5e7]">
                <IconDownload className="size-3.5" />
                Pobierz
              </a>
            )}
          </div>
          <ol className="mt-5 space-y-4">
            {steps.map((s, i) => (
              <motion.li
                key={s.t}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, ease: EASE, delay: 0.15 + i * 0.07 }}
                className="flex gap-3.5"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-[11.5px] shadow-[0_0_0_1px_rgba(255,255,255,0.18)]">{i + 1}</span>
                <span>
                  <span className="block text-[14px]">{s.t}</span>
                  <span className="block text-[13px] leading-relaxed text-dim">{s.d}</span>
                  {i === 2 && (
                    <code className="mt-2 block rounded-lg bg-black/30 px-3 py-2 font-mono text-[12.5px] text-muted shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
                      license: <span className="text-fg">{license.key}</span>
                    </code>
                  )}
                </span>
              </motion.li>
            ))}
          </ol>
        </motion.section>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Shortcut href="/panel/checki" Icon={IconSliders} title="Ustawienia anticheata" value={`${enabledChecks} z ${totalChecks} checków włączonych`} delay={0.15} />
        <Shortcut href="/panel/serwery" Icon={IconServer} title="Serwery" value="Czekamy na pierwsze połączenie" delay={0.2} />
        <Shortcut href="/panel/licencja" Icon={IconDownload} title="Plugin" value={release ? `Wersja ${release.version}` : "Pierwsza wersja wkrótce"} delay={0.25} />
      </div>
    </>
  );
}
