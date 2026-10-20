"use client";

import { useState, useTransition } from "react";
import { setUserRoleAction } from "@/lib/admin-actions";
import type { AdminUser } from "@/lib/server/admin-data";
import { IconSearch } from "../../icons";
import { McHead } from "../../mc-head";
import { Block, Input, PageHeader, Pill, Table, Td } from "../ui";
import { date, NoticeBar, RowAction, zl, type Notice } from "./kit";

type Filter = "all" | "verified" | "unverified" | "buyers";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Wszystkie" },
  { id: "verified", label: "Zweryfikowane" },
  { id: "unverified", label: "Bez weryfikacji" },
  { id: "buyers", label: "Z licencją" },
];

export function AdminCustomers({ users, meId }: { users: AdminUser[]; meId: string }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [notice, setNotice] = useState<Notice>(null);
  const [pending, start] = useTransition();

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
                {u.id !== meId && (
                  <RowAction onClick={() => toggleRole(u)} disabled={pending}>
                    {u.role === "admin" ? "Odbierz admina" : "Nadaj admina"}
                  </RowAction>
                )}
              </Td>
            </tr>
          ))}
        </Table>
        {rows.length === 0 && <p className="px-5 py-10 text-center text-[14px] text-dim">{users.length ? "Nikt nie pasuje do wyszukiwania." : "Nikt jeszcze nie założył konta."}</p>}
      </Block>
    </>
  );
}
