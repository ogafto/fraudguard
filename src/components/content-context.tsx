"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_CONTENT, type ContentKey, type ContentMap } from "@/lib/content";

// Texts edited in the CMS (admin panel → Treści). The root layout provides the published versions;
// the preview page wraps the site in a second provider with the draft, which takes precedence.

const ContentContext = createContext<Partial<ContentMap>>({});

export function ContentProvider({ value, children }: { value: Partial<ContentMap>; children: ReactNode }) {
  const parent = useContext(ContentContext);
  return <ContentContext.Provider value={{ ...parent, ...value }}>{children}</ContentContext.Provider>;
}

export function useContent<K extends ContentKey>(key: K): ContentMap[K] {
  return (useContext(ContentContext)[key] as ContentMap[K] | undefined) ?? DEFAULT_CONTENT[key];
}
