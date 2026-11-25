"use client";

import React, { useEffect, useRef } from "react";
import { frame, cancelFrame } from "motion/react";
import { PupSvg, PAW_PATH } from "./pup-svg-paths";
import { POSES, PupController } from "./pup-kinematics";
import { spawnHearts } from "./pup-tricks";
import {
  ANCHOR,
  PUP_WIDTH,
  buildJourneyState,
  evaluateJourney,
  settleScroll,
  type JourneySample,
  type JourneyState,
  type StopMeta,
} from "./pup-journey";
import {
  buildWalkClickQueue,
  createInitialPeekabooQueue,
  createLayoutMetrics,
  pickHoldTrick,
  runHoldTrick,
  setData,
  stepHoldingBehavior,
  stepWalkingBehavior,
  type HoldLoopState,
  type WalkLoopState,
} from "./pup-behaviors";

export { cuePup } from "./pup-behaviors";

let activeTeardown: (() => void) | null = null;

export default function PupActor() {
  const probeRef = useRef<HTMLDivElement>(null);
  const printsRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const actorRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const bubbleAtRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    activeTeardown?.();
    const layer = layerRef.current;
    const actor = actorRef.current;
    const body = bodyRef.current;
    const bubbleAt = bubbleAtRef.current;
    const bubble = bubbleRef.current;
    const prints = printsRef.current;
    const probe = probeRef.current;
    if (!layer || !actor || !body || !bubbleAt || !bubble || !prints) return;

    const svg = body.querySelector("svg");
    if (!svg) return;

    const rootEl = document.documentElement;
    const metrics = createLayoutMetrics(rootEl, document.getElementById("site-header"));
    const pawEls = Array.from(prints.children) as HTMLElement[];

    let journey: JourneyState | null = null;
    let controller: PupController | null = null;
    let running = false;
    let bubbleUntil = 0;
    let gaze: { x: number; y: number; t: number } | null = null;

    let lastTime = performance.now() / 1000;
    let lastScrollY = window.scrollY;
    let prevPos: { x: number; y: number } | null = null;
    let currentSample: JourneySample | null = null;
    const offset = { x: 0, y: 0, s: 0 };

    const hold: HoldLoopState = {
      holdIdx: -1,
      holdEnteredAt: 0,
      lastIdleAt: 0,
      queue: [],
      lookTarget: null,
      lastLookCycle: 0,
      lookCycleIdx: -1,
      prevTrackLeft: null,
      treadmillIdle: 0,
      nextBasketAction: 0,
    };

    const walk: WalkLoopState = {
      stillTime: 0,
      lastPawSeg: -1,
      lastPawStep: 0,
      pawIdx: 0,
      laneWalkDist: 0,
    };
    let lastScrollMoved = performance.now() / 1000;
    let scrollDir = 1;
    let wasSettled = false;
    let laneSmooth: { x: number; y: number } | null = null;
    let prevLaneBase = 0;
    let layerTopOffset = 0;

    let rapidClicks = 0;
    let lastClickAt = 0;
    let lastTrick: string | null = null;
    let rebuildTimer: number | undefined;

    const showBubble = (text: string, now: number, dur = 1.4) => {
      bubble.textContent = text;
      bubble.dataset.show = "true";
      bubbleUntil = now + dur;
    };

    const sampleAt = (j: JourneyState, scroll: number): JourneySample => {
      if (j.lane) {
        const floorY = metrics.getLaneFloorY();
        for (const s of j.stops) {
          if (s.track.kind === "screen") s.track.top = floorY - 159 * s.s;
        }
      }
      return evaluateJourney(j, scroll, metrics.getSafeRect(j));
    };

    const makeTrickCtx = (meta: StopMeta) => ({
      d: controller!,
      rest: POSES[meta.pose] ?? POSES.sit,
      facing: meta.facing,
      say: (text: string, dur?: number) => showBubble(text, performance.now() / 1000, dur),
      hearts: () => {
        if (!currentSample || !controller) return;
        const hx =
          currentSample.x -
          ANCHOR.x * currentSample.s +
          (controller.facingDir > 0 ? 212 : PUP_WIDTH - 212) * currentSample.s;
        const hy = currentSample.y - (ANCHOR.y - 40) * currentSample.s - layerTopOffset;
        spawnHearts(layer, hx, hy);
      },
    });

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        gaze = { x: e.clientX, y: e.clientY, t: performance.now() / 1000 };
      }
    };

    const onCue = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const scene = hold.holdIdx >= 0 ? journey?.meta[hold.holdIdx]?.scene : null;
      if (!detail || !scene || (detail.look && !scene.contains(detail.look))) return;
      const now = performance.now() / 1000;
      if (detail.look) hold.lookTarget = { el: detail.look, until: now + (detail.secs ?? 1.6) };
      if (detail.say) showBubble(detail.say, now);
    };

    const onFocusIn = (e: FocusEvent) => {
      const target = e.target;
      if (target instanceof HTMLElement && target.matches("a, button, input, textarea, select, summary")) {
        hold.lookTarget = { el: target, until: performance.now() / 1000 + 1.4 };
      }
    };

    const onClick = () => {
      if (!controller || !journey) return;
      const now = performance.now() / 1000;
      rapidClicks = now - lastClickAt < 0.7 ? rapidClicks + 1 : 1;
      lastClickAt = now;
      hold.lastIdleAt = now;

      if (hold.holdIdx < 0) {
        const meta = journey.meta[Math.max(0, currentSample?.k ?? 0)];
        const result = buildWalkClickQueue(controller, makeTrickCtx(meta), now, lastTrick);
        lastTrick = result.trick;
        hold.queue = result.queue;
        return;
      }

      const meta = journey.meta[hold.holdIdx];
      const chosen = pickHoldTrick(meta, lastTrick, rapidClicks);
      if (chosen === "peekaboo" && hold.queue.length) return;
      lastTrick = chosen;
      hold.queue = runHoldTrick(chosen, controller, makeTrickCtx(meta), now);
    };

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && controller && hold.holdIdx >= 0) {
        controller.petting(true);
        controller.wag(1);
      }
    };

    const onLeave = () => {
      if (!controller) return;
      controller.petting(false);
      if (hold.holdIdx >= 0) {
        controller.wag(journey?.meta[hold.holdIdx]?.act === "basket" ? 0.3 : 0.7);
      }
    };

    const tick = () => {
      if (!journey || !controller) return;
      const now = performance.now() / 1000;
      const dt = Math.min(0.05, now - lastTime);
      lastTime = now;

      const sy = window.scrollY;
      const dScroll = sy - lastScrollY;
      lastScrollY = sy;
      if (Math.abs(dScroll) > 0.5) {
        lastScrollMoved = now;
        scrollDir = dScroll > 0 ? 1 : -1;
      }

      const d = controller;
      while (hold.queue.length && hold.queue[0][0] <= now) {
        hold.queue.shift()![1](now);
      }

      const effectiveScroll =
        now - lastScrollMoved > 0.25 ? settleScroll(journey.stops, journey.holds, sy) : sy;
      const raw = sampleAt(journey, effectiveScroll);
      const inScreenLane =
        journey.lane &&
        journey.stops[raw.k].track.kind === "screen" &&
        (raw.t > 0 ? journey.stops[raw.k + 1] : journey.stops[raw.k])?.track.kind === "screen";

      const decay = Math.exp(-dt / 0.28);
      offset.x *= decay;
      offset.y *= decay;
      offset.s *= decay;
      if (Math.abs(offset.x) < 0.05 && Math.abs(offset.y) < 0.05) offset.x = offset.y = 0;

      const isSettled = effectiveScroll !== sy;
      if (isSettled !== wasSettled && prevPos && !inScreenLane) {
        offset.x = prevPos.x - raw.x;
        offset.y = prevPos.y - raw.y;
      }
      wasSettled = isSettled;

      const s = raw.s + offset.s;
      let x = raw.x + offset.x;
      let y = raw.y + offset.y;
      const laneBase = journey.lane ? metrics.getLaneFloorY() : 0;
      let laneArrived = true;

      if (inScreenLane) {
        if (!laneSmooth) {
          laneSmooth = prevPos ? { x: prevPos.x, y: prevPos.y - prevLaneBase } : { x, y: y - laneBase };
        }
        const alpha = 1 - Math.exp(-dt / 0.14);
        laneSmooth.x += (x - laneSmooth.x) * alpha;
        laneSmooth.y += (y - laneBase - laneSmooth.y) * alpha;
        laneArrived = Math.hypot(x - laneSmooth.x, y - laneBase - laneSmooth.y) < 1.5;
        x = laneSmooth.x;
        y = laneBase + laneSmooth.y;
      } else if (laneSmooth) {
        offset.x = (prevPos?.x ?? x) - raw.x;
        offset.y = (prevPos?.y ?? y) - raw.y;
        x = raw.x + offset.x;
        y = raw.y + offset.y;
        laneSmooth = null;
      }

      prevLaneBase = laneBase;
      currentSample = { ...raw, x, y, s };
      setData(layer, "anchor", inScreenLane ? "bottom" : "top");
      layerTopOffset = inScreenLane ? layer.getBoundingClientRect().top : 0;

      const isHolding = raw.t === 0 && laneArrived;
      const k = raw.k;

      if (isHolding) {
        stepHoldingBehavior(hold, d, journey.meta[k], k, s, dt, now, dScroll, gaze, makeTrickCtx);
      } else {
        stepWalkingBehavior(walk, hold, d, journey, raw, {
          x, y, s, dt, now, sy, dScroll, scrollDir, inScreenLane, prevPos, pawEls, showBubble,
        });
      }

      prevPos = { x, y };
      journey.meta.forEach((m, idx) => {
        if (!m.scene) return;
        setData(m.scene, "here", String(isHolding && idx === k));
        setData(m.scene, "visited", String(idx <= k || (idx === k + 1 && raw.t > 0.92)));
      });

      if (hold.lookTarget && hold.lookTarget.until > now) {
        const rect = hold.lookTarget.el.getBoundingClientRect();
        d.lookAt({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      } else if (gaze && now - gaze.t < 2.5) {
        d.lookAt(gaze);
      } else {
        d.lookAt(null);
      }

      actor.style.transform = `translate3d(${(x - ANCHOR.x * s).toFixed(2)}px, ${(y - ANCHOR.y * s - layerTopOffset).toFixed(2)}px, 0)`;
      body.style.transform = `scale(${s.toFixed(4)})`;
      setData(layer, "front", String(raw.front));
      setData(actor, "holding", String(isHolding));

      if (bubble.dataset.show === "true") {
        if (now > bubbleUntil) bubble.dataset.show = "false";
        const bx = (d.facingDir > 0 ? 214 : PUP_WIDTH - 214) * s;
        bubbleAt.style.transform = `translate(${bx.toFixed(1)}px, ${(30 * s).toFixed(1)}px)`;
      }

      d.tick(dt, now);
    };

    const start = () => {
      if (running || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      metrics.refresh();
      const j = buildJourneyState(probe);
      if (!j) return;

      journey = j;
      running = true;
      rootEl.dataset.pup = j.lane ? "lane" : "live";
      layer.hidden = false;

      const firstMeta = j.meta[0];
      controller = new PupController(svg, firstMeta.pose, firstMeta.facing);
      lastScrollY = window.scrollY;
      prevPos = null;
      lastScrollMoved = lastTime = performance.now() / 1000;
      wasSettled = false;
      laneSmooth = null;

      const initial = sampleAt(j, window.scrollY);
      if (initial.k === 0 && initial.t === 0 && firstMeta.act === "peekaboo") {
        hold.holdIdx = 0;
        hold.holdEnteredAt = lastTime;
        hold.queue = createInitialPeekabooQueue(
          lastTime, firstMeta, () => controller, showBubble, (next) => { hold.lookTarget = next; }
        );
      } else {
        hold.holdIdx = -1;
      }

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pup:cue", onCue);
      window.addEventListener("focusin", onFocusIn);
      actor.addEventListener("click", onClick);
      actor.addEventListener("pointerenter", onEnter);
      actor.addEventListener("pointerleave", onLeave);
      frame.update(tick, true);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelFrame(tick);
      delete rootEl.dataset.pup;
      layer.hidden = true;
      delete layer.dataset.anchor;
      layerTopOffset = 0;
      journey?.meta.forEach((m) => {
        if (m.scene) {
          delete m.scene.dataset.here;
          delete m.scene.dataset.visited;
        }
      });
      journey = null;
      controller = null;
      hold.holdIdx = -1;
      hold.queue = [];
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pup:cue", onCue);
      window.removeEventListener("focusin", onFocusIn);
      actor.removeEventListener("click", onClick);
      actor.removeEventListener("pointerenter", onEnter);
      actor.removeEventListener("pointerleave", onLeave);
    };

    const scheduleRebuild = () => {
      clearTimeout(rebuildTimer);
      rebuildTimer = window.setTimeout(() => {
        if (!running || !journey) return;
        metrics.refresh();
        const next = buildJourneyState(probe);
        if (!next) {
          stop();
          return;
        }
        const prevSample = currentSample;
        const laneChanged = next.lane !== journey.lane;
        journey = next;
        rootEl.dataset.pup = next.lane ? "lane" : "live";
        if (laneChanged) hold.holdIdx = -1;
        if (prevSample) {
          const snapped = sampleAt(next, window.scrollY);
          offset.x = prevSample.x - snapped.x;
          offset.y = prevSample.y - snapped.y;
          offset.s = prevSample.s - snapped.s;
        }
      }, 120);
    };

    const ro = new ResizeObserver(scheduleRebuild);
    ro.observe(document.body);
    window.addEventListener("resize", scheduleRebuild);
    window.addEventListener("load", scheduleRebuild);
    window.visualViewport?.addEventListener("resize", metrics.refresh);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => (mq.matches ? stop() : start());
    mq.addEventListener("change", onMotionChange);

    start();
    document.fonts?.ready.then(scheduleRebuild);

    const teardown = () => {
      stop();
      clearTimeout(rebuildTimer);
      ro.disconnect();
      window.removeEventListener("resize", scheduleRebuild);
      window.removeEventListener("load", scheduleRebuild);
      window.visualViewport?.removeEventListener("resize", metrics.refresh);
      mq.removeEventListener("change", onMotionChange);
      if (activeTeardown === teardown) activeTeardown = null;
    };
    activeTeardown = teardown;
    return teardown;
  }, []);

  return (
    <>
      <div ref={probeRef} aria-hidden="true" className="pup-probe" />
      <div ref={printsRef} aria-hidden="true" className="pup-prints">
        {Array.from({ length: 24 }, (_, i) => (
          <svg key={i} viewBox="0 0 64 64">
            <path d={PAW_PATH} />
          </svg>
        ))}
      </div>
      <div ref={layerRef} aria-hidden="true" className="pup-layer" hidden data-front="true">
        <div ref={actorRef} className="pup-actor">
          <div ref={bodyRef} className="pup-actor__body">
            <PupSvg pose="peek" />
          </div>
          <span ref={bubbleAtRef} className="pup-bubble-at">
            <span ref={bubbleRef} className="pup-bubble" data-show="false" />
          </span>
        </div>
      </div>
    </>
  );
}
