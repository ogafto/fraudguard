"use client";

import { useEffect, useRef } from "react";

/**
 * Canvas grid of Minecraft-sized blocks. Blocks light up under the cursor and
 * fade out like a trail; a few random blocks "ping" on their own.
 */
export function BlockGrid({ cell = 38, className }: { cell?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let heat = new Float32Array(0);
    let raf = 0;
    let visible = true;
    let last = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / cell);
      rows = Math.ceil(h / cell);
      heat = new Float32Array(cols * rows);
    };

    const light = (cx: number, cy: number, power: number, radius: number) => {
      for (let y = cy - radius; y <= cy + radius; y++) {
        for (let x = cx - radius; x <= cx + radius; x++) {
          if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
          const d = Math.hypot(x - cx, y - cy);
          if (d > radius) continue;
          const i = y * cols + x;
          heat[i] = Math.min(1, Math.max(heat[i], power * (1 - d / (radius + 0.5))));
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > w || y > h) return;
      light(Math.floor(x / cell), Math.floor(y / cell), 1, 2);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      // grid lines
      ctx.strokeStyle = "rgba(255,255,255,0.045)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= cols; x++) {
        ctx.moveTo(x * cell + 0.5, 0);
        ctx.lineTo(x * cell + 0.5, h);
      }
      for (let y = 0; y <= rows; y++) {
        ctx.moveTo(0, y * cell + 0.5);
        ctx.lineTo(w, y * cell + 0.5);
      }
      ctx.stroke();

      // ambient pings
      if (!reduce && t - last > 140) {
        last = t;
        light(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows), 0.55, 0);
      }

      for (let i = 0; i < heat.length; i++) {
        const v = heat[i];
        if (v < 0.01) continue;
        const x = (i % cols) * cell;
        const y = Math.floor(i / cols) * cell;
        ctx.fillStyle = `rgba(255,255,255,${v * 0.16})`;
        ctx.fillRect(x + 1, y + 1, cell - 1, cell - 1);
        if (v > 0.5) {
          ctx.strokeStyle = `rgba(255,255,255,${(v - 0.5) * 0.7})`;
          ctx.strokeRect(x + 1.5, y + 1.5, cell - 2, cell - 2);
        }
        heat[i] = v * 0.95;
      }
      if (visible) raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(draw);
    });
    io.observe(canvas);
    window.addEventListener("pointermove", onMove);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [cell]);

  return <canvas ref={ref} className={`size-full ${className ?? ""}`} aria-hidden />;
}
