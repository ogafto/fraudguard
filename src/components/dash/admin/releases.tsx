"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, useTransition } from "react";
import { addReleaseAction, deleteReleaseAction } from "@/lib/admin-actions";
import type { Release } from "@/lib/server/account";
import { IconBox, IconDownload } from "../../icons";
import { EASE } from "../../ui";
import { Block, Input, PageHeader, Pill } from "../ui";
import { Btn, date, Label, NoticeBar, TextArea, type Notice } from "./kit";

export function AdminReleases({ releases }: { releases: Release[] }) {
  const [version, setVersion] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, start] = useTransition();

  const publish = () =>
    start(async () => {
      const res = await addReleaseAction({ version, url, notes });
      setNotice(res);
      if (res.ok) {
        setVersion("");
        setUrl("");
        setNotes("");
      }
    });

  const remove = (r: Release) => {
    if (!window.confirm(`Usunąć wydanie ${r.version}? Klienci przestaną je widzieć.`)) return;
    start(async () => setNotice(await deleteReleaseAction(r.id)));
  };

  return (
    <>
      <PageHeader title="Wydania" desc="Nowe wersje pluginu. Klienci z aktywnym pakietem pobierają najnowszą ze swojego panelu." />
      <NoticeBar notice={notice} className="mb-4" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Block title="Nowe wydanie">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              publish();
            }}
          >
            <Label label="Wersja">
              <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="2.1.0" className="w-full font-mono" />
            </Label>
            <Label label="Link do pliku .jar" hint="Wrzuć plik np. na GitHub Releases albo Dysk i wklej bezpośredni link do pobrania.">
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="w-full font-mono" />
            </Label>
            <Label label="Lista zmian" hint="Każda zmiana w osobnej linii.">
              <TextArea value={notes} onChange={setNotes} rows={5} placeholder={"Nowy check: Velocity (C)\nMniej fałszywych flag na lodzie"} />
            </Label>
            <div className="flex justify-end">
              <Btn type="submit" primary busy={busy} disabled={!version.trim() || !url.trim()}>
                Opublikuj wydanie
              </Btn>
            </div>
          </form>
        </Block>

        <Block title="Historia wydań" pad={false}>
          {releases.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white/[0.04] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                <IconBox className="size-5 text-muted" />
              </span>
              <p className="mt-4 text-[14.5px]">Nie ma jeszcze żadnego wydania</p>
              <p className="mt-1 max-w-[300px] text-[13px] text-dim">Pierwsza wersja, którą opublikujesz, pojawi się u klientów od razu.</p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              <AnimatePresence initial={false}>
                {releases.map((r, i) => (
                  <motion.li
                    key={r.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[14.5px]">v{r.version}</span>
                      {i === 0 && <Pill tone="ok">najnowsza</Pill>}
                      <span className="ml-auto text-[12.5px] text-dim">{date(r.createdAt, true)}</span>
                    </div>
                    {r.notes && (
                      <ul className="mt-2 space-y-1 text-[13px] text-muted">
                        {r.notes
                          .split("\n")
                          .filter((l) => l.trim())
                          .map((l, k) => (
                            <li key={k} className="flex gap-2">
                              <span className="mt-[0.6em] size-1 shrink-0 rounded-full bg-white/30" />
                              {l.trim()}
                            </li>
                          ))}
                      </ul>
                    )}
                    <div className="mt-3 flex items-center gap-4 text-[13px]">
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-fg">
                        <IconDownload className="size-3.5" />
                        Plik
                      </a>
                      <button onClick={() => remove(r)} disabled={busy} className="text-dim transition-colors hover:text-danger">
                        Usuń
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </Block>
      </div>
    </>
  );
}
