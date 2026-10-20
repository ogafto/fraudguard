export type CheckStatus = "stabilny" | "beta";
export type Check = { name: string; types: number; desc: string; status: CheckStatus };

export const CHECK_CATEGORIES: { id: string; label: string; checks: Check[] }[] = [
  {
    id: "combat",
    label: "Walka",
    checks: [
      { name: "KillAura", types: 6, desc: "Automatyczne atakowanie, nienaturalne rotacje i trafianie wielu celów naraz.", status: "stabilny" },
      { name: "Reach", types: 3, desc: "Uderzenia z odległości większej niż pozwala gra, z kompensacją pingu.", status: "stabilny" },
      { name: "AimAssist", types: 4, desc: "Zbyt płynne i precyzyjne celowanie, wspomaganie celownika.", status: "stabilny" },
      { name: "AutoClicker", types: 5, desc: "Nieludzkie, zbyt równe odstępy między kliknięciami (CPS).", status: "stabilny" },
      { name: "Velocity", types: 2, desc: "Ignorowanie odrzutu po otrzymaniu obrażeń (Anti-KB).", status: "stabilny" },
      { name: "Criticals", types: 2, desc: "Wymuszanie trafień krytycznych bez skoku.", status: "beta" },
    ],
  },
  {
    id: "movement",
    label: "Ruch",
    checks: [
      { name: "Fly", types: 4, desc: "Latanie i unoszenie się w powietrzu bez uprawnień.", status: "stabilny" },
      { name: "Speed", types: 5, desc: "Poruszanie się szybciej, niż pozwala fizyka gry.", status: "stabilny" },
      { name: "NoFall", types: 2, desc: "Unikanie obrażeń od upadku z wysokości.", status: "stabilny" },
      { name: "Timer", types: 3, desc: "Przyspieszanie zegara gry i wysyłanie zbyt wielu pakietów ruchu.", status: "stabilny" },
      { name: "Jesus", types: 2, desc: "Chodzenie po wodzie i lawie.", status: "stabilny" },
      { name: "ElytraFly", types: 2, desc: "Nienaturalne sterowanie i przyspieszanie na elytrze.", status: "beta" },
    ],
  },
  {
    id: "world",
    label: "Świat",
    checks: [
      { name: "Scaffold", types: 5, desc: "Automatyczne stawianie bloków pod sobą podczas biegu.", status: "stabilny" },
      { name: "FastBreak", types: 2, desc: "Niszczenie bloków szybciej niż pozwala narzędzie.", status: "stabilny" },
      { name: "Nuker", types: 2, desc: "Niszczenie wielu bloków naraz wokół gracza.", status: "stabilny" },
      { name: "FastPlace", types: 1, desc: "Stawianie bloków w nieludzkim tempie.", status: "stabilny" },
      { name: "Tower", types: 2, desc: "Budowanie słupa w górę szybciej niż to możliwe.", status: "stabilny" },
      { name: "X-Ray", types: 1, desc: "Heurystyka wykrywająca podejrzanie celne kopanie rud.", status: "beta" },
    ],
  },
  {
    id: "packets",
    label: "Pakiety",
    checks: [
      { name: "BadPackets", types: 12, desc: "Nieprawidłowe lub niemożliwe pakiety wysyłane przez klienta.", status: "stabilny" },
      { name: "Blink", types: 2, desc: "Wstrzymywanie pakietów, by „teleportować” się po serwerze.", status: "stabilny" },
      { name: "Crasher", types: 4, desc: "Blokuje exploity próbujące zawiesić serwer lub klientów.", status: "stabilny" },
      { name: "PingSpoof", types: 2, desc: "Sztuczne zawyżanie pingu, by zyskać przewagę.", status: "stabilny" },
      { name: "Inventory", types: 3, desc: "AutoArmor, InvMove i operacje w ekwipunku bez otwarcia GUI.", status: "stabilny" },
      { name: "Disabler", types: 2, desc: "Próby wyłączenia anticheata spreparowanymi pakietami.", status: "beta" },
    ],
  },
];

export const CHECK_COUNT = 124;
