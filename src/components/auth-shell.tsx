"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Field, SubmitButton } from "./form";
import { IconDiscord } from "./icons";
import { Wordmark } from "./logo";
import { Panel } from "./panel";
import { EASE } from "./ui";

export function AuthShell({ mode }: { mode: "login" | "register" }) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const isLogin = mode === "login";
  const router = useRouter();

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("sending");
    // TODO: podpiąć backend autoryzacji (np. Auth.js / Supabase / własne API).
    setTimeout(() => {
      setState("done");
      setTimeout(() => router.push("/panel"), 900);
    }, 1300);
  };

  return (
    <div className="grid min-h-[100svh] lg:grid-cols-[1fr_1.1fr]">
      {/* Form side */}
      <main className="flex flex-col px-6 py-7 sm:px-12">
        <div className="flex items-center justify-between">
          <Link href="/" className="transition-opacity hover:opacity-75">
            <Wordmark />
          </Link>
          <Link href="/" className="text-[14px] text-muted transition-colors hover:text-fg">
            Wróć na stronę
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center py-16">
          <AnimatePresence mode="wait">
            {state === "done" ? (
              <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                <h1 className="text-fg text-[32px] font-medium tracking-[-0.03em]">
                  {isLogin ? "Zalogowano" : "Konto utworzone"}
                </h1>
                <p className="mt-2 text-[15px] text-muted">
                  {isLogin ? "Przekierowujemy do panelu…" : "Sprawdź skrzynkę i potwierdź adres e-mail."}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <h1 className="text-fg pb-1 text-[34px] font-medium leading-[1.1] tracking-[-0.035em]">
                  {isLogin ? "Zaloguj się do FraudGuard" : "Załóż konto FraudGuard"}
                </h1>
                <p className="mt-2 text-[15px] text-muted">
                  {isLogin ? "Pobierz plugin i zarządzaj licencjami." : "Zajmie Ci to mniej niż minutę."}
                </p>

                <button
                  type="button"
                  className="mt-9 flex h-11 w-full items-center justify-center gap-2.5 rounded-full bg-white/[0.04] text-[14.5px] font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(255,255,255,0.1)] transition-colors hover:bg-white/[0.08]"
                >
                  <IconDiscord className="size-4" />
                  Kontynuuj przez Discord
                </button>

                <div className="my-7 flex items-center gap-4 text-[13px] text-dim">
                  <span className="h-px flex-1 bg-line" />
                  lub
                  <span className="h-px flex-1 bg-line" />
                </div>

                <form onSubmit={submit} className="space-y-4">
                  {!isLogin && <Field label="Nick w Minecraft" name="nick" placeholder="Steve" autoComplete="nickname" />}
                  <Field label="E-mail" name="email" type="email" placeholder="ty@serwer.pl" autoComplete="email" />
                  <Field
                    label="Hasło"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  {isLogin ? (
                    <div className="flex justify-end">
                      <a href="#" className="text-[13.5px] text-muted hover:text-fg">
                        Nie pamiętasz hasła?
                      </a>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer items-start gap-2.5 text-[13.5px] leading-relaxed text-muted">
                      <input type="checkbox" required className="mt-1 size-3.5 accent-white" />
                      Akceptuję regulamin i politykę prywatności.
                    </label>
                  )}
                  <SubmitButton busy={state === "sending"} busyLabel={isLogin ? "Logowanie…" : "Tworzenie konta…"} className="!mt-6 w-full">
                    {isLogin ? "Zaloguj się" : "Załóż konto"}
                  </SubmitButton>
                </form>

                <p className="mt-8 text-center text-[14px] text-muted">
                  {isLogin ? "Nie masz konta? " : "Masz już konto? "}
                  <Link href={isLogin ? "/rejestracja" : "/logowanie"} className="text-fg hover:underline">
                    {isLogin ? "Załóż je" : "Zaloguj się"}
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Product side */}
      <aside className="relative hidden overflow-hidden border-l border-line bg-[#0a0b0c] lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_30%_0%,rgba(255,255,255,0.09),transparent_70%)]" />
        <div className="relative px-14 pt-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
            className="text-fg max-w-[420px] pb-1 text-[30px] font-medium leading-[1.15] tracking-[-0.03em]"
          >
            Wszystkie Twoje serwery w jednym panelu.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.35 }}
          className="absolute left-14 top-56 origin-top-left scale-[0.8] rounded-[18px] bg-white/[0.03] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_0_1px_rgba(255,255,255,0.09),0_40px_100px_-30px_rgba(0,0,0,0.9)]"
        >
          <Panel />
        </motion.div>
      </aside>
    </div>
  );
}
