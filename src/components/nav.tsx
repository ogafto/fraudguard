"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useLenis } from "lenis/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ComponentType, type SVGProps } from "react";
import { IconBell, IconChart, IconDiscord, IconGrid, IconSliders } from "./icons";
import { LogoMark } from "./logo";

export const NAV_LINKS = [
  { label: "Funkcje", href: "#features" },
  { label: "Wykrywanie", href: "#detection" },
  { label: "Cennik", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const PRODUCT: { title: string; desc: string; href: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { title: "Alerty w grze", desc: "Flagi na czacie w czasie rzeczywistym", href: "#feature-0", Icon: IconBell },
  { title: "Komendy i GUI", desc: "Cała historia gracza pod ręką", href: "#feature-1", Icon: IconGrid },
  { title: "Alerty na Discordzie", desc: "Każda akcja na kanale administracji", href: "#feature-3", Icon: IconDiscord },
  { title: "Konfiguracja na żywo", desc: "Strój checki bez restartu serwera", href: "#feature-4", Icon: IconSliders },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export function useScrollTo() {
  const lenis = useLenis();
  const pathname = usePathname();
  const router = useRouter();
  return (href: string) => {
    if (pathname !== "/") return router.push(href === "#top" ? "/" : `/${href}`);
    if (href === "#top") return lenis?.scrollTo(0, { duration: 1.6 });
    lenis?.scrollTo(href, { offset: -90, duration: 1.6 });
  };
}

function MegaMenu({ onPick }: { onPick: (href: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.97, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -6, scale: 0.98, filter: "blur(6px)" }}
      transition={{ duration: 0.35, ease: EASE }}
      style={{ transformOrigin: "50% 0%" }}
      className="absolute left-1/2 top-full z-10 mt-3 w-[640px] -translate-x-1/2 rounded-3xl bg-[#0f1012]/90 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(255,255,255,0.08),0_30px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
    >
      <div className="grid grid-cols-[1.25fr_1fr] gap-2">
        <ul className="grid gap-1 p-1">
          {PRODUCT.map(({ title, desc, href, Icon }, i) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.04 + i * 0.04 }}
            >
              <a
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  onPick(href);
                }}
                className="group flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-white/[0.05]"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(255,255,255,0.06)] transition-colors group-hover:bg-fg group-hover:text-bg">
                  <Icon className="size-4" />
                </span>
                <span>
                  <span className="block text-[14px] font-medium">{title}</span>
                  <span className="block text-[13px] text-dim">{desc}</span>
                </span>
              </a>
            </motion.li>
          ))}
        </ul>
        <motion.a
          href="/panel"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: EASE, delay: 0.1 }}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white/[0.03] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] px-2 py-0.5 text-[11.5px] font-medium">
              <IconChart className="size-3" />
              Panel webowy
            </span>
            <div className="mt-3 text-[16px] font-medium leading-snug">Wszystkie serwery i licencje w jednym miejscu.</div>
          </div>
          <svg viewBox="0 0 200 60" className="relative mt-4 h-14 w-full" preserveAspectRatio="none">
            <motion.path
              d="M0,48 C30,44 40,30 70,32 S110,12 140,20 S180,8 200,4"
              fill="none"
              stroke="#f7f8f8"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
            />
          </svg>
          <span className="relative mt-3 text-[13px] text-muted transition-colors group-hover:text-fg">Otwórz panel →</span>
        </motion.a>
      </div>
    </motion.div>
  );
}

export function Nav() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollTo = useScrollTo();
  const router = useRouter();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 30);
    if (Math.abs(y - prev) > 6) setMenu(false);
    if (open) return;
    if (y > 400 && y > prev + 4) setHidden(true);
    else if (y < prev - 4) setHidden(false);
  });

  const go = (href: string) => {
    setOpen(false);
    setMenu(false);
    if (href.startsWith("/")) return router.push(href);
    scrollTo(href);
  };

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: hidden ? -100 : 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      onMouseLeave={() => {
        setHover(null);
        setMenu(false);
      }}
    >
      <div className="relative w-full max-w-[920px]">
        <motion.nav
          animate={{ paddingTop: scrolled ? 6 : 8, paddingBottom: scrolled ? 6 : 8 }}
          className={`flex items-center justify-between rounded-full pl-4 pr-2 transition-[background-color,box-shadow] duration-500 ${
            scrolled || menu || open
              ? "bg-[#0f1012]/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(255,255,255,0.08),0_16px_50px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl"
              : "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-md"
          }`}
        >
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              go("#top");
            }}
            className="group flex items-center gap-2.5"
          >
            <motion.span whileHover={{ rotate: -12, scale: 1.08 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
              <LogoMark className="size-[22px] text-fg" />
            </motion.span>
            <span className="text-[15.5px] font-semibold tracking-[-0.02em]">FraudGuard</span>
          </a>

          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center md:flex">
            {[{ label: "Produkt", href: "#features", menu: true }, ...NAV_LINKS.slice(1)].map((l) => (
              <li key={l.label} onMouseEnter={() => setHover(l.label)}>
                <a
                  href={l.href}
                  onMouseEnter={() => setMenu(!!("menu" in l && l.menu))}
                  onClick={(e) => {
                    e.preventDefault();
                    go(l.href);
                  }}
                  className={`relative flex items-center gap-1 rounded-full px-4 py-2 text-[14px] transition-colors duration-200 ${hover === l.label ? "text-fg" : "text-muted"}`}
                >
                  {hover === l.label && (
                    <motion.span
                      layoutId="nav-hover"
                      className="absolute inset-0 rounded-full bg-white/[0.07]"
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                  <span className="relative">{l.label}</span>
                  {"menu" in l && l.menu && (
                    <motion.svg
                      viewBox="0 0 16 16"
                      className="relative size-3"
                      animate={{ rotate: menu ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      aria-hidden
                    >
                      <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  )}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5" onMouseEnter={() => setMenu(false)}>
            <Link href="/logowanie" className="hidden rounded-full px-3.5 py-2 text-[14px] text-muted transition-colors hover:text-fg sm:block">
              Zaloguj się
            </Link>
            <Link
              href="/rejestracja"
              className="group hidden h-9 items-center gap-1.5 overflow-hidden rounded-full bg-fg px-4 text-[13.5px] font-medium text-bg transition-colors hover:bg-[#e4e5e7] sm:inline-flex"
            >
              <span className="relative inline-flex h-[1.25em] flex-col overflow-hidden leading-[1.25em]">
                <span className="transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">Załóż konto</span>
                <span className="absolute top-full transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">Załóż konto</span>
              </span>
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              className="relative flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/[0.06] md:hidden"
              aria-label="Menu"
              aria-expanded={open}
            >
              <motion.span className="absolute h-[1.5px] w-[18px] rounded-full bg-fg" animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }} transition={{ duration: 0.35, ease: EASE }} />
              <motion.span className="absolute h-[1.5px] w-[18px] rounded-full bg-fg" animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }} transition={{ duration: 0.35, ease: EASE }} />
            </button>
          </div>
        </motion.nav>

        <AnimatePresence>{menu && <MegaMenu onPick={go} />}</AnimatePresence>

        {/* Mobile sheet grows out of the pill */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mt-2 overflow-hidden rounded-3xl bg-[#0f1012]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-2xl md:hidden"
            >
              <ul className="p-2">
                {NAV_LINKS.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, ease: EASE, delay: 0.08 + i * 0.05 }}
                  >
                    <a
                      href={l.href}
                      onClick={(e) => {
                        e.preventDefault();
                        go(l.href);
                      }}
                      className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-[20px] font-medium tracking-tight transition-colors active:bg-white/[0.05]"
                    >
                      {l.label}
                      <span className="text-[14px] text-dim">0{i + 1}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 gap-2 border-t border-line p-3"
              >
                <Link href="/logowanie" onClick={() => setOpen(false)} className="flex h-11 items-center justify-center rounded-full bg-white/[0.06] text-[14px]">
                  Zaloguj się
                </Link>
                <Link href="/rejestracja" onClick={() => setOpen(false)} className="flex h-11 items-center justify-center rounded-full bg-fg text-[14px] font-medium text-bg">
                  Załóż konto
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
