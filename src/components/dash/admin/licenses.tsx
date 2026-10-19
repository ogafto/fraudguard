"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ADMIN_LICENSES } from "@/lib/mock";
import { IconPlus } from "../../icons";
import { EASE } from "../../ui";
import { Block, Input, PageHeader, Pill, Table, Td } from "../ui";

export function AdminLicenses() {
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        title="Licencje"
        desc="Wszystkie klucze licencyjne i ich stan."
        actions={
          <button
            onClick={() => {
              setOpen(true);
              setCreated(null);
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-fg px-3.5 text-[13px] font-medium text-bg transition-colors hover:bg-[#e4e5e7]"
          >
            <IconPlus className="size-3.5" />
            Wygeneruj licencję
          </button>
        }
      />
      <Block pad={false}>
        <Table head={["Klucz", "Właściciel", "Plan", "Serwery", "Ważna do", "Status", ""]}>
          {ADMIN_LICENSES.map((l) => (
            <tr key={l.key}>
              <Td className="font-mono text-[12.5px]">{l.key}</Td>
              <Td>{l.owner}</Td>
              <Td className="text-muted">{l.plan}</Td>
              <Td className="font-mono text-[12.5px] text-muted">{l.servers}</Td>
              <Td className="text-muted">{l.expires}</Td>
              <Td>
                <Pill tone={l.status === "aktywna" ? "ok" : l.status === "wstrzymana" ? "warn" : "default"}>{l.status}</Pill>
              </Td>
              <Td right>
                <button className="text-[13px] text-muted transition-colors hover:text-fg">Zarządzaj</button>
              </Td>
            </tr>
          ))}
        </Table>
      </Block>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.35, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="card w-full max-w-[440px] bg-panel p-6"
            >
              <h3 className="text-[18px] font-medium">Nowa licencja</h3>
              {created ? (
                <>
                  <p className="mt-2 text-[14px] text-muted">Licencja utworzona. Skopiuj klucz i wyślij go klientowi.</p>
                  <code className="mt-4 block rounded-lg bg-white/[0.04] px-3 py-2.5 font-mono text-[14px] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">{created}</code>
                  <div className="mt-6 flex justify-end">
                    <button onClick={() => setOpen(false)} className="h-9 rounded-full bg-fg px-4 text-[13.5px] font-medium text-bg hover:bg-[#e4e5e7]">
                      Gotowe
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-5 space-y-4">
                    <label className="block">
                      <span className="mb-1.5 block text-[13px] text-muted">E-mail klienta</span>
                      <Input placeholder="admin@serwer.pl" className="w-full" />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[13px] text-muted">Plan</span>
                      <select className="h-9 w-full rounded-lg bg-white/[0.03] px-3 text-[13.5px] shadow-[0_0_0_1px_rgba(255,255,255,0.08)] outline-none">
                        {["Starter", "Pro", "Network", "Lifetime Pro"].map((p) => (
                          <option key={p} className="bg-panel">
                            {p}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    <button onClick={() => setOpen(false)} className="h-9 rounded-full px-4 text-[13.5px] text-muted hover:text-fg">
                      Anuluj
                    </button>
                    <button
                      onClick={() => setCreated("FG-N3W1-K8YP-QQ20-ZX7M")}
                      className="h-9 rounded-full bg-fg px-4 text-[13.5px] font-medium text-bg hover:bg-[#e4e5e7]"
                    >
                      Wygeneruj
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
