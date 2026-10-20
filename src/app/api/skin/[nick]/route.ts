import { NextResponse, type NextRequest } from "next/server";
import { defaultSkin } from "@/components/mc-head";

const NICK = /^[A-Za-z0-9_]{3,16}$/;
const CACHE = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

function fallback(request: NextRequest, nick: string) {
  const res = NextResponse.redirect(new URL(defaultSkin(nick), request.url), 302);
  res.headers.set("Cache-Control", "public, max-age=600, s-maxage=3600");
  res.headers.set("X-Skin", "default");
  return res;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ nick: string }> }) {
  const { nick } = await params;
  if (!NICK.test(nick)) return fallback(request, nick);
  try {
    const profile = await fetch(`https://api.mojang.com/users/profiles/minecraft/${nick}`, { signal: AbortSignal.timeout(4000) });
    if (profile.status !== 200) return fallback(request, nick);
    const { id } = (await profile.json()) as { id: string };
    const session = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${id}`, { signal: AbortSignal.timeout(4000) });
    if (!session.ok) return fallback(request, nick);
    const { properties } = (await session.json()) as { properties: { name: string; value: string }[] };
    const textures = properties.find((p) => p.name === "textures");
    const url = textures ? (JSON.parse(Buffer.from(textures.value, "base64").toString("utf8")) as { textures?: { SKIN?: { url: string } } }).textures?.SKIN?.url : null;
    if (!url || !/^https?:\/\/textures\.minecraft\.net\//.test(url)) return fallback(request, nick);
    const image = await fetch(url.replace(/^http:/, "https:"), { signal: AbortSignal.timeout(4000) });
    if (!image.ok) return fallback(request, nick);
    return new NextResponse(await image.arrayBuffer(), {
      headers: { "Content-Type": "image/png", "Cache-Control": CACHE, "X-Skin": "player" },
    });
  } catch {
    return fallback(request, nick);
  }
}
