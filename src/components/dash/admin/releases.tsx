"use client";

import { useState } from "react";
import { RELEASES } from "@/lib/mock";
import { IconBox } from "../../icons";
import { Block, Input, PageHeader, Pill } from "../ui";

export function AdminReleases() {
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<string | null>(null);
  const [channel, setChannel] = useState<"stabilna" | "beta">("stabilna");

  return (
    <>
      <PageHeader title="Wydania" desc="Publikuj nowe wersje pluginu dla klientów." />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Block title="Nowe wydanie">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              setFile(e.dataTransfer.files[0]?.name ?? null);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors ${
              drag ? "border-white/50 bg-white/[0.04]" : "border-white/15 hover:border-white/30"
            }`}
          >
            <input type="file" accept=".jar" className="hidden" onChange={(e) => setFile(e.target.files?.[0]?.name ?? null)} />
            <IconBox className="size-6 text-muted" />
            <div className="mt-3 text-[14px]">{file ?? "Upuść plik .jar lub kliknij, aby wybrać"}</div>
            <div className="mt-1 text-[12.5px] text-dim">Maks. 20 MB</div>
          </label>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[13px] text-muted">Wersja</span>
              <Input placeholder="2.1.0" className="w-full font-mono" />
            </label>
            <div>
              <span className="mb-1.5 block text-[13px] text-muted">Kanał</span>
              <div className="flex rounded-lg bg-white/[0.03] p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                {(["stabilna", "beta"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setChannel(c)}
                    className={`h-7 flex-1 rounded-md text-[13px] transition-colors ${channel === c ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-[13px] text-muted">Lista zmian</span>
            <textarea
              rows={4}
              placeholder={"- Nowy check ElytraFly\n- Poprawki Reach"}
              className="w-full resize-none rounded-lg bg-white/[0.03] px-3 py-2.5 font-mono text-[12.5px] outline-none shadow-[0_0_0_1px_rgba(255,255,255,0.08)] placeholder:text-dim focus:shadow-[0_0_0_1px_rgba(255,255,255,0.35)]"
            />
          </label>
          <button className="mt-5 h-9 w-full rounded-full bg-fg text-[13.5px] font-medium text-bg transition-colors hover:bg-[#e4e5e7]">Opublikuj wydanie</button>
        </Block>

        <Block title="Historia wydań" pad={false} delay={0.05}>
          <ul className="divide-y divide-line/70">
            {RELEASES.map((r) => (
              <li key={r.version} className="flex items-start gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[14.5px]">{r.version}</span>
                    <Pill tone={r.channel === "beta" ? "warn" : "default"}>{r.channel}</Pill>
                  </div>
                  <div className="mt-1 text-[13px] text-muted">{r.notes.join(" · ")}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[14px]">{r.downloads.toLocaleString("pl-PL")}</div>
                  <div className="text-[12px] text-dim">{r.date}</div>
                </div>
              </li>
            ))}
          </ul>
        </Block>
      </div>
    </>
  );
}
