"use client";

import React, { useRef, useEffect } from "react";
import { curtainDown } from "./RouteCurtain";

interface RevealScopeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export default function RevealScope({
  children,
  className = "",
  ...rest
}: RevealScopeProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const revealAll = () => {
        el.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])").forEach((node) => {
          node.dataset.revealed = "true";
        });
      };
      revealAll();
      const mo = new MutationObserver(revealAll);
      mo.observe(el, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    const pending = new Set<HTMLElement>();

    const reveal = (target: HTMLElement) => {
      target.dataset.revealed = "true";
      observer.unobserve(target);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          if (curtainDown()) {
            pending.add(target);
          } else {
            reveal(target);
          }
        }
      },
      {
        rootMargin: "0px 0px -6% 0px",
        threshold: 0.08,
      }
    );

    const flush = () => {
      pending.forEach(reveal);
      pending.clear();
    };

    let pollTimer: number | null = null;
    const poll = () => {
      if (curtainDown()) {
        pollTimer = window.setTimeout(poll, 400);
      } else {
        flush();
      }
    };

    window.addEventListener("tp:arrived", flush);
    pollTimer = window.setTimeout(poll, 1600);

    const arm = (node: HTMLElement) => {
      if (node.dataset.armed) {
        observer.observe(node);
        return;
      }
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0 && !curtainDown()) {
        node.dataset.revealed = "true";
        return;
      }
      node.dataset.armed = "true";
      observer.observe(node);
    };

    el.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])").forEach(arm);

    const mo = new MutationObserver(() => {
      el.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])").forEach(arm);
    });
    mo.observe(el, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mo.disconnect();
      window.removeEventListener("tp:arrived", flush);
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, []);

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
}
