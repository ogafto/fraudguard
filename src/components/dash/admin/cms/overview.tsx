"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { CONTENT_DOCS, type ContentKey } from "@/lib/content";
import { Arrow, EASE } from "../../../ui";
import { PageHeader } from "../../ui";
import { date } from "../kit";

type Doc = { key: ContentKey; hasDraft: boolean; publishedAt: number | null; updatedAt: number | null; updatedBy: string | null };

export function ContentOverview({ docs }: { docs: Doc[] }) {
  return (
    <>
      <PageHeader title="Treści" desc="Wszystkie teksty strony. Zmieniasz w szkicu, sprawdzasz w podglądzie i publikujesz jednym kliknięciem." />
      <div className="grid gap-3 md:grid-cols-2">
        {docs.map((d, i) => {
          const meta = CONTENT_DOCS[d.key];
          return (
            <motion.div key={d.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: i * 0.05 }}>
              <Link
                href={`/admin/tresci/${d.key}`}
                className="card group flex h-full flex-col p-5 transition-shadow duration-500 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_0_0_1px_rgba(255,255,255,0.16),0_20px_40px_-20px_rgba(0,0,0,0.9)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-[16px] font-medium">{meta.label}</h2>
                  <Arrow className="size-3.5 text-dim transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5 group-hover:text-fg" />
                </div>
                <p className="mt-1.5 flex-1 text-[14px] leading-relaxed text-muted">{meta.desc}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px]">
                  <span className="flex items-center gap-1.5 text-muted">
                    <span className={`size-1.5 rounded-full ${d.publishedAt ? "bg-ok" : "bg-white/30"}`} />
                    {d.publishedAt ? `Opublikowane ${date(d.publishedAt)}` : "Teksty startowe"}
                  </span>
                  {d.hasDraft && (
                    <span className="flex items-center gap-1.5 text-warn">
                      <span className="size-1.5 rounded-full bg-warn" />
                      Szkic czeka na publikację
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
