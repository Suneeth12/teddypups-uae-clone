"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { frame, cancelFrame } from "motion/react";
import { prefersReducedMotion, useReducedMotion } from "@/lib/media-queries";

export default function ScrollEffects() {
  const reduced = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.1,
      wheelMultiplier: 0.85,
      prevent: (node) => !!node.closest?.("dialog, [data-lenis-prevent]"),
      virtualScroll: () => getComputedStyle(document.documentElement).overflowY !== "hidden",
    });
    lenisRef.current = lenis;

    const onFrame = ({ timestamp }: { timestamp: number }) => {
      lenis.raf(timestamp);
    };
    frame.read(onFrame, true);

    const handleNavigate = () => {
      lenis.scrollTo(lenis.actualScroll, { immediate: true });
    };
    window.addEventListener("tp:navigate", handleNavigate);
    window.addEventListener("popstate", handleNavigate);

    return () => {
      cancelFrame(onFrame);
      window.removeEventListener("tp:navigate", handleNavigate);
      window.removeEventListener("popstate", handleNavigate);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Preserve keyboard Enter navigation (e.detail === 0) so Skip-to-content moves focus cleanly
      if (
        e.defaultPrevented ||
        e.detail === 0 ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const target = (e.target as HTMLElement)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!target || (target.target && target.target !== "_self")) return;

      let url: URL;
      try {
        url = new URL(target.href, location.href);
      } catch {
        return;
      }
      if (
        url.hash.length < 2 ||
        url.origin !== location.origin ||
        url.pathname !== location.pathname ||
        url.search !== location.search
      ) {
        return;
      }

      let id: string;
      try {
        id = decodeURIComponent(url.hash.slice(1));
      } catch {
        return;
      }
      if (!id) return;

      const targetEl = Array.from(
        document.querySelectorAll<HTMLElement>(`[id="${CSS.escape(id)}"]`)
      ).find((el) => el.getClientRects().length > 0);
      if (!targetEl) return;

      e.preventDefault();
      if (lenisRef.current) {
        lenisRef.current.scrollTo(targetEl);
      } else {
        targetEl.scrollIntoView({ behavior: prefersReducedMotion() ? "instant" : "smooth" });
      }
      history.pushState(null, "", url.hash);
    };

    window.addEventListener("click", handleAnchorClick);
    return () => window.removeEventListener("click", handleAnchorClick);
  }, []);

  return null;
}
