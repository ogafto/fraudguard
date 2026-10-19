"use client";

import type { ReactNode } from "react";
import { ReactLenis } from "lenis/react";
import { MotionConfig } from "motion/react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ReactLenis root options={{ lerp: 0.1, anchors: false }}>
        {children}
      </ReactLenis>
    </MotionConfig>
  );
}
