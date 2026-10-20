"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { verifyToken } from "@/lib/auth";
import { Wordmark } from "./logo";
import { Button, EASE } from "./ui";

export function VerifyLinkView() {
  const [state, setState] = useState<"checking" | "ok" | "error">("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token") ?? "";
    let alive = true;
    verifyToken(token).then((res) => {
      if (!alive) return;
      if (res.ok) setState("ok");
      else {
        setError(res.error);
        setState("error");
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="relative flex min-h-[100svh] flex-col overflow-hidden px-5">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[1200px] -translate-x-1/2 bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)]" />
      <header className="relative mx-auto flex h-16 w-full max-w-[1200px] items-center">
        <Link href="/" className="transition-opacity hover:opacity-75">
          <Wordmark />
        </Link>
      </header>
      <main className="relative flex flex-1 flex-col items-center justify-center pb-24 text-center">
        <div className="relative mb-10 flex size-20 items-center justify-center">
          <AnimatePresence mode="wait">
            {state === "checking" ? (
              <motion.span
                key="spin"
                exit={{ scale: 0.6, opacity: 0 }}
                className="absolute inset-0 animate-spin rounded-full border-2 border-white/10 border-t-fg [animation-duration:0.9s]"
              />
            ) : (
              <motion.span
                key="done"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 16 }}
                className={`absolute inset-0 rounded-full ${state === "ok" ? "bg-fg" : "bg-danger/15 shadow-[0_0_0_1px_rgba(239,90,90,0.5)]"}`}
              />
            )}
          </AnimatePresence>
          {state !== "checking" && (
            <svg viewBox="0 0 24 24" className={`relative size-8 ${state === "ok" ? "text-bg" : "text-danger"}`} aria-hidden>
              <motion.path
                d={state === "ok" ? "m6 12.5 4 4 8-9" : "M7 7l10 10M17 7 7 17"}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
              />
            </svg>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="flex flex-col items-center"
          >
            <h1 className="text-[clamp(30px,4vw,46px)] font-medium leading-[1.08] tracking-[-0.04em]">
              {state === "checking" ? "Sprawdzamy link…" : state === "ok" ? "Konto zweryfikowane" : "Nie udało się"}
            </h1>
            <p className="mt-4 max-w-[400px] text-[16px] leading-relaxed text-muted">
              {state === "checking"
                ? "To potrwa tylko chwilę."
                : state === "ok"
                  ? "Adres e-mail potwierdzony. Możesz zalogować się do panelu i kupić licencję."
                  : `${error} Zaloguj się, a wyślemy nowy kod.`}
            </p>
            {state !== "checking" && (
              <div className="mt-10">
                <Button href={state === "ok" ? "/panel" : "/logowanie"} arrow>
                  {state === "ok" ? "Przejdź do panelu" : "Zaloguj się"}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
