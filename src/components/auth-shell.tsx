"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { AUTH_DEMO, login, register, requestPasswordReset, resendCode, resetPassword, verifyEmail, type AuthResult } from "@/lib/auth";
import { Field, FormError, OtpInput, PasswordField, SubmitButton } from "./form";
import { IconDiscord } from "./icons";
import { Wordmark } from "./logo";
import { McHead } from "./mc-head";
import { McText } from "./mc-ui";
import { Panel } from "./panel";
import { EASE } from "./ui";

type Step = "register" | "verify" | "verified" | "login" | "reset" | "resetSent" | "newPassword" | "loggedIn";

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function Screen({ id, children }: { id: string; children: ReactNode }) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Title({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <>
      <h1 className="pb-1 text-[30px] font-medium leading-[1.1] tracking-[-0.035em] sm:text-[34px]">{children}</h1>
      {sub && <p className="mt-2 text-[15px] leading-relaxed text-muted">{sub}</p>}
    </>
  );
}

/** Live preview of the player's head while they type their nick. */
function NickHead({ nick }: { nick: string }) {
  const [shown, setShown] = useState(nick);
  useEffect(() => {
    const id = setTimeout(() => setShown(nick.trim()), 450);
    return () => clearTimeout(id);
  }, [nick]);
  const own = shown.toLowerCase() === "aftoxd";
  const valid = /^[A-Za-z0-9_]{3,16}$/.test(shown);
  return (
    <span className="relative block size-6 overflow-hidden rounded-md">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={valid ? shown : "default"}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {valid && !own ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`https://mc-heads.net/avatar/${shown}/48`} alt="" className="size-full [image-rendering:pixelated]" />
          ) : (
            <McHead name={own ? "aftoxd" : "steve"} className="size-full" />
          )}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Steps({ step }: { step: Step }) {
  const at = step === "register" ? 0 : step === "verify" ? 1 : 2;
  const labels = ["Dane konta", "Weryfikacja", "Gotowe"];
  return (
    <div className="mb-10 flex items-center gap-3 text-[12.5px]">
      {labels.map((l, i) => (
        <div key={l} className="flex items-center gap-3">
          <span className={`flex items-center gap-2 transition-colors duration-500 ${i <= at ? "text-fg" : "text-dim"}`}>
            <span className="relative flex size-5 items-center justify-center rounded-full font-mono text-[10.5px] shadow-[0_0_0_1px_rgba(255,255,255,0.14)]">
              {i < at ? (
                <motion.svg viewBox="0 0 16 16" className="size-3" initial={{ scale: 0 }} animate={{ scale: 1 }} aria-hidden>
                  <path d="m4 8.5 2.5 2.5L12 5.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              ) : (
                i + 1
              )}
              {i === at && <motion.span layoutId="step-dot" className="absolute inset-0 rounded-full bg-white/[0.1] shadow-[0_0_0_1px_rgba(255,255,255,0.5)]" />}
            </span>
            <span className="hidden sm:inline">{l}</span>
          </span>
          {i < labels.length - 1 && (
            <span className="relative h-px w-6 overflow-hidden bg-white/[0.1] sm:w-10">
              <motion.span className="absolute inset-0 origin-left bg-fg" initial={false} animate={{ scaleX: i < at ? 1 : 0 }} transition={{ duration: 0.6, ease: EASE }} />
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/** Envelope that drops in and a little paper sliding out, for "check your inbox". */
function MailIcon() {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0, rotate: -8 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 14 }}
      className="relative mb-8 flex size-16 items-center justify-center rounded-2xl bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.1)]"
    >
      <span className="absolute inset-0 animate-ping rounded-2xl bg-white/[0.04] [animation-duration:2.4s]" />
      <svg viewBox="0 0 32 32" className="size-8" fill="none" aria-hidden>
        <motion.rect
          x="9"
          y="5"
          width="14"
          height="12"
          rx="1.5"
          fill="#0b0c0e"
          stroke="currentColor"
          strokeWidth="1.4"
          initial={{ y: 8 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: EASE }}
        />
        <rect x="4" y="11" width="24" height="16" rx="2.5" fill="#0b0c0e" stroke="currentColor" strokeWidth="1.4" />
        <path d="m4.8 12.2 11.2 8 11.2-8" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </motion.div>
  );
}

/** Check mark drawn inside rings that ripple out once. */
function SuccessMark() {
  return (
    <div className="relative mb-8 flex size-16 items-center justify-center">
      {[0, 1].map((k) => (
        <motion.span
          key={k}
          className="absolute inset-0 rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.4)]"
          initial={{ scale: 0.6, opacity: 0.8 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 1.4, ease: EASE, delay: 0.3 + k * 0.25 }}
        />
      ))}
      <motion.span
        className="absolute inset-0 rounded-full bg-fg"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
      />
      <svg viewBox="0 0 24 24" className="relative size-7 text-bg" aria-hidden>
        <motion.path
          d="m6 12.5 4 4 8-9"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.25 }}
        />
      </svg>
    </div>
  );
}

/** Goes to the panel after a short countdown shown as a filling bar. */
function RedirectBar({ to, seconds = 3 }: { to: string; seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setTimeout(() => router.push(to), seconds * 1000);
    return () => clearTimeout(id);
  }, [router, to, seconds]);
  return (
    <div className="mt-8 h-px w-full overflow-hidden bg-white/[0.08]">
      <motion.div className="h-full origin-left bg-fg" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: seconds, ease: "linear" }} />
    </div>
  );
}

function DiscordButton() {
  return (
    <>
      <button
        type="button"
        className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-white/[0.04] text-[14.5px] font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(255,255,255,0.1)] transition-colors hover:bg-white/[0.08]"
      >
        <IconDiscord className="size-4" />
        Kontynuuj przez Discord
      </button>
      <div className="my-7 flex items-center gap-4 text-[13px] text-dim">
        <span className="h-px flex-1 bg-line" />
        lub e-mailem
        <span className="h-px flex-1 bg-line" />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */

/** `newPassword` is the page behind the link in the reset email: /nowe-haslo?token=… */
export function AuthShell({ mode }: { mode: "login" | "register" | "newPassword" }) {
  const [step, setStep] = useState<Step>(mode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nick, setNick] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const go = (s: Step) => {
    setError(null);
    setStep(s);
  };

  const run = async (fn: () => Promise<AuthResult>, next: Step) => {
    setBusy(true);
    setError(null);
    let res: AuthResult;
    try {
      res = await fn();
    } catch {
      res = { ok: false, error: "Brak połączenia z serwerem. Spróbuj ponownie." };
    }
    setBusy(false);
    if (res.ok) go(next);
    else if (res.next === "verify") {
      setCode("");
      setCooldown(30);
      go("verify");
    } else setError(res.error);
    return res.ok;
  };

  const onRegister = (e: FormEvent) => {
    e.preventDefault();
    run(() => register({ nick, email, password }), "verify").then((ok) => ok && setCooldown(30));
  };
  const onVerify = (value = code) => {
    if (value.length < 6 || busy) return;
    run(() => verifyEmail(email, value), "verified").then((ok) => !ok && setCode(""));
  };
  const onResend = async () => {
    if (cooldown > 0) return;
    setCooldown(30);
    const res = await resendCode(email).catch(() => null);
    if (res && !res.ok) setError(res.error);
  };
  const onLogin = (e: FormEvent) => {
    e.preventDefault();
    run(() => login(email, password), "loggedIn");
  };
  const onReset = (e: FormEvent) => {
    e.preventDefault();
    run(() => requestPasswordReset(email), "resetSent");
  };
  const onNewPassword = (e: FormEvent) => {
    e.preventDefault();
    const token = new URLSearchParams(window.location.search).get("token") ?? "";
    run(() => resetPassword(token, password), "loggedIn");
  };

  const signup = step === "register" || step === "verify" || step === "verified";

  return (
    <div className="grid min-h-[100svh] lg:grid-cols-[1fr_1.1fr]">
      <main className="relative flex flex-col px-5 py-6 sm:px-12 sm:py-7">
        <div className="pointer-events-none absolute left-0 top-0 h-[420px] w-full bg-[radial-gradient(ellipse_60%_50%_at_30%_0%,rgba(255,255,255,0.06),transparent_70%)] lg:hidden" />
        <div className="relative flex items-center justify-between">
          <Link href="/" className="transition-opacity hover:opacity-75">
            <Wordmark />
          </Link>
          <Link href="/" className="text-[14px] text-muted transition-colors hover:text-fg">
            Wróć na stronę
          </Link>
        </div>

        <div className="relative mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-14">
          {signup && <Steps step={step} />}

          <AnimatePresence mode="wait" initial={false}>
            {step === "register" && (
              <Screen id="register">
                <Title sub="Zajmie Ci to mniej niż minutę.">Załóż konto FraudGuard</Title>
                <div className="mt-9">
                  <DiscordButton />
                </div>
                <form onSubmit={onRegister} className="space-y-4">
                  <Field
                    label="Nick w Minecraft"
                    name="nick"
                    placeholder="aftoxd"
                    autoComplete="nickname"
                    value={nick}
                    onChange={setNick}
                    adornment={<NickHead nick={nick} />}
                  />
                  <Field label="E-mail" name="email" type="email" placeholder="ty@serwer.pl" autoComplete="email" value={email} onChange={setEmail} />
                  <PasswordField value={password} onChange={setPassword} meter autoComplete="new-password" />
                  <label className="flex cursor-pointer items-start gap-3 pt-1 text-[13.5px] leading-relaxed text-muted">
                    <input type="checkbox" required className="peer sr-only" />
                    <span className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-[5px] shadow-[0_0_0_1px_rgba(255,255,255,0.2)] transition-colors peer-checked:bg-fg peer-checked:[&>svg]:opacity-100 peer-focus-visible:shadow-[0_0_0_1px_rgba(255,255,255,0.5),0_0_0_4px_rgba(255,255,255,0.08)]">
                      <svg viewBox="0 0 16 16" className="size-3 text-bg opacity-0 transition-opacity" aria-hidden>
                        <path d="m4 8.5 2.5 2.5L12 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span>
                      Akceptuję{" "}
                      <Link href="/regulamin" target="_blank" className="text-fg underline-offset-2 hover:underline">
                        regulamin
                      </Link>{" "}
                      i{" "}
                      <Link href="/prywatnosc" target="_blank" className="text-fg underline-offset-2 hover:underline">
                        politykę prywatności
                      </Link>
                      .
                    </span>
                  </label>
                  <FormError>{error}</FormError>
                  <SubmitButton busy={busy} busyLabel="Tworzenie konta…" className="!mt-6 w-full">
                    Załóż konto
                  </SubmitButton>
                </form>
                <p className="mt-8 text-center text-[14px] text-muted">
                  Masz już konto?{" "}
                  <Link href="/logowanie" className="text-fg hover:underline">
                    Zaloguj się
                  </Link>
                </p>
              </Screen>
            )}

            {step === "verify" && (
              <Screen id="verify">
                <MailIcon />
                <Title
                  sub={
                    <>
                      Wysłaliśmy sześciocyfrowy kod na <span className="text-fg">{email}</span>. Wpisz go poniżej albo kliknij link w wiadomości.
                    </>
                  }
                >
                  Sprawdź skrzynkę
                </Title>
                <form
                  className="mt-9"
                  onSubmit={(e) => {
                    e.preventDefault();
                    onVerify();
                  }}
                >
                  <OtpInput
                    value={code}
                    error={!!error}
                    disabled={busy}
                    onChange={(v) => {
                      setCode(v);
                      setError(null);
                      if (v.length === 6) onVerify(v);
                    }}
                  />
                  <FormError>{error}</FormError>
                  <SubmitButton busy={busy} busyLabel="Sprawdzanie…" disabled={code.length < 6} className="mt-6 w-full">
                    Potwierdź adres
                  </SubmitButton>
                </form>
                {AUTH_DEMO && <p className="mt-4 text-center text-[12.5px] text-dim">Wersja demo: zadziała dowolny kod z 6 cyfr.</p>}
                <div className="mt-8 flex items-center justify-between text-[14px]">
                  <button type="button" onClick={() => go("register")} className="text-muted transition-colors hover:text-fg">
                    Zmień adres e-mail
                  </button>
                  <button
                    type="button"
                    onClick={onResend}
                    disabled={cooldown > 0}
                    className="tabular-nums text-fg transition-opacity disabled:text-dim"
                  >
                    {cooldown > 0 ? `Wyślij ponownie za ${cooldown} s` : "Wyślij kod ponownie"}
                  </button>
                </div>
              </Screen>
            )}

            {step === "verified" && (
              <Screen id="verified">
                <SuccessMark />
                <Title sub="Adres e-mail potwierdzony. Przenosimy Cię do panelu, gdzie kupisz licencję i pobierzesz plugin.">
                  Witaj na pokładzie{nick ? `, ${nick}` : ""}!
                </Title>
                <div className="mt-7 bg-black/50 px-2.5 py-1.5 text-[13px]">
                  <McText>{`§8[§fFG§8] §a${nick || "Gracz"} §7zweryfikował konto`}</McText>
                </div>
                <RedirectBar to="/panel" />
              </Screen>
            )}

            {step === "login" && (
              <Screen id="login">
                <Title sub="Pobierz plugin i zarządzaj licencjami.">Zaloguj się do FraudGuard</Title>
                <div className="mt-9">
                  <DiscordButton />
                </div>
                <form onSubmit={onLogin} className="space-y-4">
                  <Field label="E-mail" name="email" type="email" placeholder="ty@serwer.pl" autoComplete="email" value={email} onChange={setEmail} />
                  <PasswordField value={password} onChange={setPassword} autoComplete="current-password" />
                  <div className="flex justify-end">
                    <button type="button" onClick={() => go("reset")} className="text-[13.5px] text-muted transition-colors hover:text-fg">
                      Nie pamiętasz hasła?
                    </button>
                  </div>
                  <FormError>{error}</FormError>
                  <SubmitButton busy={busy} busyLabel="Logowanie…" className="!mt-5 w-full">
                    Zaloguj się
                  </SubmitButton>
                </form>
                <p className="mt-8 text-center text-[14px] text-muted">
                  Nie masz konta?{" "}
                  <Link href="/rejestracja" className="text-fg hover:underline">
                    Załóż je
                  </Link>
                </p>
              </Screen>
            )}

            {step === "reset" && (
              <Screen id="reset">
                <Title sub="Podaj adres e-mail konta, a wyślemy Ci link do ustawienia nowego hasła.">Nowe hasło</Title>
                <form onSubmit={onReset} className="mt-9 space-y-4">
                  <Field label="E-mail" name="email" type="email" placeholder="ty@serwer.pl" autoComplete="email" value={email} onChange={setEmail} />
                  <FormError>{error}</FormError>
                  <SubmitButton busy={busy} busyLabel="Wysyłanie…" className="!mt-6 w-full">
                    Wyślij link
                  </SubmitButton>
                </form>
                <button type="button" onClick={() => go("login")} className="mx-auto mt-8 block text-[14px] text-muted transition-colors hover:text-fg">
                  Wróć do logowania
                </button>
              </Screen>
            )}

            {step === "resetSent" && (
              <Screen id="resetSent">
                <MailIcon />
                <Title
                  sub={
                    <>
                      Jeśli konto <span className="text-fg">{email}</span> istnieje, za chwilę dostaniesz wiadomość z linkiem do zmiany hasła.
                    </>
                  }
                >
                  Link wysłany
                </Title>
                <button type="button" onClick={() => go("login")} className="mt-9 text-[14px] text-fg hover:underline">
                  Wróć do logowania
                </button>
              </Screen>
            )}

            {step === "newPassword" && (
              <Screen id="newPassword">
                <Title sub="Wpisz nowe hasło do konta FraudGuard. Po zapisaniu od razu Cię zalogujemy.">Ustaw nowe hasło</Title>
                <form onSubmit={onNewPassword} className="mt-9 space-y-4">
                  <PasswordField value={password} onChange={setPassword} meter autoComplete="new-password" />
                  <FormError>{error}</FormError>
                  <SubmitButton busy={busy} busyLabel="Zapisywanie…" className="!mt-6 w-full">
                    Zapisz hasło
                  </SubmitButton>
                </form>
                <button type="button" onClick={() => go("reset")} className="mx-auto mt-8 block text-[14px] text-muted transition-colors hover:text-fg">
                  Wyślij nowy link
                </button>
              </Screen>
            )}

            {step === "loggedIn" && (
              <Screen id="loggedIn">
                <SuccessMark />
                <Title sub="Przenosimy Cię do panelu.">Zalogowano</Title>
                <RedirectBar to="/panel" seconds={1.6} />
              </Screen>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Product side */}
      <aside className="relative hidden overflow-hidden border-l border-line bg-[#0a0b0c] lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_30%_0%,rgba(255,255,255,0.09),transparent_70%)]" />
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_70%_60%_at_30%_0%,#000,transparent)]" />
        <div className="relative px-14 pt-20">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={signup ? "signup" : "login"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="max-w-[440px] pb-1 text-[30px] font-medium leading-[1.15] tracking-[-0.03em]"
            >
              {signup ? "Minuta rejestracji. Spokój na serwerze na długo." : "Wszystkie Twoje serwery w jednym panelu."}
            </motion.p>
          </AnimatePresence>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 60, rotate: 2 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
          className="absolute left-14 top-56 origin-top-left scale-[0.8] rounded-[18px] bg-white/[0.03] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_0_1px_rgba(255,255,255,0.09),0_40px_100px_-30px_rgba(0,0,0,0.9)]"
        >
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px overflow-hidden">
            <div className="h-px w-1/3 animate-beam bg-gradient-to-r from-transparent via-white to-transparent" />
          </div>
          <Panel />
        </motion.div>
      </aside>
    </div>
  );
}
