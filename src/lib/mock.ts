/** Placeholder data for the dashboards until a backend exists. */

export type AlertAction = "flaga" | "cofnięcie" | "kick" | "ban";

export const SERVERS = [
  { id: "srv-1", name: "Survival EU", ip: "play.survival.pl", version: "Paper 1.21.1", players: 1284, max: 2000, tps: 20.0, tick: 0.21, plugin: "2.0.0", online: true },
  { id: "srv-2", name: "SkyBlock", ip: "sky.survival.pl", version: "Purpur 1.20.4", players: 642, max: 1000, tps: 19.9, tick: 0.18, plugin: "2.0.0", online: true },
  { id: "srv-3", name: "BoxPvP", ip: "box.survival.pl", version: "Paper 1.21.1", players: 318, max: 500, tps: 20.0, tick: 0.27, plugin: "1.9.4", online: true },
  { id: "srv-4", name: "Lobby", ip: "lobby.survival.pl", version: "Velocity 3.3", players: 0, max: 3000, tps: 0, tick: 0, plugin: "2.0.0", online: false },
];

const PLAYERS = ["aftoxd", "q1ckscope", "Dr34mer", "BlockBreaker", "lagswitch", "PvP_God_2011", "Herobrine404", "creeperking", "mlg_water", "Sweaty_Tryhard", "EnderPearl_", "Notch_Fan99"];
const CHECKS = [
  ["KillAura C", "Walka"],
  ["Reach A", "Walka"],
  ["AutoClicker F", "Walka"],
  ["Fly B", "Ruch"],
  ["Speed E", "Ruch"],
  ["Timer A", "Pakiety"],
  ["Scaffold D", "Świat"],
  ["BadPackets K", "Pakiety"],
  ["NoFall A", "Ruch"],
  ["FastBreak B", "Świat"],
] as const;

export type AlertRow = {
  id: number;
  player: string;
  check: string;
  category: string;
  server: string;
  vl: number;
  conf: number;
  action: AlertAction;
  time: string;
};

export const ALERTS: AlertRow[] = Array.from({ length: 48 }, (_, i) => {
  const vl = ((i * 13) % 19) + 1;
  const [check, category] = CHECKS[(i * 7 + 2) % CHECKS.length];
  const mins = i * 4 + (i % 3);
  return {
    id: 1000 - i,
    player: PLAYERS[(i * 5 + 1) % PLAYERS.length],
    check,
    category,
    server: SERVERS[i % 3].name,
    vl,
    conf: 60 + ((i * 17) % 39),
    action: vl > 16 ? "ban" : vl > 12 ? "kick" : vl > 6 ? "cofnięcie" : "flaga",
    time: mins < 60 ? `${mins || 1} min temu` : `${Math.floor(mins / 60)} godz. temu`,
  };
});

export const DETECTIONS_7D = [
  { day: "Pon", combat: 412, movement: 230, world: 96 },
  { day: "Wt", combat: 388, movement: 251, world: 110 },
  { day: "Śr", combat: 465, movement: 210, world: 88 },
  { day: "Czw", combat: 520, movement: 290, world: 132 },
  { day: "Pt", combat: 610, movement: 330, world: 150 },
  { day: "Sob", combat: 702, movement: 388, world: 171 },
  { day: "Nd", combat: 655, movement: 342, world: 160 },
];

export const LICENSE = {
  plan: "Pro",
  key: "FG-7Q2K-91XD-ZP4M-LL83",
  renews: "18.11.2026",
  servers: 3,
  maxServers: 3,
  price: "59 zł / mies.",
};

export const RELEASES = [
  { version: "2.0.0", channel: "stabilna", date: "14.10.2026", size: "2.4 MB", downloads: 1832, notes: ["Nowy silnik detekcji ruchu", "Wsparcie Folia", "Szybsze alerty Discord"] },
  { version: "1.9.4", channel: "stabilna", date: "28.09.2026", size: "2.2 MB", downloads: 4120, notes: ["Poprawki Reach przy wysokim pingu", "Nowy check Criticals (beta)"] },
  { version: "2.1.0-beta.2", channel: "beta", date: "16.10.2026", size: "2.5 MB", downloads: 214, notes: ["ElytraFly B", "Panel: eksport logów do CSV"] },
  { version: "1.9.3", channel: "stabilna", date: "09.09.2026", size: "2.2 MB", downloads: 3890, notes: ["Poprawka kompatybilności z ViaVersion"] },
];

export const INVOICES = [
  { id: "FV/2026/10/0412", date: "18.10.2026", amount: "59,00 zł", status: "opłacona", method: "BLIK" },
  { id: "FV/2026/09/0388", date: "18.09.2026", amount: "59,00 zł", status: "opłacona", method: "BLIK" },
  { id: "FV/2026/08/0351", date: "18.08.2026", amount: "59,00 zł", status: "opłacona", method: "Karta •• 4242" },
  { id: "FV/2026/07/0297", date: "18.07.2026", amount: "29,00 zł", status: "opłacona", method: "PayPal" },
];

/* ---------- Admin ---------- */

export const CUSTOMERS = [
  { name: "Survival.pl", email: "admin@survival.pl", plan: "Pro", servers: 3, mrr: 59, since: "03.2026", status: "aktywny" },
  { name: "MegaCraft", email: "kontakt@megacraft.pl", plan: "Network", servers: 11, mrr: 129, since: "11.2025", status: "aktywny" },
  { name: "BlockLand", email: "owner@blockland.eu", plan: "Starter", servers: 1, mrr: 29, since: "08.2026", status: "aktywny" },
  { name: "PvPZone", email: "pvpzone@gmail.com", plan: "Pro", servers: 2, mrr: 59, since: "01.2026", status: "zaległość" },
  { name: "SkyHub", email: "team@skyhub.gg", plan: "Network", servers: 7, mrr: 129, since: "06.2025", status: "aktywny" },
  { name: "CraftNight", email: "craftnight@proton.me", plan: "Starter", servers: 1, mrr: 0, since: "10.2026", status: "anulowany" },
  { name: "RedstoneMC", email: "hello@redstonemc.pl", plan: "Pro", servers: 3, mrr: 59, since: "04.2026", status: "aktywny" },
  { name: "Gildia.gg", email: "admin@gildia.gg", plan: "Lifetime Pro", servers: 3, mrr: 0, since: "12.2025", status: "aktywny" },
];

export const ADMIN_LICENSES = CUSTOMERS.map((c, i) => ({
  key: `FG-${["7Q2K", "A91L", "ZX03", "P0PZ", "SKY7", "CN11", "RS42", "GLD9"][i]}-••••-••••`,
  owner: c.name,
  plan: c.plan,
  servers: `${c.servers}/${c.plan.includes("Network") ? "∞" : c.plan.includes("Starter") ? 1 : 3}`,
  expires: c.plan.includes("Lifetime") ? "bezterminowo" : ["18.11.2026", "02.11.2026", "21.11.2026", "09.10.2026", "14.11.2026", "wygasła", "30.10.2026", "brak"][i],
  status: c.status === "anulowany" ? "wygasła" : c.status === "zaległość" ? "wstrzymana" : "aktywna",
}));

export const REVENUE_12M = [
  { m: "Lis", v: 6200 },
  { m: "Gru", v: 7100 },
  { m: "Sty", v: 7900 },
  { m: "Lut", v: 8300 },
  { m: "Mar", v: 9800 },
  { m: "Kwi", v: 10400 },
  { m: "Maj", v: 11900 },
  { m: "Cze", v: 12600 },
  { m: "Lip", v: 14100 },
  { m: "Sie", v: 15300 },
  { m: "Wrz", v: 16800 },
  { m: "Paź", v: 18420 },
];

export const ORDERS = [
  { who: "RedstoneMC", plan: "Pro · miesięcznie", amount: "59,00 zł", when: "12 min temu" },
  { who: "CraftNight", plan: "Starter · miesięcznie", amount: "29,00 zł", when: "1 godz. temu" },
  { who: "MegaCraft", plan: "Network · miesięcznie", amount: "129,00 zł", when: "3 godz. temu" },
  { who: "Gildia.gg", plan: "Pro · dożywotnio", amount: "299,00 zł", when: "wczoraj" },
  { who: "BlockLand", plan: "Starter · miesięcznie", amount: "29,00 zł", when: "wczoraj" },
];

export type Ticket = {
  id: number;
  subject: string;
  customer: string;
  status: "otwarte" | "oczekuje" | "zamknięte";
  updated: string;
  messages: { from: "klient" | "zespół"; who: string; text: string; time: string }[];
};

export const TICKETS: Ticket[] = [
  {
    id: 2041,
    subject: "Fałszywe flagi Speed na lodzie",
    customer: "PvPZone",
    status: "otwarte",
    updated: "8 min temu",
    messages: [
      { from: "klient", who: "PvPZone", text: "Hej, gracze na mapie z lodem dostają flagi Speed E. Wersja 1.9.4, Paper 1.20.4.", time: "21:12" },
      { from: "klient", who: "PvPZone", text: "Wrzucam logi z /fg logs w załączniku.", time: "21:13" },
    ],
  },
  {
    id: 2040,
    subject: "Jak podpiąć webhook Discord?",
    customer: "BlockLand",
    status: "oczekuje",
    updated: "1 godz. temu",
    messages: [
      { from: "klient", who: "BlockLand", text: "Gdzie w panelu ustawić webhook do alertów?", time: "19:40" },
      { from: "zespół", who: "Wsparcie FraudGuard", text: "Panel → Ustawienia → Discord. Wklej URL webhooka i kliknij „Wyślij test”.", time: "19:52" },
    ],
  },
  {
    id: 2038,
    subject: "Przeniesienie licencji na nowy serwer",
    customer: "Survival.pl",
    status: "zamknięte",
    updated: "wczoraj",
    messages: [
      { from: "klient", who: "Survival.pl", text: "Zmieniamy hosting, czy licencja przejdzie automatycznie?", time: "14:02" },
      { from: "zespół", who: "Wsparcie FraudGuard", text: "Tak, odepnij stary serwer w panelu i podepnij nowy. Limit się nie zmienia.", time: "14:20" },
    ],
  },
];
