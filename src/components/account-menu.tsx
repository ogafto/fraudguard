"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { currentAccount } from "@/lib/account-actions";
import { logout } from "@/lib/auth";
import { IconChart, IconCog, IconGrid, IconLogout } from "./icons";
import { McHead } from "./mc-head";
import { EASE } from "./ui";

export type Account = { nick: string; role: "client" | "admin" };

export function useAccount() {
  const [account, setAccount] = useState<Account | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    currentAccount()
      .catch(() => null)
      .then((a) => alive && setAccount(a));
    return () => {
      alive = false;
    };
  }, []);
  return account;
}

export function AccountMenu({ account }: { account: Account }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = [
    { href: "/panel", label: "Mój panel", Icon: IconGrid },
    ...(account.role === "admin" ? [{ href: "/admin", label: "Panel admina", Icon: IconChart }] : []),
    { href: "/panel/ustawienia", label: "Ustawienia konta", Icon: IconCog },
  ];

  return (
    <div ref={ref} className="relative hidden sm:block">
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: EASE }}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`group flex h-9 items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition-colors ${open ? "bg-white/[0.09]" : "bg-white/[0.04] hover:bg-white/[0.08]"} shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(255,255,255,0.08)]`}
      >
        <McHead name={account.nick} className="size-7 rounded-full transition-transform duration-500 ease-out-expo group-hover:rotate-[-8deg]" />
        <span className="max-w-[120px] truncate text-[13.5px] font-medium">{account.nick}</span>
        <motion.svg viewBox="0 0 16 16" className="size-3 text-muted" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3, ease: EASE }} aria-hidden>
          <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.97, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, scale: 0.98, filter: "blur(4px)" }}
            transition={{ duration: 0.25, ease: EASE }}
            style={{ transformOrigin: "100% 0%" }}
            className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-2xl bg-[#0f1012]/95 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(255,255,255,0.08),0_30px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 rounded-xl p-2.5">
              <McHead name={account.nick} className="size-10 rounded-lg" />
              <div className="min-w-0">
                <div className="truncate text-[14px] font-medium">{account.nick}</div>
                <div className="text-[12.5px] text-dim">{account.role === "admin" ? "Administrator" : "Klient"}</div>
              </div>
            </div>
            <div className="my-1 h-px bg-line" />
            {items.map(({ href, label, Icon }, i) => (
              <motion.div key={href} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: EASE, delay: 0.03 + i * 0.03 }}>
                <Link
                  href={href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-2.5 py-2 text-[14px] text-muted transition-colors hover:bg-white/[0.05] hover:text-fg"
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              </motion.div>
            ))}
            <div className="my-1 h-px bg-line" />
            <form action={logout}>
              <button role="menuitem" className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-[14px] text-muted transition-colors hover:bg-danger/[0.08] hover:text-danger">
                <IconLogout className="size-4" />
                Wyloguj się
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
