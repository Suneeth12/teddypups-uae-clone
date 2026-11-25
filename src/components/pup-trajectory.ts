export type Pt = { x: number; y: number };
export type SafeRect = { left: number; top: number; right: number; bottom: number };
export type PoseBox = [number, number, number, number];

export const ANCHOR: Pt = { x: 150, y: 228 };
export const PUP_WIDTH = 300;
export const DEFAULT_BOX: PoseBox = [48, 30, 288, 236];
export const POSE_BOXES: Record<string, PoseBox> = {
  sit: [50, 26, 284, 234],
  peek: [148, 34, 280, 163],
  snug: [148, 40, 280, 163],
  bow: [58, 56, 292, 236],
};
export const getPoseBox = (pose: string): PoseBox => POSE_BOXES[pose] ?? DEFAULT_BOX;

export const SINK_PEEK = ANCHOR.y - 159;
export const MOBILE_RATIO: [number, number] = [0.6, 0.86];
export const DESKTOP_RATIO: [number, number] = [0.42, 0.78];

export const clamp = (v: number) => Math.min(1, Math.max(0, v));
export const smoothstep = (v: number) => v * v * (3 - 2 * v);
export const smoothRange = (a: number, b: number, x: number) =>
  b === a ? +(x >= b) : smoothstep(clamp((x - a) / (b - a)));
export const interp = (from: number, to: number, t: number) => from + (to - from) * t;
export const interpBox = (a: PoseBox, b: PoseBox, t: number): PoseBox => [
  interp(a[0], b[0], t),
  interp(a[1], b[1], t),
  interp(a[2], b[2], t),
  interp(a[3], b[3], t),
];

export interface StopTrack {
  kind: "page" | "pin" | "screen";
  top: number;
  from?: number;
  to?: number;
}
export interface StopInfo {
  x: number;
  track: StopTrack;
  s: number;
  behind: boolean;
  sink: number;
  box: PoseBox;
}
export interface StopMeta {
  scene: HTMLElement | null;
  pose: string;
  facing: number;
  act: string;
  looks: HTMLElement[];
  track: HTMLElement | null;
}
export interface JourneyState {
  lane: boolean;
  stops: StopInfo[];
  meta: StopMeta[];
  holds: [number, number][];
  blend: number;
  mainTop: number;
}
export interface JourneySample {
  x: number;
  y: number;
  s: number;
  front: boolean;
  airborne: boolean;
  k: number;
  t: number;
  walked: number;
}

export function resolveStopPos(stop: StopInfo, scroll: number): Pt {
  const tr = stop.track;
  const top =
    tr.kind === "page"
      ? tr.top - scroll
      : tr.kind === "screen"
        ? tr.top
        : scroll < (tr.from ?? 0)
          ? tr.top - (scroll - (tr.from ?? 0))
          : scroll > (tr.to ?? 0)
            ? tr.top - (scroll - (tr.to ?? 0))
            : tr.top;
  return { x: stop.x + ANCHOR.x * stop.s, y: top + ANCHOR.y * stop.s };
}

export function findInterval(holds: [number, number][], scroll: number): { k: number; t: number } {
  if (!holds.length || scroll <= holds[0][1]) return { k: 0, t: 0 };
  for (let i = 0; i < holds.length - 1; i++) {
    const s = holds[i][1];
    const n = holds[i + 1][0];
    if (scroll < n) return { k: i, t: clamp((scroll - s) / Math.max(1, n - s)) };
    if (scroll <= holds[i + 1][1]) return { k: i + 1, t: 0 };
  }
  return { k: holds.length - 1, t: 0 };
}

const softMin = (val: number, min: number, k: number) => {
  const s = (val - min) / k;
  return s > 20 ? val : min + k * Math.log1p(Math.exp(s));
};
const softMax = (val: number, max: number, k: number) => -softMin(-val, -max, k);

export function softClampPos(x: number, y: number, s: number, box: PoseBox, safe: SafeRect, k = 8): Pt {
  const leftPad = (ANCHOR.x - box[0]) * s;
  const rightPad = (box[2] - ANCHOR.x) * s;
  const topPad = (ANCHOR.y - box[1]) * s;
  const bottomPad = (box[3] - ANCHOR.y) * s;

  const cx =
    safe.right - safe.left > leftPad + rightPad
      ? softMax(softMin(x, safe.left + leftPad, k), safe.right - rightPad, k)
      : (safe.left + safe.right) / 2 - (rightPad - leftPad) / 2;
  const cy =
    safe.bottom - safe.top > topPad + bottomPad
      ? softMax(softMin(y, safe.top + topPad, k), safe.bottom - bottomPad, k)
      : safe.bottom - bottomPad;

  return { x: cx, y: cy };
}

export function bezierPoint(p0: Pt, c1: Pt, c2: Pt, p1: Pt, t: number): Pt {
  const l = 1 - t;
  const r = l * l * l;
  const i = 3 * l * l * t;
  const o = 3 * l * t * t;
  const d = t * t * t;
  return {
    x: r * p0.x + i * c1.x + o * c2.x + d * p1.x,
    y: r * p0.y + i * c1.y + o * c2.y + d * p1.y,
  };
}

function computeBezierControls(from: Pt, to: Pt, safe: SafeRect) {
  const dx = to.x - from.x;
  const safeW = safe.right - safe.left;
  const lateral = Math.max(0.45 * Math.abs(dx), 0);
  const dir = dx >= 0 ? 1 : -1;
  let c1: Pt = { x: from.x + dir * lateral, y: from.y };
  let c2: Pt = { x: to.x - dir * lateral, y: to.y };
  const threshold = 0.14 * safeW;

  if (Math.abs(dx) < threshold) {
    const bulge =
      ((from.x + to.x) / 2 < (safe.left + safe.right) / 2 ? 1 : -1) *
      (threshold - Math.abs(dx)) *
      0.9;
    c1 = { x: c1.x + bulge, y: interp(from.y, to.y, 0.2) };
    c2 = { x: c2.x + bulge, y: interp(from.y, to.y, 0.8) };
  }

  const clampPt = (pt: Pt): Pt => ({
    x: Math.min(safe.right, Math.max(safe.left, pt.x)),
    y: Math.min(safe.bottom, Math.max(safe.top, pt.y)),
  });

  return { p0: from, c1: clampPt(c1), c2: clampPt(c2), p1: to };
}

function computeWalkedDist(p0: Pt, c1: Pt, c2: Pt, p1: Pt, t: number): number {
  let dist = 0;
  let prev = p0;
  const ct = clamp(t);
  const steps = Math.max(1, Math.ceil(32 * ct));
  for (let i = 1; i <= steps; i++) {
    const pt = bezierPoint(p0, c1, c2, p1, (i / steps) * ct);
    dist += Math.hypot(pt.x - prev.x, pt.y - prev.y);
    prev = pt;
  }
  return dist;
}

export function evaluateJourney(
  journey: JourneyState,
  scrollY: number,
  safe: SafeRect
): JourneySample {
  const { stops, holds, blend } = journey;
  const { k, t } = findInterval(holds, scrollY);

  if (t <= 0 || k >= stops.length - 1) {
    const stop = stops[k];
    const pos = resolveStopPos(stop, scrollY);
    const clamped = softClampPos(pos.x, pos.y, stop.s, stop.box, safe);
    return {
      x: clamped.x,
      y: clamped.y,
      s: stop.s,
      front: !stop.behind,
      airborne: false,
      k,
      t: 0,
      walked: 0,
    };
  }

  const fromStop = stops[k];
  const toStop = stops[k + 1];
  const holdEnd = holds[k][1];
  const nextStart = holds[k + 1][0];
  const span = Math.max(1, nextStart - holdEnd);
  const v = clamp((scrollY - holdEnd) / span);

  const pFrom = resolveStopPos(fromStop, holdEnd);
  const pTo = resolveStopPos(toStop, nextStart);
  const curve = computeBezierControls(
    { x: pFrom.x, y: pFrom.y - fromStop.sink * fromStop.s },
    { x: pTo.x, y: pTo.y - toStop.sink * toStop.s },
    safe
  );

  const w = v * v * v * (v * (6 * v - 15) + 10);
  const pt = bezierPoint(curve.p0, curve.c1, curve.c2, curve.p1, w);
  const scale = interp(fromStop.s, toStop.s, smoothstep(clamp(v / 0.65)));

  const blendFrac = Math.min(0.3, Math.max(0.06, blend / span));
  const wFrom = 1 - smoothRange(0, blendFrac, v);
  const wTo = smoothRange(1 - blendFrac, 1, v);
  let y =
    pt.y +
    wFrom * (resolveStopPos(fromStop, scrollY).y - pFrom.y) +
    wTo * (resolveStopPos(toStop, scrollY).y - pTo.y);
  const x = pt.x;

  y +=
    fromStop.sink * fromStop.s * (1 - smoothRange(0, 0.22, v)) +
    toStop.sink * toStop.s * smoothRange(0.78, 1, v);

  let airborne = false;
  if (fromStop.behind && v < 0.36) {
    y -= Math.sin((v / 0.36) * Math.PI) * Math.min(64 * fromStop.s, 72);
    airborne = v < 0.32;
  }
  if (toStop.behind && v > 0.68) {
    y -= Math.sin(((v - 0.68) / 0.32) * Math.PI) * Math.min(56 * toStop.s, 60);
    airborne = true;
  }
  if (fromStop.sink && v < 0.2) airborne = true;

  const front = !((fromStop.behind && v < 0.12) || (toStop.behind && v > 0.92));
  const box =
    v < 0.5
      ? interpBox(
          fromStop.box,
          DEFAULT_BOX,
          smoothRange(0, fromStop.sink ? 0.22 : fromStop.behind ? 0.36 : 0.06, v)
        )
      : interpBox(
          DEFAULT_BOX,
          toStop.box,
          smoothRange(toStop.sink ? 0.78 : toStop.behind ? 0.68 : 0.94, 1, v)
        );
  const clamped = softClampPos(x, y, scale, box, safe);

  return {
    x: clamped.x,
    y: clamped.y,
    s: scale,
    front,
    airborne,
    k,
    t: v,
    walked: computeWalkedDist(curve.p0, curve.c1, curve.c2, curve.p1, w),
  };
}

export function settleScroll(stops: StopInfo[], holds: [number, number][], scrollY: number): number {
  const { k, t } = findInterval(holds, scrollY);
  if (t <= 0 || k >= stops.length - 1) return scrollY;
  const fromStop = stops[k];
  const toStop = stops[k + 1];
  const outEnd = fromStop.sink ? 0.22 : fromStop.behind ? 0.36 : 0;
  const inStart = toStop.sink ? 0.78 : toStop.behind ? 0.68 : 1;
  let target = t;
  if (t < outEnd) target = t < outEnd / 2 ? 0 : outEnd;
  else if (t > inStart) target = t > (1 + inStart) / 2 ? 1 : inStart;
  return target === t ? scrollY : holds[k][1] + target * (holds[k + 1][0] - holds[k][1]);
}

export function computeHoldIntervals(
  rawHolds: [number, number][],
  minTravelDistances: number[],
  maxScroll: number
): [number, number][] {
  const intervals: [number, number][] = rawHolds.map(([s, e]) =>
    s <= e ? [s, e] : [(s + e) / 2, (s + e) / 2]
  );
  if (!intervals.length) return intervals;

  intervals[0][0] = -Infinity;
  const last = intervals[intervals.length - 1];
  last[1] = Infinity;
  last[0] = Math.min(last[0], maxScroll - 1);

  for (let i = 0; i < intervals.length - 1; i++) {
    const curr = intervals[i];
    const next = intervals[i + 1];

    if (next[0] < curr[1]) {
      const mid = (curr[1] + next[0]) / 2;
      curr[1] = Math.max(curr[0], mid);
      next[0] = Math.min(next[1], mid);
      if (next[0] < curr[1]) next[0] = curr[1];
    }

    let deficit = (minTravelDistances[i] ?? 0) - (next[0] - curr[1]);
    if (deficit > 0) {
      const currShrink = Math.min(deficit / 2, curr[1] - curr[0]);
      const nextShrink = Math.min(deficit / 2, next[1] - next[0]);
      curr[1] -= currShrink;
      next[0] += nextShrink;
      deficit -= currShrink + nextShrink;

      const nextExtra = Math.min(deficit, next[1] - next[0]);
      next[0] += nextExtra;
      deficit -= nextExtra;
      if (deficit > 0) curr[1] -= Math.min(deficit, curr[1] - curr[0]);
    }
  }

  for (const iv of intervals) {
    if (iv[1] < iv[0]) iv[1] = iv[0];
  }
  return intervals;
}
