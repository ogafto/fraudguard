"use client";

import { useState, useTransition } from "react";
import { addPurchaseAction, setPurchaseStatusAction } from "@/lib/admin-actions";
import type { Plan } from "@/lib/content";
import type { AdminPurchase } from "@/lib/server/admin-data";
import { IconPlus, IconSearch } from "../../icons";
import { McHead } from "../../mc-head";
import { Block, Input, PageHeader, Pill, Table, Td } from "../ui";
import { BILLING_LABEL, Btn, date, Modal, NoticeBar, RowAction, TextArea, zl, type Notice } from "./kit";
import { AmountInput, BillingPicker, FieldLabel, PlanPicker, SuccessKey, UserPicker, type Billing, type PickUser } from "./pickers";

function AddPurchase({ plans, users, onDone }: { plans: Plan[]; users: PickUser[]; onDone: (n: Notice) => void }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [planId, setPlanId] = useState(plans.find((p) => p.featured)?.id ?? plans[0]?.id ?? "");
  const [billing, setBilling] = useState<Billing>("monthly");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [key, setKey] = useState<string | null>(null);
  const [busy, start] = useTransition();

  const plan = plans.find((p) => p.id === planId) ?? null;
  const suggested = plan ? (billing === "monthly" ? plan.monthly : plan.lifetime) : null;
  const choose = (id: string, b: Billing) => {
    const p = plans.find((x) => x.id === id);
    setPlanId(id);
    setBilling(b);
    if (p) setAmount(String(b === "monthly" ? p.monthly : p.lifetime));
  };

  const openModal = () => {
    setEmail("");
    setNote("");
    setNotice(null);
    setKey(null);
    choose(planId, billing);
    setOpen(true);
  };

  const submit = () =>
    start(async () => {
      const res = await addPurchaseAction({ email, planId, billing, amount, note });
      setNotice(res.ok ? null : res);
      if (res.ok) {
        setKey(res.licenseKey ?? null);
        onDone(res);
      }
    });

  return (
    <>
      <button onClick={openModal} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-fg px-3.5 text-[13px] font-medium text-bg transition-colors hover:bg-[#e4e5e7]">
        <IconPlus className="size-3.5" />
        Dodaj zakup
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={key ? "Zakup zapisany" : "Nowy zakup"}
        desc={key ? undefined : "Zapisz płatność z Discorda. Licencja utworzy się sama, a klient zobaczy pakiet w swoim panelu."}
      >
        {key ? (
          <SuccessKey licenseKey={key} onClose={() => setOpen(false)} text="Klient ma już pakiet w panelu. Klucz znajdziesz też w zakładce Licencje." />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="mt-6 space-y-5"
          >
            <div>
              <FieldLabel>Klient</FieldLabel>
              <UserPicker users={users} value={email} onChange={setEmail} />
            </div>
            <div>
              <FieldLabel>Okres</FieldLabel>
              <BillingPicker value={billing} onChange={(b) => choose(planId, b)} />
            </div>
            <div>
              <FieldLabel>Pakiet</FieldLabel>
              <PlanPicker plans={plans} value={planId} billing={billing} onChange={(id) => choose(id, billing)} />
            </div>
            <div>
              <FieldLabel hint={billing === "monthly" ? "Aktywny pakiet miesięczny przedłuży się o 30 dni" : undefined}>Zapłacona kwota</FieldLabel>
              <AmountInput value={amount} onChange={setAmount} suggested={suggested} />
            </div>
            <div>
              <FieldLabel hint="widzą tylko admini">Notatka</FieldLabel>
              <TextArea value={note} onChange={setNote} rows={2} placeholder="Np. nick na Discordzie albo numer transakcji" />
            </div>
            <NoticeBar notice={notice} />
            <div className="flex gap-2 pt-1">
              <Btn onClick={() => setOpen(false)} className="flex-1 sm:flex-none">
                Anuluj
              </Btn>
              <Btn primary type="submit" busy={busy} disabled={!email || !planId || !amount} className="flex-1">
                Zapisz zakup
              </Btn>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}

export function AdminPurchases({ purchases, plans, users }: { purchases: AdminPurchase[]; plans: Plan[]; users: PickUser[] }) {
  const [q, setQ] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [pending, start] = useTransition();
  const rows = purchases.filter((p) => `${p.nick} ${p.email} ${p.planName} ${p.note ?? ""}`.toLowerCase().includes(q.trim().toLowerCase()));
  const paid = purchases.filter((p) => p.status === "paid");

  return (
    <>
      <PageHeader
        title="Zakupy"
        desc={`${paid.length} opłaconych · ${zl(paid.reduce((a, p) => a + p.amount, 0))} łącznie`}
        actions={<AddPurchase plans={plans} users={users} onDone={setNotice} />}
      />
      <NoticeBar notice={notice} className="mb-4" />
      <Block pad={false}>
        <div className="border-b border-line p-4">
          <div className="relative w-full sm:w-72">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-dim" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj po kliencie, planie, notatce…" className="w-full pl-8" />
          </div>
        </div>
        <Table head={["Kto", "Co kupił", "Kwota", "Kiedy", "Licencja", "Status", ""]}>
          {rows.map((p) => (
            <tr key={p.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <McHead name={p.nick} className="size-8 rounded-lg" />
                  <div className="min-w-0">
                    <div>{p.nick}</div>
                    <div className="truncate text-[12.5px] text-dim">{p.email}</div>
                  </div>
                </div>
              </Td>
              <Td>
                <div>{p.planName}</div>
                <div className="text-[12.5px] text-dim">{BILLING_LABEL[p.billing]}</div>
              </Td>
              <Td className="tabular-nums">{zl(p.amount)}</Td>
              <Td className="text-muted">
                <div>{date(p.createdAt, true)}</div>
                {p.note && <div className="max-w-[220px] truncate text-[12px] text-dim" title={p.note}>{p.note}</div>}
              </Td>
              <Td className="font-mono text-[12.5px] text-muted">{p.licenseKey ?? <span className="font-sans text-dim">przedłużenie</span>}</Td>
              <Td>
                <Pill tone={p.status === "paid" ? "ok" : "danger"}>{p.status === "paid" ? "opłacony" : "zwrot"}</Pill>
              </Td>
              <Td right>
                <RowAction
                  disabled={pending}
                  onClick={() => start(async () => setNotice(await setPurchaseStatusAction(p.id, p.status === "paid" ? "refunded" : "paid")))}
                >
                  {p.status === "paid" ? "Oznacz zwrot" : "Przywróć"}
                </RowAction>
              </Td>
            </tr>
          ))}
        </Table>
        {rows.length === 0 && (
          <p className="px-5 py-10 text-center text-[14px] text-dim">{purchases.length ? "Nic nie pasuje do wyszukiwania." : "Brak zakupów. Dodaj pierwszy, gdy klient zapłaci na Discordzie."}</p>
        )}
      </Block>
    </>
  );
}
