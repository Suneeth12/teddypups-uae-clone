export { spawnHearts } from "./pup-tricks";
export {
  ANCHOR,
  DEFAULT_BOX,
  POSE_BOXES,
  PUP_WIDTH,
  bezierPoint,
  clamp,
  evaluateJourney,
  findInterval,
  getPoseBox,
  interp,
  interpBox,
  resolveStopPos,
  settleScroll,
  smoothRange,
  smoothstep,
  softClampPos,
  type JourneySample,
  type JourneyState,
  type PoseBox,
  type Pt,
  type SafeRect,
  type StopInfo,
  type StopMeta,
  type StopTrack,
} from "./pup-trajectory";

import {
  ANCHOR,
  DESKTOP_RATIO,
  MOBILE_RATIO,
  SINK_PEEK,
  computeHoldIntervals,
  getPoseBox,
  type JourneyState,
  type SafeRect,
  type StopInfo,
  type StopMeta,
  type StopTrack,
} from "./pup-trajectory";

export function buildJourneyState(probeEl: HTMLElement | null): JourneyState | null {
  const isMobile = window.matchMedia(
    "(max-width: 767px), (pointer: coarse) and (max-height: 519px)"
  ).matches;
  const clientW = document.documentElement.clientWidth;
  const stageH = probeEl?.getBoundingClientRect().height || window.innerHeight;
  const headerH = document.getElementById("site-header")?.offsetHeight ?? 76;
  const bar = document.querySelector("[data-whatsapp-bar]");
  const barH = bar?.getClientRects().length ? bar.getBoundingClientRect().height : 0;
  const safe: SafeRect = {
    left: 10,
    top: headerH + 10,
    right: clientW - 10,
    bottom: stageH - 10 - barH,
  };
  const mainEl = document.getElementById("main");

  const stops: StopInfo[] = [];
  const meta: StopMeta[] = [];
  const rawHolds: [number, number][] = [];

  const pushElementStop = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const pose = el.dataset.pose || "sit";
    const act = el.dataset.act ?? "";
    const rawScale = rect.width / 300;
    const scale = act === "basket" || isMobile ? rawScale : 1.12 * rawScale;
    const anchorPt = pose === "peek" ? { x: ANCHOR.x, y: 159 } : ANCHOR;

    let stickyParent: HTMLElement | null = null;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      if (window.getComputedStyle(p).position === "sticky") {
        stickyParent = p;
        break;
      }
    }

    let track: StopTrack;
    if (stickyParent) {
      const sTop = parseFloat(window.getComputedStyle(stickyParent).top) || 0;
      const stopOffsetInSticky = rect.top - stickyParent.getBoundingClientRect().top;
      const savedPos = stickyParent.style.position;
      stickyParent.style.position = "relative";
      const stickyStaticRect = stickyParent.getBoundingClientRect();
      const parentEl = stickyParent.parentElement;
      const parentBottom = parentEl
        ? parentEl.getBoundingClientRect().bottom -
          (parseFloat(window.getComputedStyle(parentEl).paddingBottom) || 0)
        : stickyStaticRect.bottom;
      stickyParent.style.position = savedPos;

      const from = stickyStaticRect.top + window.scrollY - sTop;
      const to = parentBottom + window.scrollY - stickyStaticRect.height - sTop;
      track =
        to <= from
          ? { kind: "page", top: stickyStaticRect.top + window.scrollY + stopOffsetInSticky }
          : { kind: "pin", top: sTop + stopOffsetInSticky, from, to };
    } else {
      track = { kind: "page", top: rect.top + window.scrollY };
    }

    if (track.kind !== "screen") track.top += anchorPt.y * (rawScale - scale);

    const info: StopInfo = {
      x: rect.left + anchorPt.x * (rawScale - scale),
      track,
      s: scale,
      behind: el.dataset.behind === "true",
      sink: 0,
      box: getPoseBox(pose),
    };
    const scene = el.closest<HTMLElement>("[data-pup-scene]");

    stops.push(info);
    meta.push({
      scene,
      pose,
      facing: el.dataset.facing === "left" ? -1 : 1,
      act,
      looks: scene ? Array.from(scene.querySelectorAll<HTMLElement>("[data-pup-look]")) : [],
      track: act === "treadmill" ? scene?.querySelector<HTMLElement>("[data-treadmill]") ?? null : null,
    });

    let hold: [number, number];
    if (info.track.kind === "pin") {
      hold = [info.track.from!, info.track.to!];
    } else {
      const stopTop = info.track.top;
      const boxTop = stopTop + info.box[1] * info.s;
      const boxBottom = stopTop + info.box[3] * info.s;
      const boxCenter = (boxTop + boxBottom) / 2;
      const vpHeight = safe.bottom - safe.top;
      const ratios = isMobile ? MOBILE_RATIO : DESKTOP_RATIO;
      let hStart = Math.max(boxCenter - (safe.top + ratios[1] * vpHeight), boxBottom - safe.bottom);
      let hEnd = Math.min(boxCenter - (safe.top + ratios[0] * vpHeight), boxTop - safe.top);
      if (hStart > hEnd) hStart = hEnd = boxCenter - (safe.top + vpHeight / 2);
      hold = [hStart, hEnd];
    }

    if (!isMobile && scene && info.track.kind === "page" && act !== "basket" && act !== "peekaboo") {
      const vpHeight = safe.bottom - safe.top;
      const cap = scene.getBoundingClientRect().top + window.scrollY - safe.top + 0.08 * vpHeight;
      const minStart = info.track.top + info.box[3] * info.s - safe.bottom;
      if (hold[1] > cap) {
        const end = Math.max(cap, minStart + 0.12 * vpHeight);
        hold = [Math.max(minStart, end - Math.max(hold[1] - hold[0], 0.2 * vpHeight)), end];
      }
    }
    rawHolds.push(hold);
  };

  const allStops = Array.from(document.querySelectorAll<HTMLElement>("[data-pup-stop]")).filter(
    (el) => el.getClientRects().length > 0
  );

  if (isMobile) {
    const laneStops = allStops.filter((el) => el.dataset.lane === "true");
    const first = laneStops[0];
    const last = laneStops.length > 1 ? laneStops[laneStops.length - 1] : undefined;
    if (first) pushElementStop(first);

    const firstScene = meta[0]?.scene ?? null;
    const midScenes = Array.from(document.querySelectorAll<HTMLElement>("#main [data-pup-scene]")).filter(
      (el) => el !== firstScene && el.getClientRects().length > 0
    );
    const laneScale = Math.min(0.62, Math.max(0.5, clientW / 650));
    const peekBox = getPoseBox("peek");

    midScenes.forEach((sc, idx) => {
      const isLeft = idx % 2 === 0;
      const x = isLeft ? safe.left + 2 - peekBox[0] * laneScale : safe.right - 2 - peekBox[2] * laneScale;
      stops.push({
        x,
        track: { kind: "screen", top: 0 },
        s: laneScale,
        behind: false,
        sink: SINK_PEEK,
        box: peekBox,
      });
      meta.push({
        scene: sc,
        pose: "peek",
        facing: isLeft ? 1 : -1,
        act: "lane",
        looks: [],
        track: null,
      });
      const r = sc.getBoundingClientRect();
      const hStart = r.top + window.scrollY - 0.42 * stageH;
      const hEnd = r.bottom + window.scrollY - 0.58 * stageH;
      rawHolds.push(hStart <= hEnd ? [hStart, hEnd] : [(hStart + hEnd) / 2, (hStart + hEnd) / 2]);
    });
    if (last) pushElementStop(last);
  } else {
    allStops.forEach(pushElementStop);
  }

  if (stops.length < 2) return null;

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const minTravelDistances = stops.slice(1).map((s, idx) => {
    const prev = stops[idx];
    const vert = (DESKTOP_RATIO[1] - DESKTOP_RATIO[0]) * stageH;
    const minD = (isMobile ? 0.32 : 0.5) * stageH;
    const horiz = Math.abs(s.x + ANCHOR.x * s.s - (prev.x + ANCHOR.x * prev.s));
    return Math.min(1.4 * stageH, Math.max(minD, 1.15 * Math.hypot(horiz, vert)));
  });

  const holds = computeHoldIntervals(rawHolds, minTravelDistances, maxScroll);

  return {
    lane: isMobile,
    stops,
    meta,
    holds,
    blend: 0.12 * stageH,
    mainTop: mainEl ? mainEl.getBoundingClientRect().top + window.scrollY : 0,
  };
}
