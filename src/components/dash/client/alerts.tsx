"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { ALERTS, type AlertAction } from "@/lib/mock";
import { IconSearch } from "../../icons";
import { Button } from "../../ui";
import { ActionBadge, Block, Input, PageHeader, Player, Table, Td } from "../ui";

const CATEGORIES = ["Wszystkie", "Walka", "Ruch", "Świat", "Pakiety"];
const ACTIONS: ("wszystkie" | AlertAction)[] = ["wszystkie", "flaga", "cofnięcie", "kick", "ban"];
const PER_PAGE = 12;

export function ClientAlerts() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Wszystkie");
  const [action, setAction] = useState<(typeof ACTIONS)[number]>("wszystkie");
  const [page, setPage] = useState(0);

  const rows = useMemo(
    () =>
      ALERTS.filter(
        (a) =>
          (cat === "Wszystkie" || a.category === cat) &&
          (action === "wszystkie" || a.action === action) &&
          a.player.toLowerCase().includes(q.toLowerCase()),
      ),
    [q, cat, action],
  );
  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const visible = rows.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <>
      <PageHeader
        title="Alerty"
        desc="Wszystkie flagi i akcje anticheata ze wszystkich serwerów."
        actions={
          <Button size="sm" variant="secondary">
            Eksportuj CSV
          </Button>
        }
      />

      <Block pad={false}>
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
          <div className="relative">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-dim" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
              placeholder="Szukaj gracza…"
              className="w-full pl-8 lg:w-64"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCat(c);
                  setPage(0);
                }}
                className={`relative rounded-full px-3 py-1.5 text-[13px] transition-colors ${cat === c ? "text-bg" : "text-muted hover:text-fg"}`}
              >
                {cat === c && (
                  <motion.span layoutId="alert-cat" className="absolute inset-0 rounded-full bg-fg" transition={{ type: "spring", stiffness: 450, damping: 35 }} />
                )}
                <span className="relative">{c}</span>
              </button>
            ))}
          </div>
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value as (typeof ACTIONS)[number]);
              setPage(0);
            }}
            className="h-9 rounded-lg bg-white/[0.03] px-3 text-[13.5px] text-fg shadow-[0_0_0_1px_rgba(255,255,255,0.08)] outline-none lg:ml-auto"
          >
            {ACTIONS.map((a) => (
              <option key={a} value={a} className="bg-panel">
                Akcja: {a}
              </option>
            ))}
          </select>
        </div>

        <Table head={["Gracz", "Check", "Kategoria", "Serwer", "Pewność", "VL", "Akcja", "Kiedy"]}>
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((a) => (
              <motion.tr key={a.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <Td>
                  <Player name={a.player} />
                </Td>
                <Td>{a.check}</Td>
                <Td className="text-muted">{a.category}</Td>
                <Td className="text-muted">{a.server}</Td>
                <Td>
                  <span className="flex items-center gap-2">
                    <span className="h-1 w-16 overflow-hidden rounded-full bg-white/[0.06]">
                      <span className="block h-full rounded-full bg-white/70" style={{ width: `${a.conf}%` }} />
                    </span>
                    <span className="font-mono text-[12px] text-muted">{a.conf}%</span>
                  </span>
                </Td>
                <Td className="font-mono text-[12.5px] text-muted">{a.vl}</Td>
                <Td>
                  <ActionBadge action={a.action} />
                </Td>
                <Td right className="whitespace-nowrap text-dim">
                  {a.time}
                </Td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </Table>
        {visible.length === 0 && <div className="px-5 py-12 text-center text-[14px] text-muted">Brak alertów dla wybranych filtrów.</div>}

        <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[13px] text-muted">
          <span>
            {rows.length} alertów · strona {page + 1} z {pages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg px-3 py-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-colors hover:text-fg disabled:opacity-40"
            >
              Poprzednia
            </button>
            <button
              disabled={page >= pages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg px-3 py-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-colors hover:text-fg disabled:opacity-40"
            >
              Następna
            </button>
          </div>
        </div>
      </Block>
    </>
  );
}
