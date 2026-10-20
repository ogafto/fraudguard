"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode, type SVGProps } from "react";
import {
  IconBox,
  IconCard,
  IconChart,
  IconGrid,
  IconKey,
  IconLogout,
  IconLogs,
  IconServer,
  IconSliders,
  IconUsers,
  IconCog,
  IconSearch,
} from "../icons";
import { logout } from "@/lib/auth";
import { LogoMark } from "../logo";
import { McHead } from "../mc-head";

type NavItem = { label: string; href: string; Icon: ComponentType<SVGProps<SVGSVGElement>>; badge?: string };

export type DashUser = { nick: string; email: string; role: "client" | "admin"; plan: string | null };

const NAV: Record<"client" | "admin", { label: string; items: NavItem[] }[]> = {
  client: [
    {
      label: "Anticheat",
      items: [
        { label: "Przegląd", href: "/panel", Icon: IconGrid },
        { label: "Ustawienia anticheata", href: "/panel/checki", Icon: IconSliders },
        { label: "Serwery", href: "/panel/serwery", Icon: IconServer },
      ],
    },
    {
      label: "Konto",
      items: [
        { label: "Pakiet i pobieranie", href: "/panel/licencja", Icon: IconKey },
        { label: "Zakupy", href: "/panel/platnosci", Icon: IconCard },
        { label: "Ustawienia konta", href: "/panel/ustawienia", Icon: IconCog },
      ],
    },
  ],
  admin: [
    {
      label: "Biznes",
      items: [
        { label: "Przegląd", href: "/admin", Icon: IconChart },
        { label: "Klienci", href: "/admin/klienci", Icon: IconUsers },
        { label: "Zakupy", href: "/admin/zakupy", Icon: IconCard },
        { label: "Licencje", href: "/admin/licencje", Icon: IconKey },
      ],
    },
    {
      label: "Strona",
      items: [{ label: "Treści", href: "/admin/tresci", Icon: IconLogs }],
    },
    {
      label: "Produkt",
      items: [
        { label: "Wydania", href: "/admin/wydania", Icon: IconBox },
      ],
    },
    {
      label: "System",
      items: [{ label: "Integracje", href: "/admin/integracje", Icon: IconCog }],
    },
  ],
};

function Sidebar({ variant, user, onNavigate }: { variant: "client" | "admin"; user: DashUser; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/panel" || href === "/admin" ? pathname === href : pathname.startsWith(href));

  return (
    <div className="flex h-full flex-col p-3">
      <Link href="/" className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]">
        <span className="flex size-7 items-center justify-center rounded-lg bg-fg">
          <LogoMark className="size-4 text-bg" />
        </span>
        <span className="text-[14.5px] font-semibold tracking-[-0.01em]">FraudGuard</span>
        <span className="ml-auto rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-medium text-muted">
          {variant === "admin" ? "Admin" : "Panel"}
        </span>
      </Link>

      <nav className="mt-5 flex-1 space-y-6 overflow-y-auto">
        {NAV[variant].map((group) => (
          <div key={group.label}>
            <div className="px-2.5 pb-1.5 text-[11.5px] font-medium text-dim">{group.label}</div>
            <ul className="space-y-0.5">
              {group.items.map(({ label, href, Icon, badge }) => {
                const on = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      className={`relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] transition-colors ${on ? "text-fg" : "text-muted hover:text-fg"}`}
                    >
                      {on && (
                        <motion.span
                          layoutId={`dash-nav-${variant}`}
                          className="absolute inset-0 rounded-lg bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                          transition={{ type: "spring", stiffness: 500, damping: 38 }}
                        />
                      )}
                      <Icon className="relative size-4" />
                      <span className="relative">{label}</span>
                      {badge && (
                        <span className="relative ml-auto rounded-full bg-white/[0.08] px-1.5 text-[11px] font-medium text-fg">{badge}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-4 flex items-center gap-3 rounded-xl p-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <McHead name={user.nick} className="size-8 rounded-lg" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium">{user.nick}</div>
          <div className="truncate text-[12px] text-dim">{variant === "admin" ? "Administrator" : user.plan ? `Pakiet ${user.plan}` : "Brak pakietu"}</div>
        </div>
        <form action={logout}>
          <button type="submit" className="rounded-md p-1.5 text-dim transition-colors hover:bg-white/[0.05] hover:text-fg" aria-label="Wyloguj">
            <IconLogout className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

const isActivePath = (pathname: string, href: string) => (href === "/panel" || href === "/admin" ? pathname === href : pathname.startsWith(href));

const LOGOUT = "#wyloguj";

function Palette({ variant, isAdmin, onClose }: { variant: "client" | "admin"; isAdmin: boolean; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const all = useMemo(
    () => [
      ...NAV[variant].flatMap((g) => g.items.map((it) => ({ ...it, group: g.label }))),
      ...(variant === "admin" || isAdmin ? [{ label: variant === "admin" ? "Panel klienta" : "Panel admina", href: variant === "admin" ? "/panel" : "/admin", Icon: IconGrid, group: "Przejdź" }] : []),
      { label: "Strona główna", href: "/", Icon: IconBox, group: "Przejdź" },
      { label: "Wyloguj", href: LOGOUT, Icon: IconLogout, group: "Konto" },
    ],
    [variant, isAdmin],
  );
  const list = all.filter((it) => it.label.toLowerCase().includes(q.trim().toLowerCase()));
  const cur = Math.min(sel, Math.max(0, list.length - 1));

  useEffect(() => input.current?.focus(), []);

  const open = (href: string) => {
    onClose();
    if (href === LOGOUT) logout();
    else router.push(href);
  };

  return (
    <>
      <motion.div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        role="dialog"
        aria-label="Szukaj w panelu"
        className="fixed inset-x-4 top-[12vh] z-[61] mx-auto max-w-[560px] overflow-hidden rounded-2xl bg-[#111214]/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.1),0_40px_100px_-20px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
        initial={{ opacity: 0, y: -16, scale: 0.97, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -8, scale: 0.98, filter: "blur(6px)" }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <IconSearch className="size-4 text-dim" />
          <input
            ref={input}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSel((v) => Math.min(list.length - 1, v + 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setSel((v) => Math.max(0, v - 1));
              }
              if (e.key === "Enter" && list[cur]) open(list[cur].href);
              if (e.key === "Escape") onClose();
            }}
            placeholder="Szukaj strony lub akcji…"
            className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-dim"
          />
          <kbd className="rounded-md px-1.5 py-0.5 font-mono text-[11px] text-dim shadow-[0_0_0_1px_rgba(255,255,255,0.1)]">esc</kbd>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {list.length === 0 && <li className="px-3 py-8 text-center text-[14px] text-dim">Nic nie znaleziono.</li>}
          {list.map((it, i) => (
            <li key={it.href + it.label}>
              <button
                onMouseEnter={() => setSel(i)}
                onClick={() => open(it.href)}
                className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] transition-colors ${i === cur ? "text-fg" : "text-muted"}`}
              >
                {i === cur && (
                  <motion.span layoutId="palette-sel" className="absolute inset-0 rounded-xl bg-white/[0.06]" transition={{ type: "spring", stiffness: 600, damping: 40 }} />
                )}
                <it.Icon className="relative size-4" />
                <span className="relative flex-1">{it.label}</span>
                <span className="relative text-[12px] text-dim">{it.group}</span>
              </button>
            </li>
          ))}
        </ul>
      </motion.div>
    </>
  );
}

function TopBar({ variant, user, onSearch }: { variant: "client" | "admin"; user: DashUser; onSearch: () => void }) {
  const pathname = usePathname();
  const current = NAV[variant].flatMap((g) => g.items).find((it) => isActivePath(pathname, it.href));
  return (
    <div className="sticky top-0 z-20 hidden h-14 items-center gap-4 border-b border-line bg-bg/70 px-8 backdrop-blur-xl lg:flex">
      <nav className="flex items-center gap-2 text-[13.5px]" aria-label="Okruszki">
        <span className="text-dim">{variant === "admin" ? "Admin" : "Panel"}</span>
        <span className="text-dim">/</span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={current?.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-fg"
          >
            {current?.label}
          </motion.span>
        </AnimatePresence>
      </nav>
      <div className="ml-auto flex items-center gap-2">
        {variant === "client" ? (
          <Link
            href="/panel/licencja"
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[12.5px] text-muted shadow-[0_0_0_1px_rgba(255,255,255,0.07)] transition-colors hover:text-fg"
          >
            <span className={`size-1.5 rounded-full ${user.plan ? "animate-pulse-dot bg-ok text-ok/50" : "bg-dim"}`} />
            {user.plan ? `Pakiet ${user.plan} aktywny` : "Brak pakietu"}
          </Link>
        ) : (
          user.role === "admin" && (
            <Link href="/panel" className="rounded-full px-3 py-1.5 text-[12.5px] text-muted shadow-[0_0_0_1px_rgba(255,255,255,0.07)] transition-colors hover:text-fg">
              Mój panel klienta
            </Link>
          )
        )}
        <button
          onClick={onSearch}
          className="flex h-9 w-56 items-center gap-2.5 rounded-full bg-white/[0.03] px-3.5 text-[13px] text-dim shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-colors hover:bg-white/[0.05] hover:text-muted"
        >
          <IconSearch className="size-3.5" />
          Szukaj…
          <kbd className="ml-auto font-mono text-[11px]">⌘K</kbd>
        </button>
      </div>
    </div>
  );
}

export function DashShell({ variant, user, children }: { variant: "client" | "admin"; user: DashUser; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-[100svh] lg:pl-[248px]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-line bg-[#0a0b0c] lg:block">
        <Sidebar variant={variant} user={user} />
      </aside>

      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/80 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-fg">
            <LogoMark className="size-4 text-bg" />
          </span>
          <span className="text-[14.5px] font-semibold">FraudGuard</span>
        </Link>
        <div className="flex items-center gap-1">
        <button onClick={() => setPalette(true)} className="rounded-lg p-2 text-muted hover:text-fg" aria-label="Szukaj">
          <IconSearch className="size-[18px]" />
        </button>
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-muted hover:text-fg" aria-label="Otwórz menu">
          <svg viewBox="0 0 16 16" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
            <path d="M2.5 5h11M2.5 11h11" strokeLinecap="round" />
          </svg>
        </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[272px] border-r border-line bg-[#0a0b0c] lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <Sidebar variant={variant} user={user} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <TopBar variant={variant} user={user} onSearch={() => setPalette(true)} />
      <AnimatePresence>{palette && <Palette variant={variant} isAdmin={user.role === "admin"} onClose={() => setPalette(false)} />}</AnimatePresence>

      <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-6 sm:px-8 sm:pt-8">{children}</main>
    </div>
  );
}
