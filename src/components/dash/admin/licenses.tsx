"use client";

import { useState, useTransition } from "react";
import { createLicenseAction, extendLicenseAction, setLicenseStatusAction } from "@/lib/admin-actions";
import type { Plan } from "@/lib/content";
import type { AdminLicense } from "@/lib/server/admin-data";
import { IconPlus, IconSearch } from "../../icons";
import { Block, Input, PageHeader, Pill, Table, Td } from "../ui";
import { BILLING_LABEL, Btn, date, Modal, NoticeBar, RowAction, type Notice } from "./kit";
import { BillingPicker, FieldLabel, PlanPicker, SuccessKey, UserPicker, type PickUser } from "./pickers";

function state(l: AdminLicense) {
  if (l.status === "suspended") return { label: "wstrzymana", tone: "warn" as const };
  if (l.expired) return { label: "wygasła", tone: "default" as const };
  return { label: "aktywna", tone: "ok" as const };
}

export function AdminLicenses({ licenses, plans, users }: { licenses: AdminLicense[]; plans: Plan[]; users: PickUser[] }) {
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [planId, setPlanId] = useState(plans.find((p) => p.featured)?.id ?? plans[0]?.id ?? "");
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={created ? "Licencja gotowa" : "Nowa licencja"}
        desc={created ? undefined : "Na przykład licencja testowa albo prezent. Bez zakupu, więc nie liczy się do przychodu."}
      >
        {created ? (
          <SuccessKey licenseKey={created} onClose={() => setOpen(false)} text={email ? "Pakiet jest już widoczny w panelu klienta." : "Licencja nie ma właściciela. Przekaż klucz komu chcesz."} />
        ) : (
          <form
            className="mt-6 space-y-5"
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
            <div>
              <FieldLabel hint="opcjonalnie">Właściciel</FieldLabel>
              <UserPicker users={users} value={email} onChange={setEmail} allowEmpty emptyLabel="Bez właściciela" />
            </div>
            <div>
              <FieldLabel>Okres</FieldLabel>
              <BillingPicker value={billing} onChange={setBilling} />
            </div>
            <div>
              <FieldLabel>Pakiet</FieldLabel>
              <PlanPicker plans={plans} value={planId} billing={billing} onChange={setPlanId} />
            </div>
            <NoticeBar notice={formNotice} />
            <div className="flex gap-2 pt-1">
              <Btn onClick={() => setOpen(false)} className="flex-1 sm:flex-none">
                Anuluj
              </Btn>
              <Btn primary type="submit" busy={busy} disabled={!planId} className="flex-1">
                Wygeneruj licencję
              </Btn>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
