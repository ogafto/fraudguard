import type { CSSProperties, ReactNode } from "react";
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
            textShadow: "0.12em 0.12em 0 rgba(0,0,0,0.55)",
          }}
        >
          {text}
        </span>,
      );
  });
  return <span className={`font-pixel ${className ?? ""}`}>{parts}</span>;
}

/* ------------------------------------------------------------------ */
/* Pixel sprites                                                       */
/* ------------------------------------------------------------------ */

function Sprite({ rows, palette, className }: { rows: string[]; palette: Record<string, string>; className?: string }) {
  const h = rows.length;
  const w = rows[0].length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} shapeRendering="crispEdges" aria-hidden>
      {rows.flatMap((row, y) =>
        row.split("").map((ch, x) =>
          palette[ch] ? <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={palette[ch]} /> : null,
        ),
      )}
    </svg>
  );
}

const SPRITES = {
  sword: {
    rows: [
      "..........kk",
      ".........kcc",
      "........kcck",
      ".......kcck.",
      "..k...kcck..",
      "...k.kcck...",
      "....kcck....",
      "....hkk.....",
      "...h.k......",
      "..h.........",
      ".hh.........",
      "hh..........",
    ],
    palette: { k: "#1b6f74", c: "#63e6e2", h: "#6b4a2b" },
  },
  feather: {
    rows: [
      "..........ww",
      "........wwww",
      "......wwwwg.",
      ".....wwwwg..",
      "....wwwwg...",
      "...wwwg.....",
      "..wwwg......",
      "..wwg.......",
      "..wg........",
      ".g..........",
      "g...........",
      "............",
    ],
    palette: { w: "#f2f2f2", g: "#9a9a9a" },
  },
  clock: {
    rows: [
      "....kkkk....",
      "..kkyyyykk..",
      ".kyyyyyyyyk.",
      ".kyyyddyyyk.",
      "kyyyyddyyyyk",
      "kyyyydddddyk",
      "kyyyyyyyyyyk",
      "kyyyyyyyyyyk",
      ".kyyyyyyyyk.",
      ".kyyyyyyyyk.",
      "..kkyyyykk..",
      "....kkkk....",
    ],
    palette: { k: "#7a5a10", y: "#f0cf4f", d: "#3b2a08" },
  },
  barrier: {
    rows: [
      "...rrrrrr...",
      "..rr....rr..",
      ".rr.....rrr.",
      "rr.....rr.rr",
      "r.....rr...r",
      "r....rr....r",
      "r...rr.....r",
      "r..rr......r",
      "rr.rr.....rr",
      ".rrr.....rr.",
      "..rr....rr..",
      "...rrrrrr...",
    ],
    palette: { r: "#e5322f" },
  },
  book: {
    rows: [
      "............",
      ".bbbbbbbbb..",
      ".bwwwwwwwbb.",
      ".bwkkkkkwbb.",
      ".bwwwwwwwbb.",
      ".bwkkkkkwbb.",
      ".bwwwwwwwbb.",
      ".bwkkkwwwbb.",
      ".bbbbbbbbbb.",
      "..bbbbbbbbb.",
      "............",
      "............",
    ],
    palette: { b: "#7a4a24", w: "#eadfc4", k: "#8a7a60" },
  },
  pearl: {
    rows: [
      "............",
      "....kkkk....",
      "...kttttk...",
      "..kttllttk..",
      "..ktllttk...",
      "..ktttttk...",
      "..kttttttk..",
      "...kttttk...",
      "....kkkk....",
      "............",
      "............",
      "............",
    ],
    palette: { k: "#0b3b33", t: "#1f8f7a", l: "#7fe0c8" },
  },
  heart: {
    rows: [".kk...kk.", "krrk.krrk", "krwrkrrrk", "krrrrrrrk", ".krrrrrk.", "..krrrk..", "...krk...", "....k...."],
    palette: { k: "#1a0606", r: "#e0262b", w: "#ff9a9a" },
  },
  food: {
    rows: ["...kkk...", "..kbbbk..", ".kbbbbbk.", ".kbbbbbk.", "..kbbbkk.", "...kkk.kk", "......kwk", ".......k."],
    palette: { k: "#2a1405", b: "#a5602c", w: "#eeeeee" },
  },
};

export type SpriteName = keyof typeof SPRITES | "head" | "grass";

function Grass({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} shapeRendering="crispEdges" aria-hidden>
      <polygon points="6,0.5 11.5,3.25 6,6 0.5,3.25" fill="#6aaa3a" />
      <polygon points="0.5,3.25 6,6 6,11.5 0.5,8.75" fill="#7a5233" />
      <polygon points="11.5,3.25 6,6 6,11.5 11.5,8.75" fill="#5e3e26" />
      <polygon points="0.5,3.25 6,6 6,7 0.5,4.25" fill="#5d9632" />
      <polygon points="11.5,3.25 6,6 6,7 11.5,4.25" fill="#4b7f27" />
    </svg>
  );
}

export function McItem({ name, className, head }: { name: SpriteName; className?: string; head?: string }) {
  if (name === "head") return <McHead name={head ?? "Steve"} className={className} />;
  if (name === "grass") return <Grass className={className} />;
  const s = SPRITES[name];
  return <Sprite rows={s.rows} palette={s.palette} className={className} />;
}

/* ------------------------------------------------------------------ */
/* In-game scene: night landscape + HUD (crosshair, hearts, hotbar)    */
/* ------------------------------------------------------------------ */

const STARS = [
  [6, 4], [14, 9], [23, 3], [31, 7], [40, 2], [47, 10], [55, 5], [63, 8], [71, 3], [78, 11], [86, 6], [92, 2],
  [10, 14], [36, 13], [58, 15], [82, 14],
];

export function McScene({ children, className, hud = true }: { children?: ReactNode; className?: string; hud?: boolean }) {
  // terrain heights in blocks, left → right
  const far = [9, 9, 10, 11, 11, 12, 12, 11, 10, 10, 11, 13, 14, 14, 13, 12, 11, 11, 12, 12, 11, 10, 10, 9];
  const near = [5, 5, 6, 6, 6, 7, 7, 7, 6, 6, 5, 5, 5, 6, 7, 8, 8, 7, 7, 6, 6, 6, 5, 5];
  const cols = far.length;
  return (
    <div className={`relative overflow-hidden bg-[#0d1424] ${className ?? ""}`}>
      <svg viewBox="0 0 96 54" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 size-full" shapeRendering="crispEdges" aria-hidden>
        <defs>
          <linearGradient id="mc-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#070b16" />
            <stop offset="1" stopColor="#18243e" />
          </linearGradient>
        </defs>
        <rect width="96" height="54" fill="url(#mc-sky)" />
        {STARS.map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="0.6" height="0.6" fill="#cfd8ff" opacity={0.4 + (i % 3) * 0.2} />
        ))}
        <rect x="74" y="6" width="6" height="6" fill="#e8ecf5" />
        <rect x="75" y="7" width="1.5" height="1.5" fill="#c9cfdc" />
        <rect x="77.5" y="9" width="1.2" height="1.2" fill="#c9cfdc" />
        {far.map((h, i) => (
          <rect key={`f${i}`} x={i * (96 / cols)} y={54 - h * 2.2} width={96 / cols + 0.05} height={h * 2.2} fill="#1b2a2a" />
        ))}
        {near.map((h, i) => (
          <g key={`n${i}`}>
            <rect x={i * (96 / cols)} y={54 - h * 2.4} width={96 / cols + 0.05} height={h * 2.4} fill="#2a1f17" />
            <rect x={i * (96 / cols)} y={54 - h * 2.4} width={96 / cols + 0.05} height="1.1" fill="#2f5a22" />
          </g>
        ))}
        {/* a couple of trees */}
        {[5, 17].map((c) => (
          <g key={c}>
            <rect x={c * 4 + 1.6} y={54 - near[c] * 2.4 - 5} width="0.9" height="5" fill="#3a2a1a" />
            <rect x={c * 4} y={54 - near[c] * 2.4 - 9} width="4" height="4.4" fill="#1f3d18" />
          </g>
        ))}
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55))]" />

      {hud && (
        <>
          {/* crosshair */}
          <div className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 opacity-80">
            <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-white/80" />
            <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-white/80" />
          </div>
          {/* hearts + hunger + hotbar */}
          <div className="absolute bottom-2 left-1/2 w-[min(92%,364px)] -translate-x-1/2">
            <div className="mb-1 flex justify-between px-0.5">
              <div className="flex gap-[1px]">
                {Array.from({ length: 10 }, (_, i) => (
                  <McItem key={i} name="heart" className="size-[11px]" />
                ))}
              </div>
              <div className="flex gap-[1px]">
                {Array.from({ length: 10 }, (_, i) => (
                  <McItem key={i} name="food" className="size-[11px]" />
                ))}
              </div>
            </div>
            <div className="h-[3px] rounded-[1px] bg-[#1d3a12]">
              <div className="h-full w-[62%] bg-[#80ff20]" />
            </div>
            <div className="mt-1 grid grid-cols-9 border-2 border-[#1a1a1a] bg-[#1a1a1a]/70">
              {(["sword", "grass", "pearl", "clock", "book", "feather", null, null, null] as (SpriteName | null)[]).map((it, i) => (
                <div
                  key={i}
                  className={`relative flex aspect-square items-center justify-center border border-[#8b8b8b]/40 ${i === 0 ? "outline outline-2 outline-white" : ""}`}
                >
                  {it && <McItem name={it} className="size-[70%]" />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chest GUI + tooltip                                                 */
/* ------------------------------------------------------------------ */

export function McGui({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[3px] bg-[#c6c6c6] p-2 shadow-[inset_2px_2px_0_#ffffff,inset_-2px_-2px_0_#555555,0_0_0_2px_#000] ${className ?? ""}`}
    >
      <div className="px-1 pb-1.5 pt-0.5 font-pixel text-[13px] text-[#404040]">{title}</div>
      {children}
    </div>
  );
}

export function McSlot({
  children,
  active,
  onEnter,
  style,
}: {
  children?: ReactNode;
  active?: boolean;
  onEnter?: () => void;
  style?: CSSProperties;
}) {
  return (
    <div
      onPointerEnter={onEnter}
      style={style}
      className={`relative flex aspect-square items-center justify-center bg-[#8b8b8b] shadow-[inset_2px_2px_0_#373737,inset_-2px_-2px_0_#ffffff] ${active ? "after:absolute after:inset-[2px] after:bg-white/40" : ""}`}
    >
      {children}
    </div>
  );
}

export function McTooltip({ title, lines, className }: { title: string; lines: string[]; className?: string }) {
  return (
    <div
      className={`pointer-events-none rounded-[3px] border-2 border-[#100010] bg-[#100010]/95 px-2.5 py-1.5 shadow-[inset_0_0_0_1px_#5000ff55] ${className ?? ""}`}
    >
      <div className="[&_*]:!leading-[1.35]">
        <McText className="text-[14px]">{title}</McText>
        {lines.map((l, i) => (
          <div key={i}>
            <McText className="text-[13px]">{l}</McText>
          </div>
        ))}
      </div>
    </div>
  );
}
