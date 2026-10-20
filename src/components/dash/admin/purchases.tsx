"use client";

import { useState, useTransition } from "react";
import { addPurchaseAction, setPurchaseStatusAction } from "@/lib/admin-actions";
import type { Plan } from "@/lib/content";
import type { AdminPurchase } from "@/lib/server/admin-data";
import { IconPlus, IconSearch } from "../../icons";
import { McHead } from "../../mc-head";
import { Block, Input, PageHeader, Pill, Table, Td } from "../ui";
import { BILLING_LABEL, Btn, date, KeyBox, Label, Modal, NoticeBar, RowAction, Select, TextArea, zl, type Notice } from "./kit";

function AddPurchase({ plans, emails, onDone }: { plans: Plan[]; emails: string[]; onDone: (n: Notice) => void }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [billing, setBilling] = useState<"monthly" | "lifetime">("monthly");
  const [amount, setAmount] = useState(String(plans[0]?.monthly ?? ""));
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [key, setKey] = useState<string | null>(null);
  const [busy, start] = useTransition();

  const price = (id: string, b: "monthly" | "lifetime") => {
    const p = plans.find((x) => x.id === id);
    if (p) setAmount(String(b === "monthly" ? p.monthly : p.lifetime));
  };
  const reset = () => {
    setEmail("");
    setNote("");
    setNotice(null);
    setKey(null);
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
      <button
        onClick={() => {
          reset();
          setOpen(true);
        }}
        className="inline-flex h-8 items-center gap-1.5 rounded-full bg-fg px-3.5 text-[13px] font-medium text-bg transition-colors hover:bg-[#e4e5e7]"
      >
        <IconPlus className="size-3.5" />
        Dodaj zakup
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nowy zakup">
        {key ? (
          <>
            <p className="mt-2 text-[14px] text-muted">Zakup zapisany. Klucz znajdziesz też w zakładce Licencje. Kliknij go, żeby skopiować.</p>
            <KeyBox value={key} />
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
              submit();
            }}
          >
            <p className="mt-2 text-[14px] leading-relaxed text-muted">Płatności idą przez Discorda, więc tutaj zapisujesz to, co klient zapłacił. Licencja utworzy się sama.</p>
            <div className="mt-5 space-y-4">
              <Label label="E-mail konta klienta" hint="Klient musi mieć założone konto na stronie.">
                <Input value={email} onChange={(e) => setEmail(e.target.value)} list="purchase-emails" type="email" required placeholder="gracz@serwer.pl" className="w-full" />
                <datalist id="purchase-emails">
                  {emails.map((e) => (
                    <option key={e} value={e} />
                  ))}
                </datalist>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Label label="Plan">
                  <Select
                    value={planId}
                    onChange={(v) => {
                      setPlanId(v);
                      price(v, billing);
                    }}
                    options={plans.map((p) => ({ value: p.id, label: p.name }))}
                  />
                </Label>
                <Label label="Okres">
                  <Select
                    value={billing}
                    onChange={(v) => {
                      const b = v as "monthly" | "lifetime";
                      setBilling(b);
                      price(planId, b);
                    }}
                    options={[
                      { value: "monthly", label: "Miesięcznie" },
                      { value: "lifetime", label: "Dożywotnio" },
                    ]}
                  />
                </Label>
              </div>
              <Label label="Kwota (zł)" hint={billing === "monthly" ? "Jeśli klient ma już aktywną licencję miesięczną na ten plan, przedłużymy ją o 30 dni." : undefined}>
                <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" required className="w-full" />
              </Label>
              <Label label="Notatka" hint="Np. nick na Discordzie albo numer transakcji. Widzą ją tylko administratorzy.">
                <TextArea value={note} onChange={setNote} rows={2} />
              </Label>
            </div>
            <NoticeBar notice={notice} />
            <div className="mt-6 flex justify-end gap-2">
              <Btn onClick={() => setOpen(false)}>Anuluj</Btn>
              <Btn primary type="submit" busy={busy}>
                Zapisz zakup
              </Btn>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}

export function AdminPurchases({ purchases, plans, emails }: { purchases: AdminPurchase[]; plans: Plan[]; emails: string[] }) {
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
        actions={<AddPurchase plans={plans} emails={emails} onDone={setNotice} />}
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
