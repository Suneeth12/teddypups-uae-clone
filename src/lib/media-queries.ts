"use client";

import { useSyncExternalStore } from "react";

const REDUCED_MQ = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia(REDUCED_MQ).matches;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia(REDUCED_MQ);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(REDUCED_MQ).matches,
    () => true
  );
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
