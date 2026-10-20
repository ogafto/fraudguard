"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_CONTENT, type ContentKey, type ContentMap } from "@/lib/content";

const ContentContext = createContext<Partial<ContentMap>>({});

export function ContentProvider({ value, children }: { value: Partial<ContentMap>; children: ReactNode }) {
  const parent = useContext(ContentContext);
  return <ContentContext.Provider value={{ ...parent, ...value }}>{children}</ContentContext.Provider>;
}

export function useContent<K extends ContentKey>(key: K): ContentMap[K] {
  return (useContext(ContentContext)[key] as ContentMap[K] | undefined) ?? DEFAULT_CONTENT[key];
}
