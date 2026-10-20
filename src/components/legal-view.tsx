"use client";

import { useLenis } from "lenis/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { PRIVACY, TERMS, type LegalDoc } from "@/lib/legal";
import { useContent } from "./content-context";
import { Footer } from "./footer";
import { IconDiscord } from "./icons";
import { Nav } from "./nav";
import { useSite } from "./site-context";
import { EASE, Eyebrow, FadeIn, SplitReveal } from "./ui";

/** Section of the current document that is under the top third of the screen. */
function useActiveSection(doc: LegalDoc) {
  const [active, setActive] = useState(doc.sections[0].id);
  useEffect(() => {
    const els = doc.sections.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [doc]);
  return active;
}

function Toc({ doc }: { doc: LegalDoc }) {
  const lenis = useLenis();
  const active = useActiveSection(doc);
  return (
    <nav className="sticky top-28 hidden lg:block" aria-label="Spis treści">
      <div className="mb-4 text-[12.5px] text-dim">Na tej stronie</div>
      <ul className="relative space-y-0.5">
        <span className="absolute inset-y-0 left-0 w-px bg-white/[0.08]" />
        {doc.sections.map((s, i) => (
          <li key={s.id} className="relative">
            {active === s.id && (
              <motion.span layoutId="toc-active" className="absolute inset-y-1 left-0 w-px bg-fg" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
            )}
            <a
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                lenis?.scrollTo(`#${s.id}`, { offset: -110, duration: 1.2 });
              }}
              className={`flex gap-3 py-1.5 pl-4 text-[14px] transition-colors duration-300 ${active === s.id ? "text-fg" : "text-dim hover:text-muted"}`}
            >
              <span className="w-5 font-mono text-[12px] leading-[21px] text-dim">{i + 1}</span>
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Body({ doc }: { doc: LegalDoc }) {
  return (
    <div className="space-y-4">
      {doc.sections.map((s, i) => (
        <FadeIn key={s.id} delay={i < 3 ? 0.1 + i * 0.06 : 0}>
          <section
            id={s.id}
            className="scroll-mt-28 rounded-2xl bg-white/[0.02] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_0_1px_rgba(255,255,255,0.07)] transition-colors duration-500 hover:bg-white/[0.03] sm:p-8"
          >
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-[13px] text-dim">§ {i + 1}</span>
              <h2 className="text-[20px] font-medium tracking-[-0.02em] sm:text-[22px]">{s.title}</h2>
            </div>
            <div className="mt-4 space-y-3 text-[15.5px] leading-relaxed text-muted sm:pl-[calc(2ch+1.5rem)]">
              {s.body.map((b, k) =>
                Array.isArray(b) ? (
                  <ul key={k} className="space-y-2">
                    {b.map((li) => (
                      <li key={li} className="flex gap-3">
                        <span className="mt-[0.65em] size-1 shrink-0 rounded-full bg-white/40" />
                        <span>{li}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p key={k}>{b}</p>
                ),
              )}
            </div>
          </section>
        </FadeIn>
      ))}
    </div>
  );
}

export function LegalView({ initial }: { initial: LegalDoc["key"] }) {
  const [key, setKey] = useState(initial);
  // Texts come from the CMS; the key, label and address stay fixed.
  const terms = useContent("terms");
  const privacy = useContent("privacy");
  const LEGAL_DOCS: LegalDoc[] = [
    { ...TERMS, ...terms },
    { ...PRIVACY, ...privacy },
  ];
  const doc = LEGAL_DOCS.find((d) => d.key === key)!;
  const lenis = useLenis();
  const { discordUrl } = useSite();

  useEffect(() => {
    document.title = `${doc.title} | FraudGuard`;
  }, [doc]);

  const pick = (d: LegalDoc) => {
    if (d.key === key) return;
    setKey(d.key);
    // Keep the address in sync without a page load, so the link can be shared.
    window.history.replaceState(null, "", d.href);
    if (window.scrollY > 300) lenis?.scrollTo(0, { duration: 1 });
  };

  return (
    <>
      <Nav />
      <main className="relative px-4 sm:px-6">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[1200px] -translate-x-1/2 bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(255,255,255,0.09),transparent_70%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:80px_80px] [mask-image:radial-gradient(ellipse_55%_60%_at_50%_0%,#000,transparent)]" />

        <header className="relative mx-auto flex max-w-[1200px] flex-col items-center pb-14 pt-36 text-center sm:pt-44">
          <FadeIn>
            <Eyebrow>Dokumenty</Eyebrow>
          </FadeIn>
          <div className="mt-6 grid">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={doc.key}
                className="[grid-area:1/1]"
                exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <SplitReveal
                  as="h1"
                  play
                  segments={[doc.title]}
                  className="text-[clamp(40px,6vw,76px)] font-medium leading-[1] tracking-[-0.045em]"
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={doc.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="mt-5 max-w-[460px] text-[16.5px] leading-relaxed text-muted"
            >
              {doc.lead}
            </motion.p>
          </AnimatePresence>

          <FadeIn delay={0.2} className="mt-9">
            <div role="tablist" className="flex w-max rounded-full bg-white/[0.03] p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
              {LEGAL_DOCS.map((d) => (
                <button
                  key={d.key}
                  role="tab"
                  aria-selected={d.key === key}
                  onClick={() => pick(d)}
                  className={`relative h-10 rounded-full px-5 text-[14px] transition-colors duration-300 ${d.key === key ? "text-bg" : "text-muted hover:text-fg"}`}
                >
                  {d.key === key && (
                    <motion.span layoutId="legal-tab" className="absolute inset-0 rounded-full bg-fg" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                  )}
                  <span className="relative">{d.label}</span>
                </button>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.3} className="mt-5 text-[13px] text-dim">
            Ostatnia aktualizacja: {doc.updated}
          </FadeIn>
        </header>

        <div className="relative mx-auto grid max-w-[1100px] gap-12 pb-28 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={doc.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="h-full">
                <Toc doc={doc} />
              </motion.div>
            </AnimatePresence>
          </aside>

          <div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={doc.key}
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
                exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <Body doc={doc} />
              </motion.div>
            </AnimatePresence>

            <FadeIn className="mt-4">
              <a
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-4 rounded-2xl bg-white/[0.02] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.07)] transition-colors duration-500 hover:bg-white/[0.04] sm:p-8"
              >
                <span>
                  <span className="block text-[17px] font-medium">Masz pytanie do dokumentów?</span>
                  <span className="mt-1 block text-[14.5px] text-muted">Napisz do nas na Discordzie, odpowiadamy zwykle w kilka godzin.</span>
                </span>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/[0.06] transition-transform duration-500 ease-out-expo group-hover:rotate-[-8deg] group-hover:scale-110">
                  <IconDiscord className="size-5" />
                </span>
              </a>
            </FadeIn>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
