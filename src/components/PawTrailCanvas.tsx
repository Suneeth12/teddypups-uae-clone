"use client";

import React, { useRef, useEffect } from "react";
import { useReducedMotion } from "@/lib/media-queries";
import { PAW_PATH } from "@/components/pup-svg-paths";

export default function PawTrailCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (
      reducedMotion ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pawPath = new Path2D(PAW_PATH);
    const trails: { x: number; y: number; angle: number; born: number }[] = [];
    let dpr = 1;
    let animId = 0;
    let isRunning = false;
    let lastX = NaN;
    let lastY = NaN;
    let dist = 0;
    let sign = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();

    const render = (now: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = trails.length - 1; i >= 0; i--) {
        const p = trails[i];
        const age = now - p.born;
        if (age > 1000) {
          trails.splice(i, 1);
          continue;
        }
        const alpha = age < 600 ? 1 : 1 - (age - 600) / 400;
        ctx.globalAlpha = alpha * 0.42 * alpha;
        ctx.setTransform(dpr * 0.27, 0, 0, dpr * 0.27, p.x * dpr, p.y * dpr);
        ctx.rotate(p.angle);
        ctx.translate(-32, -34);
        ctx.fillStyle = "#c2622b";
        ctx.fill(pawPath);
      }
      if (trails.length) {
        animId = requestAnimationFrame(render);
      } else {
        isRunning = false;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (Number.isNaN(lastX)) {
        lastX = e.clientX;
        lastY = e.clientY;
        return;
      }
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      dist += Math.hypot(dx, dy);
      if (dist >= 46) {
        dist = 0;
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        sign = -sign;
        const offset = sign * 7;
        trails.push({
          x: e.clientX + Math.cos(angle) * offset + 14,
          y: e.clientY + Math.sin(angle) * offset + 16,
          angle,
          born: performance.now(),
        });
        if (trails.length > 14) trails.shift();
        if (!isRunning) {
          isRunning = true;
          animId = requestAnimationFrame(render);
        }
      }
      lastX = e.clientX;
      lastY = e.clientY;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden={true}
      className="pointer-events-none fixed inset-0 z-[70] size-full"
    />
  );
}
