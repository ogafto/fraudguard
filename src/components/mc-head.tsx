const SKINS = ["steve", "alex", "ari", "efe", "kai", "makena", "noor", "sunny", "zuri"];
const OWN = new Set(["aftoxd"]);
const NICK = /^[A-Za-z0-9_]{3,16}$/;

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function defaultSkin(name: string) {
  return `/mc/skin/${SKINS[hash(name.toLowerCase()) % SKINS.length]}.png`;
}

export function skinUrl(name: string, real = true) {
  const key = name.toLowerCase();
  if (OWN.has(key)) return `/mc/skin/${key}.png`;
  if (real && NICK.test(name)) return `/api/skin/${encodeURIComponent(name)}`;
  return defaultSkin(name);
}

export function McHead({ name, className, real = true }: { name: string; className?: string; real?: boolean }) {
  const src = skinUrl(name, real);
  return (
    <svg viewBox="8 8 8 8" className={className} style={{ imageRendering: "pixelated" }} aria-hidden>
      <image href={src} width="64" height="64" preserveAspectRatio="xMinYMin meet" />
      <image href={src} width="64" height="64" x="-32" preserveAspectRatio="xMinYMin meet" />
    </svg>
  );
}
