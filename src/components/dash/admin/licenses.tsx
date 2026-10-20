"use client";

import { useState, useTransition } from "react";
import { createLicenseAction, extendLicenseAction, setLicenseStatusAction } from "@/lib/admin-actions";
import type { Plan } from "@/lib/content";
import type { AdminLicense } from "@/lib/server/admin-data";
import { IconPlus, IconSearch } from "../../icons";
import { Block, Input, PageHeader, Pill, Table, Td } from "../ui";
import { BILLING_LABEL, Btn, date, KeyBox, Label, Modal, NoticeBar, RowAction, Select, type Notice } from "./kit";

function state(l: AdminLicense) {
  if (l.status === "suspended") return { label: "wstrzymana", tone: "warn" as const };
  if (l.expired) return { label: "wygasła", tone: "default" as const };
  return { label: "aktywna", tone: "ok" as const };
}

export function AdminLicenses({ licenses, plans, emails }: { licenses: AdminLicense[]; plans: Plan[]; emails: string[] }) {
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [billing, setBilling] = useState<"monthly" | "lifetime">("lifetime");
  const [formNotice, setFormNotice] = useState<Notice>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [q, setQ] = useState("");
  const [busy, start] = useTransition();

  const rows = licenses.filter((l) => `${l.key} ${l.nick ?? ""} ${l.email ?? ""} ${l.planName}`.toLowerCase().includes(q.trim().toLowerCase()));
  const active = licenses.filter((l) => state(l).label === "aktywna").length;

  return (
    <>
      <PageHeader
        title="Licencje"
        desc={`${active} aktywnych z ${licenses.length}. Licencje z zakupów tworzą się same.`}
        actions={
          <button
            onClick={() => {
              setOpen(true);
              setCreated(null);
              setFormNotice(null);
              setEmail("");
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-fg px-3.5 text-[13px] font-medium text-bg transition-colors hover:bg-[#e4e5e7]"
          >
            <IconPlus className="size-3.5" />
            Wygeneruj licencję
          </button>
        }
      />
      <NoticeBar notice={notice} className="mb-4" />
      <Block pad={false}>
        <div className="border-b border-line p-4">
          <div className="relative w-full sm:w-72">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-dim" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj po kluczu lub kliencie…" className="w-full pl-8" />
          </div>
        </div>
        <Table head={["Klucz", "Właściciel", "Plan", "Ważna do", "Status", ""]}>
          {rows.map((l) => {
            const s = state(l);
            return (
              <tr key={l.id}>
                <Td className="font-mono text-[12.5px]">{l.key}</Td>
                <Td>{l.nick ? <span>{l.nick}</span> : <span className="text-dim">bez właściciela</span>}</Td>
                <Td className="text-muted">
                  {l.planName} · {BILLING_LABEL[l.billing]}
                </Td>
                <Td className="text-muted">{date(l.expiresAt)}</Td>
                <Td>
                  <Pill tone={s.tone}>{s.label}</Pill>
                </Td>
                <Td right>
                  <span className="inline-flex gap-4">
                    {l.billing === "monthly" && (
                      <RowAction disabled={busy} onClick={() => start(async () => setNotice(await extendLicenseAction(l.id)))}>
                        +30 dni
                      </RowAction>
                    )}
                    <RowAction
                      disabled={busy}
                      onClick={() => start(async () => setNotice(await setLicenseStatusAction(l.id, l.status === "active" ? "suspended" : "active")))}
                    >
                      {l.status === "active" ? "Wstrzymaj" : "Aktywuj"}
                    </RowAction>
                  </span>
                </Td>
              </tr>
            );
          })}
        </Table>
        {rows.length === 0 && <p className="px-5 py-10 text-center text-[14px] text-dim">{licenses.length ? "Nic nie pasuje do wyszukiwania." : "Brak licencji."}</p>}
      </Block>

      <Modal open={open} onClose={() => setOpen(false)} title="Nowa licencja">
        {created ? (
          <>
            <p className="mt-2 text-[14px] text-muted">Licencja utworzona. Kliknij klucz, żeby go skopiować.</p>
            <KeyBox value={created} />
            <div className="mt-6 flex justify-end">
              <Btn primary onClick={() => setOpen(false)}>
                Gotowe
              </Btn>
            </div>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const res = await createLicenseAction({ email, planId, billing });
                if (res.ok) {
                  setCreated(res.licenseKey ?? null);
                  setNotice(res);
                } else setFormNotice(res);
              });
            }}
          >
            <p className="mt-2 text-[14px] leading-relaxed text-muted">Na przykład licencja testowa albo prezent. Bez zakupu, więc nie liczy się do przychodu.</p>
            <div className="mt-5 space-y-4">
              <Label label="E-mail klienta" hint="Opcjonalnie. Bez adresu licencja nie ma właściciela.">
                <Input value={email} onChange={(e) => setEmail(e.target.value)} list="license-emails" type="email" placeholder="gracz@serwer.pl" className="w-full" />
                <datalist id="license-emails">
                  {emails.map((e) => (
                    <option key={e} value={e} />
                  ))}
                </datalist>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Label label="Plan">
                  <Select value={planId} onChange={setPlanId} options={plans.map((p) => ({ value: p.id, label: p.name }))} />
                </Label>
                <Label label="Okres">
                  <Select
                    value={billing}
                    onChange={(v) => setBilling(v as "monthly" | "lifetime")}
                    options={[
                      { value: "lifetime", label: "Dożywotnio" },
                      { value: "monthly", label: "30 dni" },
                    ]}
                  />
                </Label>
              </div>
            </div>
            <NoticeBar notice={formNotice} />
            <div className="mt-6 flex justify-end gap-2">
              <Btn onClick={() => setOpen(false)}>Anuluj</Btn>
              <Btn primary type="submit" busy={busy}>
                Wygeneruj
              </Btn>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
