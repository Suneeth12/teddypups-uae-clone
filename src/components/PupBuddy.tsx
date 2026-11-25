"use client";

import React, { useEffect, useRef } from "react";
import { frame, cancelFrame } from "motion/react";
import { POSES, PupController } from "./pup-kinematics";
import { PupSvg } from "./pup-svg-paths";
import { TRICKS, pickTrick, spawnHearts, type TrickName, type TrickStep } from "./pup-tricks";
import { useReducedMotion } from "@/lib/media-queries";

export type PupPose =
  | "stand"
  | "walk"
  | "sit"
  | "peek"
  | "snug"
  | "lie"
  | "sleep"
  | "settle"
  | "hop"
  | "sniff"
  | "bow"
  | "beg";

interface PupBuddyProps {
  pose?: PupPose;
  facing?: "left" | "right";
  act?: string;
  className?: string;
  label?: string;
  style?: React.CSSProperties;
  asStop?: boolean;
}

const PEEK_POOL: TrickName[] = ["peekaboo", "woof", "tilt", "sneeze"];
const SNUG_POOL: TrickName[] = ["tilt", "love", "sneeze", "woof"];

export function PupBuddy({
  pose = "sit",
  facing = "right",
  act,
  className = "",
  label,
  style,
  asStop = false,
}: PupBuddyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const container = containerRef.current;
    const bubble = bubbleRef.current;
    if (!container || !bubble) return;
    const svg = container.querySelector("svg");
    if (!svg) return;

    const dir = facing === "left" ? -1 : 1;
    const controller = new PupController(svg, pose, dir);
    controller.wag(0.6);

    let queue: TrickStep[] = [];
    let lastTime = performance.now() / 1000;
    let lastIdleAt = lastTime;
    let bubbleUntil = 0;
    let gaze: { x: number; y: number; t: number } | null = null;
    let lastTrick: TrickName | null = null;
    let rapidClicks = 0;
    let lastClickAt = 0;
    let isPlaying = false;
    let playingUntil = 0;

    const ctx = {
      d: controller,
      rest: POSES[pose] ?? POSES.sit,
      facing: dir,
      say: (text: string, dur = 1.4) => {
        bubble.textContent = text;
        bubble.dataset.show = "true";
        bubbleUntil = performance.now() / 1000 + dur;
      },
      hearts: () => {
        spawnHearts(container, container.clientWidth * (dir > 0 ? 0.7 : 0.3), container.clientHeight * 0.25);
      },
    };

    const tick = () => {
      const now = performance.now() / 1000;
      const dt = Math.min(0.05, now - lastTime);
      lastTime = now;

      while (queue.length && queue[0][0] <= now) {
        queue.shift()![1](now);
      }

      const nextPlaying = now < playingUntil;
      if (isPlaying !== nextPlaying) {
        isPlaying = nextPlaying;
        container.toggleAttribute("data-playing", isPlaying);
      }

      controller.lookAt(gaze && now - gaze.t < 3 ? gaze : null);

      if (act === "tilt" && !queue.length) {
        controller.cock(Math.sin(0.9 * now) > 0.35 ? 13 : Math.sin(0.9 * now) < -0.35 ? -10 : 0);
      }

      if (!queue.length && now - lastIdleAt > 9) {
        lastIdleAt = now;
        queue =
          Math.random() < 0.5
            ? TRICKS.tilt(ctx, now)
            : [
                [now, () => controller.wag(1)],
                [now + 2.2, () => controller.wag(0.6)],
              ];
      }

      if (bubble.dataset.show === "true" && now > bubbleUntil) {
        bubble.dataset.show = "false";
      }

      controller.tick(dt, now);
    };

    let active = false;
    const setActive = (next: boolean) => {
      if (asStop && document.documentElement.dataset.pup) next = false;
      if (next !== active) {
        active = next;
        if (active) {
          lastTime = performance.now() / 1000;
          frame.update(tick, true);
        } else {
          cancelFrame(tick);
        }
      }
    };

    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting));
    observer.observe(container);

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        gaze = { x: e.clientX, y: e.clientY, t: performance.now() / 1000 };
      }
    };

    const onClick = () => {
      const now = performance.now() / 1000;
      rapidClicks = now - lastClickAt < 0.7 ? rapidClicks + 1 : 1;
      lastClickAt = now;
      const pool = pose === "peek" ? PEEK_POOL : pose === "snug" ? SNUG_POOL : null;
      const candidates = pool?.filter((t) => t !== lastTrick) ?? [];
      const trick = pool
        ? candidates[Math.floor(Math.random() * candidates.length)] ?? pool[0]
        : pickTrick(lastTrick, rapidClicks);
      lastTrick = trick;
      controller.reset();
      queue = TRICKS[trick](ctx, now);
      playingUntil = queue[queue.length - 1][0] + 0.4;
      lastIdleAt = now;
    };

    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        controller.petting(true);
        controller.wag(1);
      }
    };

    const onPointerLeave = () => {
      controller.petting(false);
      controller.wag(0.6);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    container.addEventListener("click", onClick);
    container.addEventListener("pointerenter", onPointerEnter);
    container.addEventListener("pointerleave", onPointerLeave);

    return () => {
      setActive(false);
      container.removeAttribute("data-playing");
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("click", onClick);
      container.removeEventListener("pointerenter", onPointerEnter);
      container.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [reduced, pose, facing, act, asStop]);

  return (
    <div
      ref={containerRef}
      className={`pup-buddy ${className}`}
      style={style}
      data-live={reduced ? undefined : ""}
      data-facing={facing}
    >
      <PupSvg key={String(reduced)} pose={pose} facing={facing} label={label} />
      <span ref={bubbleRef} aria-hidden="true" className="pup-bubble" data-show="false" />
    </div>
  );
}

export function PupStop({
  pose,
  facing = "right",
  act,
  behind = false,
  lane = false,
  className = "",
  style,
  label,
}: {
  pose: PupPose;
  facing?: "left" | "right";
  act?: string;
  behind?: boolean;
  lane?: boolean;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}) {
  return (
    <div
      data-pup-stop="true"
      data-pose={pose}
      data-facing={facing}
      data-act={act}
      data-behind={behind || undefined}
      data-lane={lane || undefined}
      className={`pup-stop ${className}`}
      style={style}
    >
      <PupBuddy pose={pose} facing={facing} label={label} asStop={true} />
    </div>
  );
}
