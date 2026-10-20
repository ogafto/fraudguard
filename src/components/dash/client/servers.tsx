"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { IconServer } from "../../icons";
import { EASE } from "../../ui";
import { PageHeader } from "../ui";
import { CopyKey, EmptyState, Locked } from "./common";

export function ClientServers({ email, licenseKey, maxServers }: { email: string; licenseKey: string | null; maxServers: string | null }) {
  if (!licenseKey) {
    return (
      <>
        <PageHeader title="Serwery" desc="Serwery, na których działa FraudGuard z Twoim kluczem." />
        <Locked email={email}>Serwery pojawią się po aktywacji pakietu</Locked>
      </>
    );
  }
  return (
    <>
      <PageHeader title="Serwery" desc={maxServers ? `Twój pakiet obejmuje: ${maxServers.toLowerCase()}.` : "Serwery, na których działa FraudGuard z Twoim kluczem."} />
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE }} className="card">
        <EmptyState Icon={IconServer} title="Żaden serwer nie jest jeszcze połączony">
          Wrzuć plugin na serwer, wpisz klucz w config.yml i zrestartuj serwer. Pojawi się tutaj razem z liczbą graczy i wersją.
          <div className="mx-auto mt-5 max-w-[420px]">
            <CopyKey value={licenseKey} />
          </div>
          <Link href="/panel/licencja" className="mt-5 inline-block text-[13.5px] text-fg underline-offset-4 hover:underline">
            Pobierz plugin
          </Link>
        </EmptyState>
      </motion.section>
    </>
  );
}
