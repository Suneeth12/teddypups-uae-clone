import { POSES, type PupController } from "./pup-kinematics";
import { TRICKS, pickTrick, type TrickCtx, type TrickName, type TrickStep } from "./pup-tricks";
import {
  ANCHOR,
  PUP_WIDTH,
  type JourneySample,
  type JourneyState,
  type SafeRect,
  type StopMeta,
} from "./pup-journey";

export function cuePup(detail: { look?: HTMLElement; secs?: number; say?: string }) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("pup:cue", { detail }));
  }
}

export const WALK_TRICKS = ["jump", "woof", "love", "sneeze"] as const;

export const pickOther = <T,>(items: readonly T[], exclude: T | null): T => {
  const pool = items.filter((item) => item !== exclude);
  return pool[Math.floor(Math.random() * pool.length)] ?? items[0];
};

export const setData = (el: HTMLElement, key: string, val: string) => {
  if (el.dataset[key] !== val) el.dataset[key] = val;
};

export interface LayoutMetrics {
  refresh: () => void;
  getLaneFloorY: () => number;
  getSafeRect: (j: JourneyState) => SafeRect;
}

export function createLayoutMetrics(rootEl: HTMLElement, headerEl: HTMLElement | null): LayoutMetrics {
  let clientW = rootEl.clientWidth;
  let headerH = headerEl?.offsetHeight ?? 76;
  let barTop: number | null = null;
  let barVisible = false;

  const refresh = () => {
    clientW = rootEl.clientWidth;
    headerH = headerEl?.offsetHeight ?? 76;
    const bar = document.querySelector("[data-whatsapp-bar]");
    const rect = bar?.getClientRects().length ? bar.getBoundingClientRect() : null;
    barVisible = Boolean(rect && rect.height);
    barTop = rect ? rect.top : null;
  };

  const getLaneFloorY = () => (barVisible && barTop !== null ? barTop : window.innerHeight - 6);

  const getSafeRect = (j: JourneyState): SafeRect => {
    const top = headerH + 10;
    if (j.lane) return { left: 10, top, right: clientW - 10, bottom: getLaneFloorY() + 40 };
    const effectiveBarTop = barTop ?? window.innerHeight;
    return { left: 10, top, right: clientW - 10, bottom: Math.min(window.innerHeight, effectiveBarTop) - 10 };
  };

  return { refresh, getLaneFloorY, getSafeRect };
}

export function buildWalkClickQueue(
  d: PupController,
  ctx: TrickCtx,
  now: number,
  lastTrick: string | null
): { trick: string; queue: TrickStep[] } {
  const choice = pickOther(WALK_TRICKS, lastTrick as (typeof WALK_TRICKS)[number] | null);
  if (choice === "jump") {
    return {
      trick: choice,
      queue: [
        [now, () => { d.hop(1.35); ctx.say(pickOther(["wheee!", "boing!", "yip!"], null)); }],
        [now + 0.5, () => d.hop(0.7)],
      ],
    };
  }
  if (choice === "woof") {
    return {
      trick: choice,
      queue: [
        [now, (t) => { d.woof(t); ctx.say("woof!"); }],
        [now + 0.4, (t) => d.woof(t)],
      ],
    };
  }
  if (choice === "love") {
    return {
      trick: choice,
      queue: [[now, () => { d.wag(1); d.hop(0.5); ctx.hearts(); ctx.say("I like you!"); }]],
    };
  }
  return {
    trick: choice,
    queue: [[now, (t) => { d.jolt(1.4); d.hop(0.4); d.yawn(t, 0.22); ctx.say("achoo!"); }]],
  };
}

export function pickHoldTrick(meta: StopMeta, lastTrick: string | null, rapidClicks: number): TrickName {
  if (meta.track) return pickOther(["woof", "hop", "love"] as const, lastTrick as TrickName | null);
  if (meta.act === "basket") {
    return pickOther(["tilt", "love", "sneeze", "woof"] as const, lastTrick as TrickName | null);
  }
  if (meta.pose === "peek") {
    return pickOther(["peekaboo", "woof", "tilt", "sneeze"] as const, lastTrick as TrickName | null);
  }
  const picked = pickTrick(lastTrick as TrickName | null, rapidClicks);
  return picked === "zoomies" ? "spin" : picked;
}

export function createInitialPeekabooQueue(
  now: number,
  firstMeta: StopMeta,
  getController: () => PupController | null,
  showBubble: (text: string, t: number, dur?: number) => void,
  setLookTarget: (next: { el: HTMLElement; until: number } | null) => void
): TrickStep[] {
  const ducked = { ...POSES.peek, headY: 120 };
  const friends = Array.from(firstMeta.scene?.querySelectorAll<HTMLElement>("[data-pup-friend]") ?? []);
  const firstFriend = friends[0];
  const lastFriend = friends[friends.length - 1];
  return [
    [now + 0.1, () => getController()?.setPose(ducked)],
    [
      now + 0.7,
      (t) => {
        getController()?.setPose("peek");
        getController()?.jolt(1.2);
        showBubble("peekaboo!", t, 1.6);
      },
    ],
    [now + 1.5, (t) => { if (firstFriend) setLookTarget({ el: firstFriend, until: t + 0.8 }); }],
    [now + 2.3, (t) => { if (lastFriend) setLookTarget({ el: lastFriend, until: t + 0.8 }); }],
    [now + 3.1, () => { setLookTarget(null); getController()?.wag(1); }],
  ];
}

export function stampPawPrint(
  paw: HTMLElement | undefined,
  opts: {
    stepNum: number;
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    s: number;
    facingDir: number;
    scrollY: number;
    dScroll: number;
    mainTop: number;
  }
) {
  if (!paw) return;
  const parity = 1 & opts.stepNum;
  const lateral = parity ? 186 : 110;
  const leftEdge = opts.x - ANCHOR.x * opts.s;
  const topEdge = opts.y - ANCHOR.y * opts.s;
  const px = leftEdge + (opts.facingDir > 0 ? lateral : PUP_WIDTH - lateral) * opts.s;
  const py = topEdge + 226 * opts.s + opts.scrollY - opts.mainTop + (parity ? -4 : 4) * opts.s;
  const angle = Math.atan2(opts.y - opts.prevY + opts.dScroll, opts.x - opts.prevX) + Math.PI / 2;
  const pawSize = 14 * Math.max(0.75, 1.5 * opts.s);
  paw.style.transform = `translate(${(px - pawSize / 2).toFixed(1)}px, ${(py - pawSize / 2).toFixed(1)}px) rotate(${angle.toFixed(3)}rad)`;
  paw.style.width = paw.style.height = `${pawSize.toFixed(1)}px`;
  paw.animate(
    [{ opacity: 0 }, { opacity: 0.45, offset: 0.08 }, { opacity: 0.45, offset: 0.5 }, { opacity: 0 }],
    { duration: 2600, easing: "ease-out" }
  );
}

export function runHoldTrick(
  chosen: TrickName,
  d: PupController,
  ctx: TrickCtx,
  now: number
): TrickStep[] {
  d.reset();
  return TRICKS[chosen](ctx, now);
}

export interface HoldLoopState {
  holdIdx: number;
  holdEnteredAt: number;
  lastIdleAt: number;
  queue: TrickStep[];
  lookTarget: { el: HTMLElement; until: number } | null;
  lastLookCycle: number;
  lookCycleIdx: number;
  prevTrackLeft: number | null;
  treadmillIdle: number;
  nextBasketAction: number;
}

export function stepHoldingBehavior(
  st: HoldLoopState,
  d: PupController,
  meta: StopMeta,
  k: number,
  s: number,
  dt: number,
  now: number,
  dScroll: number,
  gaze: { x: number; y: number; t: number } | null,
  makeTrickCtx: (m: StopMeta) => TrickCtx
) {
  if (st.holdIdx !== k) {
    st.queue = [];
    st.lookTarget = null;
    st.holdIdx = k;
    st.holdEnteredAt = now;
    st.lastIdleAt = now;
    st.prevTrackLeft = null;
    d.reset();
    d.setPose(meta.pose);
    d.face(meta.facing, 0.14);
    d.stride(0);
    d.wag(meta.act === "basket" ? 0.3 : 0.7);
    d.jolt(0.4);
    st.nextBasketAction = now + 2.4;
  }

  if (meta.track && !st.queue.length) {
    const trackLeft = meta.track.getBoundingClientRect().left;
    const dtTrack = st.prevTrackLeft === null ? 0 : trackLeft - st.prevTrackLeft;
    st.prevTrackLeft = trackLeft;
    d.walkedTo(-trackLeft / s);
    if (Math.abs(dtTrack) > 0.15) {
      st.treadmillIdle = 0;
      d.setPose("walk");
      d.stride(1);
      d.face(dtTrack < 0 ? 1 : -1, 0.16);
    } else if ((st.treadmillIdle += dt) > 0.25) {
      d.setPose("stand");
      d.stride(0);
    }
  }

  if (meta.act === "tilt" && !st.queue.length && now - st.holdEnteredAt > 1.2) {
    d.cock(Math.sin(0.9 * now) > 0.35 ? 13 : Math.sin(0.9 * now) < -0.35 ? -10 : 0);
  }

  if (meta.act === "basket" && !st.queue.length && now > st.nextBasketAction) {
    st.nextBasketAction = now + 4.5 + 3 * Math.random();
    if (Math.random() < 0.7) d.jolt(0.55);
    else d.yawn(now, 0.7);
  }

  const busyLooking = (st.lookTarget && st.lookTarget.until > now) || (gaze && now - gaze.t < 2.5);
  if (meta.looks.length && !busyLooking && now - st.holdEnteredAt > 0.8 && now - st.lastLookCycle > 1.7) {
    st.lastLookCycle = now;
    st.lookCycleIdx = (st.lookCycleIdx + 1) % (meta.looks.length + 1);
    if (st.lookCycleIdx < meta.looks.length) {
      st.lookTarget = { el: meta.looks[st.lookCycleIdx], until: now + 1.4 };
    }
  }

  if (Math.abs(dScroll) > 0.5) st.lastIdleAt = now;
  if (!st.queue.length && !meta.track && meta.act !== "basket" && now - st.lastIdleAt > 9) {
    st.lastIdleAt = now;
    st.queue =
      Math.random() < 0.55
        ? TRICKS.tilt(makeTrickCtx(meta), now)
        : [
            [now, () => d.wag(1)],
            [now + 2.4, () => d.wag(0.7)],
          ];
  }
}

export function isAirborneSample(journey: JourneyState, raw: JourneySample, scrollDir: number): boolean {
  let airborne = raw.airborne;
  if (journey.lane && raw.t > 0) {
    const fromStop = journey.stops[raw.k];
    const toStop = journey.stops[raw.k + 1];
    if (fromStop.sink && raw.t < 0.22) airborne = scrollDir > 0;
    else if (toStop?.sink && raw.t > 0.78) airborne = scrollDir < 0;
  }
  return airborne;
}

export interface WalkLoopState {
  stillTime: number;
  lastPawSeg: number;
  lastPawStep: number;
  pawIdx: number;
  laneWalkDist: number;
}

export function stepWalkingBehavior(
  st: WalkLoopState,
  hold: HoldLoopState,
  d: PupController,
  journey: JourneyState,
  raw: JourneySample,
  opts: {
    x: number;
    y: number;
    s: number;
    dt: number;
    now: number;
    sy: number;
    dScroll: number;
    scrollDir: number;
    inScreenLane: boolean;
    prevPos: { x: number; y: number } | null;
    pawEls: HTMLElement[];
    showBubble: (text: string, now: number, dur?: number) => void;
  }
) {
  if (hold.holdIdx !== -1) {
    hold.holdIdx = -1;
    hold.queue = [];
    d.reset();
  }
  const moveDist = opts.prevPos ? Math.hypot(opts.x - opts.prevPos.x, opts.y - opts.prevPos.y) : 0;
  st.stillTime = moveDist > 0.25 ? 0 : st.stillTime + opts.dt;

  if (isAirborneSample(journey, raw, opts.scrollDir)) {
    d.setPose("hop");
    d.stride(0);
  } else if (st.stillTime > 0.3) {
    d.setPose("stand");
    d.stride(0);
    if (st.stillTime > 2.6 && st.stillTime - opts.dt <= 2.6) opts.showBubble("coming?", opts.now);
  } else {
    d.setPose("walk");
    d.stride(1);
  }

  d.walkedTo((opts.inScreenLane ? (st.laneWalkDist += moveDist) : raw.walked) / Math.max(0.05, opts.s));

  if (opts.prevPos) {
    const dx = opts.x - opts.prevPos.x;
    if (Math.abs(dx) > 0.6 && Math.abs(dx) > 0.35 * Math.abs(opts.y - opts.prevPos.y)) {
      d.face(dx > 0 ? 1 : -1, 0.16);
    }
  }

  if (!journey.lane) {
    const stepNum = Math.floor(raw.walked / (34 * opts.s));
    if (st.lastPawSeg === raw.k && stepNum !== st.lastPawStep && !raw.airborne && opts.prevPos) {
      stampPawPrint(opts.pawEls[st.pawIdx++ % opts.pawEls.length], {
        stepNum,
        x: opts.x,
        y: opts.y,
        prevX: opts.prevPos.x,
        prevY: opts.prevPos.y,
        s: opts.s,
        facingDir: d.facingDir,
        scrollY: opts.sy,
        dScroll: opts.dScroll,
        mainTop: journey.mainTop,
      });
    }
    st.lastPawSeg = raw.k;
    st.lastPawStep = stepNum;
  }
}
