"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentType, type ReactNode, type SVGProps } from "react";
import {
  IconBell,
  IconBox,
  IconCard,
  IconChart,
  IconGrid,
  IconKey,
  IconLogout,
  IconServer,
  IconSliders,
  IconTicket,
  IconUsers,
  IconCog,
} from "../icons";
import { LogoMark } from "../logo";
import { McHead } from "../mc-head";

type NavItem = { label: string; href: string; Icon: ComponentType<SVGProps<SVGSVGElement>>; badge?: string };

const NAV: Record<"client" | "admin", { label: string; items: NavItem[] }[]> = {
  client: [
    {
      label: "Ochrona",
      items: [
        { label: "Przegląd", href: "/panel", Icon: IconGrid },
        { label: "Alerty", href: "/panel/alerty", Icon: IconBell, badge: "12" },
        { label: "Serwery", href: "/panel/serwery", Icon: IconServer },
        { label: "Checki", href: "/panel/checki", Icon: IconSliders },
      ],
    },
    {
      label: "Konto",
      items: [
        { label: "Licencja i pobieranie", href: "/panel/licencja", Icon: IconKey },
        { label: "Płatności", href: "/panel/platnosci", Icon: IconCard },
        { label: "Ustawienia", href: "/panel/ustawienia", Icon: IconCog },
      ],
    },
  ],
  admin: [
    {
      label: "Biznes",
      items: [
        { label: "Przegląd", href: "/admin", Icon: IconChart },
        { label: "Klienci", href: "/admin/klienci", Icon: IconUsers },
        { label: "Licencje", href: "/admin/licencje", Icon: IconKey },
      ],
    },
    {
      label: "Produkt",
      items: [
        { label: "Wydania", href: "/admin/wydania", Icon: IconBox },
        { label: "Zgłoszenia", href: "/admin/zgloszenia", Icon: IconTicket, badge: "2" },
      ],
    },
  ],
};

function Sidebar({ variant, onNavigate }: { variant: "client" | "admin"; onNavigate?: () => void }) {
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
        <McHead name={variant === "admin" ? "AdminFG" : "Kuba_SMP"} className="size-8 rounded-lg" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium">{variant === "admin" ? "Zespół FraudGuard" : "Survival.pl"}</div>
          <div className="truncate text-[12px] text-dim">{variant === "admin" ? "admin@fraudguard.net" : "admin@survival.pl"}</div>
        </div>
        <Link href="/logowanie" className="rounded-md p-1.5 text-dim transition-colors hover:bg-white/[0.05] hover:text-fg" aria-label="Wyloguj">
          <IconLogout className="size-4" />
        </Link>
      </div>
    </div>
  );
}

export function DashShell({ variant, children }: { variant: "client" | "admin"; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-[100svh] lg:pl-[248px]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-line bg-[#0a0b0c] lg:block">
        <Sidebar variant={variant} />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/80 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-fg">
            <LogoMark className="size-4 text-bg" />
          </span>
          <span className="text-[14.5px] font-semibold">FraudGuard</span>
        </Link>
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-muted hover:text-fg" aria-label="Otwórz menu">
          <svg viewBox="0 0 16 16" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
            <path d="M2.5 5h11M2.5 11h11" strokeLinecap="round" />
          </svg>
        </button>
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
              <Sidebar variant={variant} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-6 sm:px-8 sm:pt-8">{children}</main>
    </div>
  );
}
