"use client";

import { createContext, useContext, type ReactNode } from "react";
import { SITE } from "@/lib/site";

export type PublicSite = { discordUrl: string };

const SiteContext = createContext<PublicSite>({ discordUrl: SITE.discordUrl });

/** Site settings from the admin panel, available to every client component. */
export function SiteProvider({ value, children }: { value: PublicSite; children: ReactNode }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export const useSite = () => useContext(SiteContext);
