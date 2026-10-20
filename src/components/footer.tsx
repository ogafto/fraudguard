"use client";

import Link from "next/link";
import { Wordmark } from "./logo";
import { useContent } from "./content-context";
import { useSite } from "./site-context";
import { NAV_LINKS, useScrollTo } from "./nav";
import { Arrow } from "./ui";

export function Footer() {
  const scrollTo = useScrollTo();
  const { discordUrl } = useSite();
  const { tagline } = useContent("home").footer;
  const cols = [
    { h: "Produkt", items: [NAV_LINKS[0], NAV_LINKS[1]] },
    { h: "Wsparcie", items: [NAV_LINKS[2], { label: "Discord", href: discordUrl }] },
    {
      h: "Konto",
      items: [
        { label: "Zaloguj się", href: "/logowanie" },
        { label: "Załóż konto", href: "/rejestracja" },
        { label: "Regulamin", href: "/regulamin" },
        { label: "Prywatność", href: "/prywatnosc" },
      ],
    },
  ];

  return (
    <footer className="border-t border-line px-4 sm:px-6">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-x-6 gap-y-10 py-16 sm:grid-cols-3 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:gap-12">
        <div className="col-span-2 sm:col-span-3 md:col-span-1">
          <Wordmark />
          <p className="mt-4 max-w-[260px] text-[14px] leading-relaxed text-dim">
            {tagline}
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.h}>
            <div className="mb-4 text-[13px] font-medium text-fg">{col.h}</div>
            <ul className="space-y-2.5">
              {col.items.map((it) => (
                <li key={it.label}>
                  {it.href.startsWith("/") ? (
                    <Link href={it.href} className="text-[14px] text-dim transition-colors hover:text-fg">
                      {it.label}
                    </Link>
                  ) : it.href.startsWith("http") ? (
                    <a href={it.href} target="_blank" rel="noopener noreferrer" className="text-[14px] text-dim transition-colors hover:text-fg">
                      {it.label}
                    </a>
                  ) : (
                    <a
                      href={it.href}
                      onClick={(e) => {
                        if (it.href.length > 1) {
                          e.preventDefault();
                          scrollTo(it.href);
                        }
                      }}
                      className="text-[14px] text-dim transition-colors hover:text-fg"
                    >
                      {it.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-2 border-t border-line py-6 text-[13px] text-dim sm:flex-row">
        <span>© 2026 FraudGuard · Nie jesteśmy powiązani z Mojang Studios ani Microsoft.</span>
        <a
          href="https://afto.works"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 transition-colors hover:text-fg"
        >
          Strona wykonana przez <span className="font-medium text-muted transition-colors group-hover:text-fg">afto.works</span>
          <Arrow className="size-3 -rotate-45 transition-transform duration-500 ease-out-expo group-hover:rotate-0" />
        </a>
      </div>
    </footer>
  );
}
