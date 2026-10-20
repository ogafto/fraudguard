import type { ReactNode } from "react";
import { McHead } from "./mc-head";

/* ------------------------------------------------------------------ */
/* Chat text with Minecraft § formatting codes                         */
/* ------------------------------------------------------------------ */

const MC_COLORS: Record<string, string> = {
  "0": "#000000",
  "1": "#0000AA",
  "2": "#00AA00",
  "3": "#00AAAA",
  "4": "#AA0000",
  "5": "#AA00AA",
  "6": "#FFAA00",
  "7": "#AAAAAA",
  "8": "#555555",
  "9": "#5555FF",
  a: "#55FF55",
  b: "#55FFFF",
  c: "#FF5555",
  d: "#FF55FF",
  e: "#FFFF55",
  f: "#FFFFFF",
};

// Minecraft draws text shadow in the same colour at a quarter of the brightness.
const shade = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) >> 2},${((n >> 8) & 255) >> 2},${(n & 255) >> 2})`;
};

/** Renders a string like "§8[§fFG§8] §cPlayer" with Minecraft colours and text shadow. */
export function McText({ children, className }: { children: string; className?: string }) {
  const parts: ReactNode[] = [];
  let color = MC_COLORS.f;
  let bold = false;
  let strike = false;
  const chunks = children.split("§");
  chunks.forEach((chunk, i) => {
    let text = chunk;
    if (i > 0 && chunk.length) {
      const code = chunk[0].toLowerCase();
      text = chunk.slice(1);
      if (MC_COLORS[code]) {
        color = MC_COLORS[code];
        bold = false;
        strike = false;
      } else if (code === "l") bold = true;
      else if (code === "m") strike = true;
      else if (code === "r") {
        color = MC_COLORS.f;
        bold = false;
        strike = false;
      }
    }
    if (text)
      parts.push(
        <span
          key={i}
          style={{
            color,
            fontWeight: bold ? 600 : undefined,
            textDecoration: strike ? "line-through" : undefined,
            textShadow: `0.125em 0.125em 0 ${shade(color)}`,
          }}
        >
          {text}
        </span>,
      );
  });
  return <span className={`font-pixel ${className ?? ""}`}>{parts}</span>;
}

/* ------------------------------------------------------------------ */
/* Real Minecraft textures (public/mc)                                 */
/* ------------------------------------------------------------------ */

const TEXTURES = {
  sword: "/mc/item/diamond_sword.png",
  ironSword: "/mc/item/iron_sword.png",
  feather: "/mc/item/feather.png",
  clock: "/mc/item/clock_00.png",
  barrier: "/mc/item/barrier.png",
  book: "/mc/item/writable_book.png",
  pearl: "/mc/item/ender_pearl.png",
  bow: "/mc/item/bow.png",
  arrow: "/mc/item/arrow.png",
  boots: "/mc/item/diamond_boots.png",
  pickaxe: "/mc/item/diamond_pickaxe.png",
  apple: "/mc/item/golden_apple.png",
  beef: "/mc/item/cooked_beef.png",
  comparator: "/mc/item/comparator.png",
  redstone: "/mc/item/redstone.png",
  nametag: "/mc/item/name_tag.png",
  paper: "/mc/item/paper.png",
  totem: "/mc/item/totem_of_undying.png",
  xp: "/mc/item/experience_bottle.png",
  eye: "/mc/item/ender_eye.png",
  spyglass: "/mc/item/spyglass.png",
  compass: "/mc/item/compass_00.png",
  tnt: "/mc/item/tnt.png",
  grass: "/mc/item/grass_block.png",
  command: "/mc/item/command_block.gif",
  heart: "/mc/gui/heart_full.png",
  food: "/mc/gui/food_full.png",
} as const;

export type SpriteName = keyof typeof TEXTURES | "head";

/** A real item texture, scaled with crisp pixels. `head` renders a player's face from their skin. */
export function McItem({ name, className, head }: { name: SpriteName; className?: string; head?: string }) {
  if (name === "head") return <McHead name={head ?? "aftoxd"} className={className} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={TEXTURES[name]} alt="" draggable={false} className={`select-none [image-rendering:pixelated] ${className ?? ""}`} />
  );
}
