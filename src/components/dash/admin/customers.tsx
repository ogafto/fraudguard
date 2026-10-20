"use client";

import { motion } from "motion/react";
import { useState, useTransition } from "react";
import { grantPackageAction, setUserRoleAction } from "@/lib/admin-actions";
import type { Plan } from "@/lib/content";
import type { AdminUser } from "@/lib/server/admin-data";
import { IconSearch } from "../../icons";
import { McHead } from "../../mc-head";
import { Block, Input, PageHeader, Pill, Table, Td } from "../ui";
import { EASE } from "../../ui";
import { Btn, date, KeyBox, Modal, NoticeBar, RowAction, zl, type Notice } from "./kit";

type Filter = "all" | "verified" | "unverified" | "buyers";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Wszystkie" },
  { id: "verified", label: "Zweryfikowane" },
  { id: "unverified", label: "Bez weryfikacji" },
  { id: "buyers", label: "Z licencją" },
];

function GrantPackage({ user, plans, onClose, onDone }: { user: AdminUser | null; plans: Plan[]; onClose: () => void; onDone: (n: Notice) => void }) {
  const [planId, setPlanId] = useState(plans.find((p) => p.featured)?.id ?? plans[0]?.id ?? "");
  const [billing, setBilling] = useState<"monthly" | "lifetime">("lifetime");
  const [notice, setNotice] = useState<Notice>(null);
  const [key, setKey] = useState<string | null>(null);
  const [busy, start] = useTransition();

  const close = () => {
    setNotice(null);
    setKey(null);
    onClose();
  };

  const submit = () =>
    user &&
    start(async () => {
      const res = await grantPackageAction({ userId: user.id, planId, billing });
      setNotice(res.ok ? null : res);
      if (res.ok) {
        setKey(res.licenseKey ?? null);
        onDone(res);
      }
    });

  return (
    <Modal open={!!user} onClose={close} title={key ? "Pakiet nadany" : "Nadaj pakiet"}>
      {user && (
        <>
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/[0.03] p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
            <McHead name={user.nick} className="size-10 rounded-lg" />
            <div className="min-w-0">
              <div className="text-[14.5px] font-medium">{user.nick}</div>
              <div className="truncate text-[12.5px] text-dim">{user.email}</div>
            </div>
          </div>

          {key ? (
            <>
              <p className="mt-5 text-[14px] leading-relaxed text-muted">
                Gotowe. {user.nick} widzi już pakiet w swoim panelu, razem z ustawieniami anticheata i pobieraniem pluginu. Klucz licencji:
              </p>
              <KeyBox value={key} />
              <div className="mt-6 flex justify-end">
                <Btn primary onClick={close}>
                  Zamknij
                </Btn>
              </div>
            </>
          ) : (
            <>
              <div className="mt-5 text-[13px] text-muted">Pakiet</div>
              <div className="mt-2 grid gap-2">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlanId(p.id)}
                    className={`relative flex items-center justify-between rounded-xl px-4 py-3 text-left transition-colors ${planId === p.id ? "text-fg" : "text-muted hover:bg-white/[0.03]"}`}
                  >
                    {planId === p.id && (
                      <motion.span
                        layoutId="grant-plan"
                        className="absolute inset-0 rounded-xl bg-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.3)]"
                        transition={{ type: "spring", stiffness: 500, damping: 38 }}
                      />
                    )}
                    <span className="relative">
                      <span className="block text-[14.5px] font-medium">{p.name}</span>
                      <span className="block text-[12.5px] text-dim">{p.features[0]}</span>
                    </span>
                    <span className="relative text-right text-[12.5px] tabular-nums text-dim">
                      {p.monthly} zł / mies.
                      <br />
                      {p.lifetime} zł na zawsze
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-5 text-[13px] text-muted">Okres</div>
              <div className="mt-2 grid grid-cols-2 gap-1 rounded-full bg-white/[0.03] p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                {(["monthly", "lifetime"] as const).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBilling(b)}
                    className={`relative h-9 rounded-full text-[13.5px] transition-colors ${billing === b ? "text-bg" : "text-muted hover:text-fg"}`}
                  >
                    {billing === b && <motion.span layoutId="grant-billing" className="absolute inset-0 rounded-full bg-fg" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                    <span className="relative">{b === "monthly" ? "30 dni" : "Dożywotnio"}</span>
                  </button>
                ))}
              </div>

              <motion.p key={billing} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE }} className="mt-3 text-[12.5px] leading-relaxed text-dim">
                {billing === "monthly" ? "Pakiet wygaśnie za 30 dni. Przedłużysz go w zakładce Licencje albo dodając zakup." : "Pakiet nie wygasa. Możesz go wstrzymać w każdej chwili w zakładce Licencje."}
              </motion.p>

              <NoticeBar notice={notice} />
              <div className="mt-6 flex justify-end gap-2">
                <Btn onClick={close}>Anuluj</Btn>
                <Btn primary busy={busy} disabled={!planId} onClick={submit}>
                  Nadaj pakiet
                </Btn>
              </div>
            </>
          )}
        </>
      )}
    </Modal>
  );
}

export function AdminCustomers({ users, meId, plans }: { users: AdminUser[]; meId: string; plans: Plan[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [notice, setNotice] = useState<Notice>(null);
  const [pending, start] = useTransition();
  const [grantFor, setGrantFor] = useState<AdminUser | null>(null);

  const rows = users
    .filter((u) => `${u.nick} ${u.email}`.toLowerCase().includes(q.trim().toLowerCase()))
    .filter((u) => (filter === "verified" ? u.verified : filter === "unverified" ? !u.verified : filter === "buyers" ? u.activeLicenses > 0 : true));
  const verified = users.filter((u) => u.verified).length;

  const toggleRole = (u: AdminUser) =>
    start(async () => setNotice(await setUserRoleAction(u.id, u.role === "admin" ? "client" : "admin")));

  return (
    <>
      <PageHeader title="Klienci" desc={`${users.length} kont · ${verified} zweryfikowanych · ${zl(users.reduce((a, u) => a + u.spent, 0))} łącznie`} />
      <NoticeBar notice={notice} className="mb-4" />
      <Block pad={false}>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-72">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-dim" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj po nicku lub e-mailu…" className="w-full pl-8" />
          </div>
          <div className="flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`h-8 rounded-full px-3 text-[13px] transition-colors ${filter === f.id ? "bg-white/[0.08] text-fg" : "text-muted hover:text-fg"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <Table head={["Klient", "Założone", "Weryfikacja", "Licencje", "Wydał", "Rola", ""]}>
          {rows.map((u) => (
            <tr key={u.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <McHead name={u.nick} className="size-8 rounded-lg" />
                  <div className="min-w-0">
                    <div>{u.nick}</div>
                    <div className="truncate text-[12.5px] text-dim">{u.email}</div>
                  </div>
                </div>
              </Td>
              <Td className="text-muted">{date(u.createdAt, true)}</Td>
              <Td>
                <Pill tone={u.verified ? "ok" : "warn"}>{u.verified ? "zweryfikowany" : "niezweryfikowany"}</Pill>
              </Td>
              <Td className="tabular-nums text-muted">{u.activeLicenses || "brak"}</Td>
              <Td className="tabular-nums">{u.spent ? zl(u.spent) : <span className="text-dim">0 zł</span>}</Td>
              <Td>{u.role === "admin" ? <Pill>admin</Pill> : <span className="text-[13px] text-dim">klient</span>}</Td>
              <Td right>
                <div className="flex items-center justify-end gap-4">
                  <button
                    onClick={() => setGrantFor(u)}
                    disabled={!u.verified}
                    title={u.verified ? undefined : "Konto musi najpierw potwierdzić e-mail"}
                    className="inline-flex h-8 items-center rounded-full bg-fg px-3.5 text-[12.5px] font-medium text-bg transition-[background-color,opacity] hover:bg-[#e4e5e7] disabled:opacity-30"
                  >
                    Nadaj pakiet
                  </button>
                  {u.id !== meId && (
                    <RowAction onClick={() => toggleRole(u)} disabled={pending}>
                      {u.role === "admin" ? "Odbierz admina" : "Nadaj admina"}
                    </RowAction>
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </Table>
        <GrantPackage user={grantFor} plans={plans} onClose={() => setGrantFor(null)} onDone={setNotice} />
        {rows.length === 0 && <p className="px-5 py-10 text-center text-[14px] text-dim">{users.length ? "Nikt nie pasuje do wyszukiwania." : "Nikt jeszcze nie założył konta."}</p>}
      </Block>
    </>
  );
}
