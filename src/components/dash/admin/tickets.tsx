"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { TICKETS, type Ticket } from "@/lib/mock";
import { LogoMark } from "../../logo";
import { EASE } from "../../ui";
import { PageHeader, Pill } from "../ui";

const tone = (s: Ticket["status"]) => (s === "otwarte" ? "warn" : s === "oczekuje" ? "default" : "ok");

export function AdminTickets() {
  const [tickets, setTickets] = useState(TICKETS);
  const [sel, setSel] = useState(TICKETS[0].id);
  const [draft, setDraft] = useState("");
  const t = tickets.find((x) => x.id === sel)!;

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setTickets((all) =>
      all.map((x) =>
        x.id === sel
          ? {
              ...x,
              status: "oczekuje",
              updated: "teraz",
              messages: [...x.messages, { from: "zespół", who: "Wsparcie FraudGuard", text: draft.trim(), time: "teraz" }],
            }
          : x,
      ),
    );
    setDraft("");
  };

  return (
    <>
      <PageHeader title="Zgłoszenia" desc="Skrzynka wsparcia klientów." />
      <div className="card grid min-h-[560px] overflow-hidden lg:grid-cols-[320px_1fr]">
        <ul className="divide-y divide-line/70 border-b border-line lg:border-b-0 lg:border-r">
          {tickets.map((x) => (
            <li key={x.id}>
              <button
                onClick={() => setSel(x.id)}
                className={`w-full px-4 py-3.5 text-left transition-colors ${x.id === sel ? "bg-white/[0.05]" : "hover:bg-white/[0.02]"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[14px]">{x.subject}</span>
                  <Pill tone={tone(x.status)}>{x.status}</Pill>
                </div>
                <div className="mt-1 text-[12.5px] text-dim">
                  #{x.id} · {x.customer} · {x.updated}
                </div>
              </button>
            </li>
          ))}
        </ul>

        <div className="flex min-h-0 flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
            <div className="min-w-0">
              <div className="truncate text-[15px] font-medium">{t.subject}</div>
              <div className="text-[12.5px] text-dim">
                #{t.id} · {t.customer}
              </div>
            </div>
            <button
              onClick={() => setTickets((all) => all.map((x) => (x.id === sel ? { ...x, status: "zamknięte" } : x)))}
              className="h-8 shrink-0 rounded-full px-3.5 text-[13px] text-muted ring-1 ring-inset ring-white/[0.1] transition-colors hover:text-fg"
            >
              Zamknij zgłoszenie
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-5" data-lenis-prevent>
            <AnimatePresence initial={false}>
              {t.messages.map((m, i) => (
                <motion.div
                  key={`${t.id}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className={`flex gap-3 ${m.from === "zespół" ? "flex-row-reverse text-right" : ""}`}
                >
                  {m.from === "zespół" ? (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-fg">
                      <LogoMark className="size-4 text-bg" />
                    </span>
                  ) : (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-[11px] font-semibold">
                      {m.who.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <div className={`max-w-[75%] ${m.from === "zespół" ? "items-end" : ""}`}>
                    <div className="text-[12.5px] text-dim">
                      {m.who} · {m.time}
                    </div>
                    <div
                      className={`mt-1 rounded-2xl px-3.5 py-2.5 text-left text-[14px] leading-relaxed ${
                        m.from === "zespół" ? "bg-fg text-bg" : "bg-white/[0.05] text-fg shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Napisz odpowiedź…"
              className="h-10 flex-1 rounded-full bg-white/[0.03] px-4 text-[14px] outline-none shadow-[0_0_0_1px_rgba(255,255,255,0.08)] placeholder:text-dim focus:shadow-[0_0_0_1px_rgba(255,255,255,0.3)]"
            />
            <button type="submit" className="h-10 rounded-full bg-fg px-5 text-[13.5px] font-medium text-bg transition-colors hover:bg-[#e4e5e7]">
              Wyślij
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
