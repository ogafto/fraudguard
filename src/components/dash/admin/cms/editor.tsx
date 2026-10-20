"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { discardDraftAction, listVersionsAction, publishAction, restoreVersionAction, saveDraftAction } from "@/lib/admin-actions";
import { CONTENT_DOCS, type ContentKey, type ContentMap, type Field } from "@/lib/content";
import { EASE } from "../../../ui";
import { Block } from "../../ui";
import { Btn, date, Modal, NoticeBar, type Notice } from "../kit";
import { FieldControl, Fields } from "./fields";

type Obj = Record<string, unknown>;

const HASH: Partial<Record<ContentKey, string>> = { pricing: "#pricing", faq: "#faq" };

export type EditorProps<K extends ContentKey> = {
  docKey: K;
  initial: ContentMap[K];
  hasDraft: boolean;
  publishedAt: number | null;
  updatedAt: number | null;
  updatedBy: string | null;
};

function sections(fields: Field[]) {
  const loose = fields.filter((f) => f.kind !== "group" && f.kind !== "list");
  const own = fields.filter((f) => f.kind === "group" || f.kind === "list");
  return [...(loose.length ? [{ id: "general", label: "Nagłówek i teksty", fields: loose }] : []), ...own.map((f) => ({ id: f.key, label: f.label, fields: [f] }))];
}

function History<K extends ContentKey>({ docKey, onRestore }: { docKey: K; onRestore: (data: ContentMap[K], message: string) => void }) {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<{ id: string; author: string | null; at: number }[] | null>(null);
  const [busy, start] = useTransition();

  return (
    <>
      <Btn
        onClick={() => {
          setOpen(true);
          setVersions(null);
          start(async () => setVersions(await listVersionsAction(docKey)));
        }}
      >
        Historia
      </Btn>
      <Modal open={open} onClose={() => setOpen(false)} title="Historia publikacji">
        <p className="mt-2 text-[14px] leading-relaxed text-muted">Wczytana wersja trafia do szkicu. Na stronie zmieni się dopiero po opublikowaniu.</p>
        <div className="mt-5">
          {versions === null ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-white/[0.03]" />
              ))}
            </div>
          ) : versions.length === 0 ? (
            <p className="py-6 text-center text-[14px] text-dim">Ten dokument nie był jeszcze publikowany. Strona pokazuje teksty startowe.</p>
          ) : (
            <ul className="divide-y divide-line/70 rounded-xl shadow-[0_0_0_1px_rgba(255,255,255,0.07)]">
              {versions.map((v, i) => (
                <li key={v.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <div className="text-[14px]">
                      {date(v.at, true)}
                      {i === 0 && <span className="ml-2 text-[12px] text-ok">na stronie</span>}
                    </div>
                    <div className="text-[12px] text-dim">{v.author ?? "nieznany autor"}</div>
                  </div>
                  <Btn
                    busy={busy}
                    onClick={() =>
                      start(async () => {
                        const res = await restoreVersionAction(docKey, v.id);
                        if (res.ok && res.data) onRestore(res.data, res.message);
                        setOpen(false);
                      })
                    }
                  >
                    Wczytaj
                  </Btn>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>
    </>
  );
}

export function ContentEditor<K extends ContentKey>({ docKey, initial, hasDraft: initialDraft, publishedAt: initialPublished, updatedAt, updatedBy }: EditorProps<K>) {
  const doc = CONTENT_DOCS[docKey];
  const [data, setData] = useState<ContentMap[K]>(initial);
  const [revision, setRevision] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [hasDraft, setHasDraft] = useState(initialDraft);
  const [publishedAt, setPublishedAt] = useState(initialPublished);
  const [savedAt, setSavedAt] = useState<number | null>(initialDraft ? updatedAt : null);
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState<"save" | "publish" | "preview" | "discard" | null>(null);
  const latest = useRef(data);
  useEffect(() => {
    latest.current = data;
  }, [data]);

  const change = (next: Obj) => {
    setData(next as ContentMap[K]);
    setDirty(true);
    setNotice(null);
  };

  const replace = (next: ContentMap[K]) => {
    setData(next);
    setRevision((r) => r + 1);
  };

  const save = async (quiet = false) => {
    setBusy("save");
    try {
      const res = await saveDraftAction(docKey, latest.current);
      if (res.ok) {
        setDirty(false);
        setHasDraft(true);
        setSavedAt(Date.now());
      }
      if (!quiet || !res.ok) setNotice(res);
      return res.ok;
    } catch {
      setNotice({ ok: false, message: "Nie udało się zapisać. Sprawdź połączenie i spróbuj ponownie." });
      return false;
    } finally {
      setBusy(null);
    }
  };

  const preview = async () => {
    const tab = window.open("about:blank", "_blank");
    setBusy("preview");
    const ok = dirty ? await save(true) : true;
    setBusy(null);
    if (ok && tab) tab.location.href = `/podglad/${docKey}${HASH[docKey] ?? ""}`;
    else tab?.close();
  };

  const publishNow = async () => {
    if (!confirm(`Opublikować „${doc.label}”? Zmiany od razu pojawią się na stronie.`)) return;
    setBusy("publish");
    try {
      const res = await publishAction(docKey, latest.current);
      if (res.ok && res.data) {
        replace(res.data);
        setDirty(false);
        setHasDraft(false);
        setSavedAt(null);
        setPublishedAt(Date.now());
      }
      setNotice(res);
    } catch {
      setNotice({ ok: false, message: "Nie udało się opublikować. Spróbuj ponownie." });
    } finally {
      setBusy(null);
    }
  };

  const discard = async () => {
    if (!confirm("Odrzucić szkic i wrócić do wersji ze strony?")) return;
    setBusy("discard");
    const res = await discardDraftAction(docKey);
    setBusy(null);
    setNotice(res);
    if (res.ok && res.data) {
      replace(res.data);
      setDirty(false);
      setHasDraft(false);
      setSavedAt(null);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  });

  const status = dirty
    ? { dot: "bg-warn", text: "Niezapisane zmiany" }
    : hasDraft
      ? { dot: "bg-white/60", text: `Szkic zapisany${savedAt ? ` ${date(savedAt, true)}` : ""}${updatedBy && !savedAt ? ` przez ${updatedBy}` : ""}` }
      : { dot: "bg-ok", text: publishedAt ? `Opublikowane ${date(publishedAt, true)}` : "Teksty startowe, jeszcze nic nie opublikowano" };

  const parts = sections(doc.fields);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="mb-6">
        <Link href="/admin/tresci" className="text-[13px] text-dim transition-colors hover:text-fg">
          ← Wszystkie treści
        </Link>
        <h1 className="mt-2 text-[26px] font-medium tracking-[-0.03em]">{doc.label}</h1>
        <p className="mt-1 text-[14.5px] text-muted">{doc.desc}</p>
      </motion.div>

      <div className="sticky top-14 z-10 -mx-4 mb-5 border-b border-line bg-bg/80 px-4 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:top-14">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-auto flex items-center gap-2 text-[13px] text-muted">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={status.text} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} className="flex items-center gap-2">
                <span className={`size-1.5 rounded-full ${status.dot}`} />
                {status.text}
              </motion.span>
            </AnimatePresence>
          </span>
          {(hasDraft || dirty) && (
            <Btn danger onClick={discard} busy={busy === "discard"} disabled={!!busy}>
              Odrzuć
            </Btn>
          )}
          <History
            docKey={docKey}
            onRestore={(d, message) => {
              replace(d);
              setDirty(false);
              setHasDraft(true);
              setSavedAt(Date.now());
              setNotice({ ok: true, message });
            }}
          />
          <Btn onClick={preview} busy={busy === "preview"} disabled={!!busy}>
            Podgląd
          </Btn>
          <Btn onClick={() => save()} busy={busy === "save"} disabled={!!busy || !dirty}>
            Zapisz szkic
          </Btn>
          <Btn primary onClick={publishNow} busy={busy === "publish"} disabled={!!busy || (!dirty && !hasDraft)}>
            Opublikuj
          </Btn>
        </div>
        <NoticeBar notice={notice} className="mt-3" />
      </div>

      <div key={revision} className="grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav className="hidden lg:block">
          <ul className="sticky top-[136px] space-y-0.5">
            {parts.map((p) => (
              <li key={p.id}>
                <a href={`#cms-${p.id}`} className="block rounded-lg px-2.5 py-1.5 text-[13.5px] text-muted transition-colors hover:bg-white/[0.03] hover:text-fg">
                  {p.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-4">
          {parts.map((p, i) => (
            <div key={p.id} id={`cms-${p.id}`} className="scroll-mt-[140px]">
              <Block title={p.label} delay={Math.min(i * 0.04, 0.2)}>
                <div className="space-y-4">
                  {p.id === "general" ? (
                    <Fields fields={p.fields} value={data as unknown as Obj} onChange={change} />
                  ) : (
                    <FieldControl
                      field={p.fields[0].kind === "list" ? { ...p.fields[0], label: "" } : p.fields[0]}
                      value={(data as unknown as Obj)[p.id]}
                      onChange={(v) => change({ ...(data as unknown as Obj), [p.id]: v })}
                    />
                  )}
                </div>
              </Block>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
