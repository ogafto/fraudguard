const SKINS = ["steve", "alex", "ari", "efe", "kai", "makena", "noor", "sunny", "zuri"];
const OWN = new Set(["aftoxd"]);

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function skinUrl(name: string) {
  const key = name.toLowerCase();
  if (OWN.has(key)) return `/mc/skin/${key}.png`;
  return `/mc/skin/${SKINS[hash(key) % SKINS.length]}.png`;
}

export function McHead({ name, className }: { name: string; className?: string }) {
  const src = skinUrl(name);
  return (
    <svg viewBox="8 8 8 8" className={className} style={{ imageRendering: "pixelated" }} aria-hidden>
      <image href={src} width="64" height="64" />
      <image href={src} width="64" height="64" x="-32" />
    </svg>
  );
}
