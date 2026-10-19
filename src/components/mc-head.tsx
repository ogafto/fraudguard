import type { ReactNode } from "react";

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const SKIN = [
  [214, 170, 132],
  [190, 140, 105],
  [235, 196, 160],
  [150, 104, 74],
  [110, 74, 52],
];
const HAIR = [
  [58, 40, 28],
  [24, 22, 24],
  [196, 152, 84],
  [150, 72, 36],
  [96, 96, 104],
  [70, 50, 90],
];
const EYES = [
  [70, 110, 200],
  [80, 60, 40],
  [60, 140, 90],
];

const rgb = ([r, g, b]: number[], d = 0) =>
  `rgb(${Math.max(0, Math.min(255, r + d))},${Math.max(0, Math.min(255, g + d))},${Math.max(0, Math.min(255, b + d))})`;

/** 8×8 Minecraft-style face generated deterministically from a player name. */
export function McHead({ name, className }: { name: string; className?: string }) {
  const rand = rng(hash(name));
  const skin = SKIN[Math.floor(rand() * SKIN.length)];
  const hair = HAIR[Math.floor(rand() * HAIR.length)];
  const eye = EYES[Math.floor(rand() * EYES.length)];
  const fringe = 1 + Math.floor(rand() * 2);
  const beard = rand() > 0.75;

  const cells: ReactNode[] = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const n = Math.floor((rand() - 0.5) * 16);
      let c = rgb(skin, n);
      if (y < fringe || (y === fringe && (x === 0 || x === 7)) || (y === fringe + 1 && (x === 0 || x === 7))) c = rgb(hair, n);
      if (y === 4 && (x === 1 || x === 6)) c = "rgb(245,245,245)";
      if (y === 4 && (x === 2 || x === 5)) c = rgb(eye);
      if (y === 5 && (x === 3 || x === 4)) c = rgb(skin, -30);
      if (y === 6 && x >= 2 && x <= 5) c = beard ? rgb(hair, n) : rgb(skin, -45);
      if (beard && y === 7 && x >= 1 && x <= 6) c = rgb(hair, n);
      cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={c} />);
    }
  }
  return (
    <svg viewBox="0 0 8 8" className={className} shapeRendering="crispEdges" aria-hidden>
      {cells}
    </svg>
  );
}
