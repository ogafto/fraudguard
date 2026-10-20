import { PRIVACY, TERMS, type LegalDoc } from "./legal";

export type HomeContent = {
  hero: { badgeTag: string; badgeShort: string; badgeLong: string; title1: string; title2: string; lead: string; primaryCta: string; secondaryCta: string };
  stats: { value: string; label: string }[];
  features: { eyebrow: string; title1: string; title2: string; intro: string; items: { tab: string; title: string; body: string; points: string[] }[] };
  cta: { title: string; lead: string; button: string };
  footer: { tagline: string };
};

export type Plan = { id: string; name: string; who: string; monthly: number; lifetime: number; featured: boolean; lead: string; features: string[] };

export type PricingContent = {
  eyebrow: string;
  title1: string;
  title2: string;
  monthlyLabel: string;
  lifetimeLabel: string;
  monthlyNote: string;
  lifetimeNote: string;
  featuredBadge: string;
  buttonPrefix: string;
  footnote: string;
  plans: Plan[];
};

export type FaqContent = { eyebrow: string; title1: string; title2: string; intro: string; items: { q: string; a: string }[] };

export type LegalContent = Pick<LegalDoc, "title" | "lead" | "updated" | "sections">;

export type ContentMap = { home: HomeContent; pricing: PricingContent; faq: FaqContent; terms: LegalContent; privacy: LegalContent };
export type ContentKey = keyof ContentMap;
export const CONTENT_KEYS: ContentKey[] = ["home", "pricing", "faq", "terms", "privacy"];

const legal = (d: LegalDoc): LegalContent => ({ title: d.title, lead: d.lead, updated: d.updated, sections: d.sections });

export const DEFAULT_CONTENT: ContentMap = {
  home: {
    hero: {
      badgeTag: "2.0",
      badgeShort: "Nowy silnik detekcji",
      badgeLong: "Nowy silnik detekcji jest już dostępny",
      title1: "Cheaterzy nie mają",
      title2: "żadnych szans.",
      lead: "Anticheat dla serwerów Minecraft, który analizuje każdy pakiet w czasie rzeczywistym. Wrzucasz plugin, restartujesz serwer i masz spokój.",
      primaryCta: "Zacznij teraz",
      secondaryCta: "Zobacz cennik",
    },
    stats: [
      { value: "1.20+", label: "tylko nowe wersje gry" },
      { value: "~0,2 ms", label: "średni koszt na tick" },
      { value: "30 s", label: "instalacja na serwerze" },
      { value: "Discord", label: "alerty i wsparcie" },
    ],
    features: {
      eyebrow: "Funkcje",
      title1: "Tak wygląda",
      title2: "FraudGuard w akcji.",
      intro: "Wszystko, czego Twoja administracja używa na co dzień. W grze, na Discordzie i w panelu.",
      items: [
        {
          tab: "Alerty",
          title: "Widzisz cheatera, zanim ktoś go zgłosi.",
          body: "Alert pojawia się na czacie administracji w chwili, gdy gracz nie przejdzie checka. Najedź, żeby zobaczyć szczegóły, kliknij i jesteś przy nim.",
          points: ["Widoczne tylko dla administracji", "Szczegóły po najechaniu", "Teleport jednym kliknięciem"],
        },
        {
          tab: "Komendy",
          title: "Jedna komenda. Wszystko o graczu.",
          body: "Profil, historia flag i ban z powodem pod /fg. Podpowiedzi działają dokładnie tak, jak w vanilli.",
          points: ["/fg info i /fg logs", "/fg ban z gotowym powodem", "Podpowiedzi przy wpisywaniu"],
        },
        {
          tab: "Menu",
          title: "Cała historia gracza w jednym menu.",
          body: "/fg gui otwiera menu z flagami w podziale na kategorie, teleportem i banem. Bez wpisywania czegokolwiek.",
          points: ["Flagi według kategorii", "Ban z gotowym powodem", "Historia z 30 dni"],
        },
        {
          tab: "Discord",
          title: "Wiesz o wszystkim, nawet poza grą.",
          body: "Każda flaga, kick i ban trafia na kanał Twojego serwera na Discordzie, ze skinem gracza i wszystkimi szczegółami.",
          points: ["Webhook w 30 sekund", "Osobne kanały na bany", "Wszystkie serwery razem"],
        },
        {
          tab: "Panel",
          title: "Zmieniasz czułość. Bez restartu.",
          body: "Każdy check ustawiasz w panelu. Serwery dostają zmiany od razu, bez przeładowania pluginu i bez wchodzenia na FTP.",
          points: ["Czułość dla każdego checka", "Wiele serwerów naraz", "Historia zmian"],
        },
      ],
    },
    cta: { title: "Gotowy, żeby pozbyć się cheaterów?", lead: "Załóż konto i zabezpiecz serwer jeszcze dziś.", button: "Załóż konto" },
    footer: { tagline: "Anticheat dla serwerów Minecraft. Cheaterzy nie mają szans." },
  },
  pricing: {
    eyebrow: "Cennik",
    title1: "Prosty cennik.",
    title2: "Bez niespodzianek.",
    monthlyLabel: "Miesięcznie",
    lifetimeLabel: "Dożywotnio",
    monthlyNote: "miesięcznie, anulujesz kiedy chcesz",
    lifetimeNote: "jednorazowo, na zawsze",
    featuredBadge: "Najczęściej wybierany",
    buttonPrefix: "Wybierz",
    footnote: "Płatności przyjmujemy na naszym Discordzie. Wybierz plan, a zakup dokończysz z nami na serwerze.",
    plans: [
      {
        id: "starter",
        name: "Starter",
        who: "Jeden serwer, który chce spokoju od pierwszego dnia.",
        monthly: 29,
        lifetime: 149,
        featured: false,
        lead: "",
        features: ["1 serwer", "Alerty w grze i komendy", "Menu podglądu gracza", "Aktualizacje"],
      },
      {
        id: "pro",
        name: "Pro",
        who: "Rosnąca społeczność z kilkoma trybami gry.",
        monthly: 59,
        lifetime: 299,
        featured: true,
        lead: "Wszystko ze Startera, plus",
        features: ["Do 3 serwerów", "Panel webowy i statystyki", "Alerty na Discordzie", "Historia zmian konfiguracji", "Priorytetowe wsparcie"],
      },
      {
        id: "network",
        name: "Network",
        who: "Sieć serwerów z proxy i własnymi wymaganiami.",
        monthly: 129,
        lifetime: 599,
        featured: false,
        lead: "Wszystko z Pro, plus",
        features: ["Bez limitu serwerów", "Synchronizacja proxy", "Dedykowany opiekun"],
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title1: "Częste",
    title2: "pytania.",
    intro: "Nie ma tu Twojego pytania? Zapytaj na Discordzie, odpowiadamy zwykle w kilka godzin.",
    items: [
      {
        q: "Na jakich wersjach Minecrafta działa FraudGuard?",
        a: "Od 1.20 wzwyż, na silnikach Paper, Spigot, Purpur i Folia. Skupiamy się tylko na nowych wersjach, dzięki czemu checki są dokładniejsze.",
      },
      {
        q: "Czy anticheat będzie banował uczciwych graczy?",
        a: "Każdy check jest kalibrowany pod lagi, ping i nietypowe sytuacje jak knockback, lód czy slime. Kary działają progowo, więc zanim dojdzie do bana, gracz musi wielokrotnie i jednoznacznie łamać zasady.",
      },
      { q: "Jak duży jest wpływ na wydajność serwera?", a: "Średnio około 0.2 ms na tick. Analiza pakietów odbywa się asynchronicznie, poza głównym wątkiem serwera." },
      { q: "Na ilu serwerach mogę używać licencji?", a: "Starter obejmuje jeden serwer, Pro do trzech, a Network nie ma limitu. Plan zmienisz w panelu klienta." },
      { q: "Czy działa na sieci z Velocity lub BungeeCord?", a: "Tak. W planie Network flagi i kary są synchronizowane między wszystkimi serwerami w sieci." },
      { q: "Jak wygląda wsparcie?", a: "Zespół odpowiada na Discordzie. W planach Pro i Network masz priorytet w kolejce." },
    ],
  },
  terms: legal(TERMS),
  privacy: legal(PRIVACY),
};

export type Field =
  | { kind: "text"; key: string; label: string; hint?: string; max?: number }
  | { kind: "textarea"; key: string; label: string; hint?: string; max?: number }
  | { kind: "number"; key: string; label: string; suffix?: string; min?: number; max?: number }
  | { kind: "toggle"; key: string; label: string; hint?: string }
  | { kind: "strings"; key: string; label: string; item: string; max?: number }
  | { kind: "group"; key: string; label: string; fields: Field[] }
  | { kind: "list"; key: string; label: string; item: string; title: string; fields: Field[]; fixed?: boolean; max?: number }
  | { kind: "blocks"; key: string; label: string };

const t = (key: string, label: string, hint?: string, max = 300): Field => ({ kind: "text", key, label, hint, max });
const ta = (key: string, label: string, hint?: string, max = 4000): Field => ({ kind: "textarea", key, label, hint, max });

const LEGAL_FIELDS: Field[] = [
  t("title", "Tytuł"),
  ta("lead", "Wstęp", "Krótki opis pod tytułem."),
  t("updated", "Data aktualizacji", "Pokazywana jako „Ostatnia aktualizacja”, np. 20 października 2026."),
  {
    kind: "list",
    key: "sections",
    label: "Sekcje",
    item: "sekcja",
    title: "title",
    max: 60,
    fields: [t("title", "Tytuł sekcji"), t("id", "Kotwica w adresie", "Małe litery i myślniki, np. platnosci. Zostaw puste, a utworzy się sama.", 60), { kind: "blocks", key: "body", label: "Treść" }],
  },
];

export const CONTENT_DOCS: Record<ContentKey, { label: string; desc: string; href: string; fields: Field[] }> = {
  home: {
    label: "Strona główna",
    desc: "Hero, pasek liczb, Funkcje, wezwanie do działania i stopka.",
    href: "/",
    fields: [
      {
        kind: "group",
        key: "hero",
        label: "Hero",
        fields: [
          t("badgeTag", "Plakietka: znacznik", "Krótki tekst w jasnym kółku, np. 2.0.", 12),
          t("badgeShort", "Plakietka: tekst na telefonie"),
          t("badgeLong", "Plakietka: tekst na komputerze"),
          t("title1", "Nagłówek, pierwsza linia"),
          t("title2", "Nagłówek, druga linia (przygaszona)"),
          ta("lead", "Opis pod nagłówkiem"),
          t("primaryCta", "Przycisk główny"),
          t("secondaryCta", "Przycisk do cennika"),
        ],
      },
      {
        kind: "list",
        key: "stats",
        label: "Pasek liczb",
        item: "liczba",
        title: "value",
        max: 4,
        fields: [t("value", "Wartość", "Liczba się animuje, np. ~0,2 ms albo 30 s. Tekst bez liczby albo z kropką, np. Discord czy 1.20+, pokaże się bez animacji.", 20), t("label", "Podpis")],
      },
      {
        kind: "group",
        key: "features",
        label: "Funkcje",
        fields: [
          t("eyebrow", "Nadtytuł"),
          t("title1", "Tytuł, pierwsza linia"),
          t("title2", "Tytuł, druga linia"),
          ta("intro", "Opis obok tytułu"),
          {
            kind: "list",
            key: "items",
            label: "Zakładki",
            item: "zakładka",
            title: "tab",
            fixed: true,
            fields: [t("tab", "Nazwa zakładki", undefined, 20), t("title", "Tytuł"), ta("body", "Opis"), { kind: "strings", key: "points", label: "Punkty", item: "punkt", max: 6 }],
          },
        ],
      },
      { kind: "group", key: "cta", label: "Wezwanie do działania", fields: [t("title", "Tytuł"), t("lead", "Opis"), t("button", "Przycisk")] },
      { kind: "group", key: "footer", label: "Stopka", fields: [ta("tagline", "Opis pod logo", undefined, 300)] },
    ],
  },
  pricing: {
    label: "Cennik",
    desc: "Plany, ceny miesięczne i dożywotnie, listy funkcji i wyróżniony plan.",
    href: "/#pricing",
    fields: [
      t("eyebrow", "Nadtytuł"),
      t("title1", "Tytuł, pierwsza linia"),
      t("title2", "Tytuł, druga linia"),
      t("monthlyLabel", "Przełącznik: miesięcznie"),
      t("lifetimeLabel", "Przełącznik: dożywotnio"),
      t("monthlyNote", "Dopisek pod ceną miesięczną"),
      t("lifetimeNote", "Dopisek pod ceną dożywotnią"),
      t("featuredBadge", "Etykieta wyróżnionego planu"),
      t("buttonPrefix", "Przycisk planu", "Przed nazwą planu, np. Wybierz → Wybierz Pro."),
      ta("footnote", "Informacja pod cennikiem", "Link prowadzi na Discorda ustawionego w Integracjach."),
      {
        kind: "list",
        key: "plans",
        label: "Plany",
        item: "plan",
        title: "name",
        max: 4,
        fields: [
          t("name", "Nazwa", undefined, 30),
          t("id", "Identyfikator", "Używany w zakupach i licencjach. Zostaw puste, a utworzy się z nazwy.", 30),
          ta("who", "Dla kogo", undefined, 200),
          { kind: "number", key: "monthly", label: "Cena miesięczna", suffix: "zł", min: 0, max: 100000 },
          { kind: "number", key: "lifetime", label: "Cena dożywotnia", suffix: "zł", min: 0, max: 100000 },
          { kind: "toggle", key: "featured", label: "Wyróżniony plan", hint: "Jasny przycisk i etykieta. Zwykle jeden plan." },
          t("lead", "Nad listą funkcji", "Np. Wszystko z Pro, plus. Może zostać puste."),
          { kind: "strings", key: "features", label: "Funkcje", item: "funkcja", max: 12 },
        ],
      },
    ],
  },
  faq: {
    label: "FAQ",
    desc: "Pytania i odpowiedzi: dodawanie, usuwanie i kolejność.",
    href: "/#faq",
    fields: [
      t("eyebrow", "Nadtytuł"),
      t("title1", "Tytuł, pierwsza linia"),
      t("title2", "Tytuł, druga linia"),
      ta("intro", "Opis pod tytułem"),
      { kind: "list", key: "items", label: "Pytania", item: "pytanie", title: "q", max: 40, fields: [t("q", "Pytanie"), ta("a", "Odpowiedź")] },
    ],
  },
  terms: { label: "Regulamin", desc: "Cały regulamin: sekcje, akapity, listy i data aktualizacji.", href: "/regulamin", fields: LEGAL_FIELDS },
  privacy: { label: "Polityka prywatności", desc: "Cała polityka: sekcje, akapity, listy i data aktualizacji.", href: "/prywatnosc", fields: LEGAL_FIELDS },
};

const str = (v: unknown, max = 4000) => (typeof v === "string" ? v.replace(/\r\n/g, "\n").slice(0, max) : "");

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/ł/g, "l")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

function coerceFields(fields: Field[], input: unknown, fallback: Record<string, unknown>): Record<string, unknown> {
  const src = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = src[f.key];
    const def = fallback?.[f.key];
    switch (f.kind) {
      case "text":
        out[f.key] = typeof v === "string" ? str(v, f.max ?? 300).replace(/\n/g, " ") : (def ?? "");
        break;
      case "textarea":
        out[f.key] = typeof v === "string" ? str(v, f.max ?? 4000) : (def ?? "");
        break;
      case "number": {
        const n = typeof v === "number" ? v : typeof v === "string" ? Number(v.replace(",", ".")) : NaN;
        out[f.key] = Number.isFinite(n) ? Math.min(f.max ?? Infinity, Math.max(f.min ?? -Infinity, Math.round(n * 100) / 100)) : (def ?? 0);
        break;
      }
      case "toggle":
        out[f.key] = typeof v === "boolean" ? v : (def ?? false);
        break;
      case "strings":
        out[f.key] = Array.isArray(v) ? v.map((x) => str(x, 300).replace(/\n/g, " ")).slice(0, f.max ?? 50) : (def ?? []);
        break;
      case "group":
        out[f.key] = coerceFields(f.fields, v, (def ?? {}) as Record<string, unknown>);
        break;
      case "list": {
        const defs = (Array.isArray(def) ? def : []) as Record<string, unknown>[];
        if (!Array.isArray(v)) {
          out[f.key] = defs;
          break;
        }
        let items = v.slice(0, f.fixed ? defs.length : (f.max ?? 100)).map((x, i) => coerceFields(f.fields, x, f.fixed ? defs[i] : {}));
        if (f.fixed && items.length < defs.length) items = [...items, ...defs.slice(items.length)];
        out[f.key] = items;
        break;
      }
      case "blocks":
        out[f.key] = Array.isArray(v)
          ? v
              .map((b) => (Array.isArray(b) ? b.map((x) => str(x, 2000).replace(/\n/g, " ")).filter(Boolean) : str(b, 8000)))
              .filter((b) => (Array.isArray(b) ? b.length > 0 : b.trim() !== ""))
              .slice(0, 100)
          : (def ?? []);
        break;
    }
  }
  return out;
}

export function coerceContent<K extends ContentKey>(key: K, input: unknown): ContentMap[K] {
  const doc = coerceFields(CONTENT_DOCS[key].fields, input, DEFAULT_CONTENT[key] as unknown as Record<string, unknown>);

  const def = DEFAULT_CONTENT[key] as unknown as Record<string, unknown>;
  if (key === "pricing" && !(doc.plans as unknown[]).length) doc.plans = def.plans;
  if ((key === "terms" || key === "privacy") && !(doc.sections as unknown[]).length) doc.sections = def.sections;

  if (key === "pricing") {
    const seen = new Set<string>();
    for (const p of doc.plans as Plan[]) {
      let id = slugify(p.id || p.name) || "plan";
      while (seen.has(id)) id += "-2";
      seen.add(id);
      p.id = id;
    }
  }
  if (key === "terms" || key === "privacy") {
    const seen = new Set<string>();
    for (const s of doc.sections as LegalContent["sections"]) {
      let id = slugify(s.id || s.title) || "sekcja";
      while (seen.has(id)) id += "-2";
      seen.add(id);
      s.id = id;
    }
  }
  return doc as unknown as ContentMap[K];
}
