import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Puppy } from "@/data/puppies";
import { PAW_PATH } from "./pup-svg-paths";

export { PAW_PATH };

export const WASH_COLORS = ["#f2be6b", "#f9cdbf", "#bfddf5", "#fbe3b4", "#e8c39a"];
export const INK_COLORS = ["#c2622b", "#a24a1a", "#2a170e", "#d4893f"];
export const DOODLE_KINDS = ["sparkle", "heart", "dashes", "swirl", "dots", "paw"];

export const STATUS_LABEL: Record<string, string> = {
  available: "Available",
  reserved: "Reserved",
  rehomed: "Gone home",
  "gone-home": "Gone home",
};

const DEFAULT_SIZES =
  "(min-width: 1536px) 17rem, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw";

export function buildSketchMaskUrl(mask: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${mask}" fill="#000"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function getSeededRandom(slug: string) {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h = Math.imul(h ^ slug.charCodeAt(i), 16777619);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 1831565813) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateWobblePoints(
  rng: () => number,
  radius: number,
  variance: number,
  steps = 40,
  startAngle = 0,
  arcLength = Math.PI * 2
) {
  const seeds = [rng() * 6.28, rng() * 6.28, rng() * 6.28];
  const squish = 1 + (rng() - 0.5) * 0.05;
  const points: [number, number][] = [];
  for (let i = 0; i < steps; i++) {
    const angle =
      startAngle +
      (i / (arcLength >= Math.PI * 2 ? steps : steps - 1)) * arcLength;
    const r =
      radius +
      variance *
        (Math.sin(angle * 2 + seeds[0]) * 0.55 +
          Math.sin(angle * 3 + seeds[1]) * 0.3 +
          Math.sin(angle * 5 + seeds[2]) * 0.15);
    points.push([
      50 + Math.cos(angle) * r * squish,
      50 + (Math.sin(angle) * r) / squish,
    ]);
  }
  return points;
}

export function pointsToPath(points: [number, number][], close = true) {
  const len = points.length;
  const p = (v: number) => v.toFixed(2);
  const getPoint = (idx: number) =>
    points[close ? (idx + len) % len : Math.min(len - 1, Math.max(0, idx))];

  let path = `M${p(points[0][0])} ${p(points[0][1])}`;
  const total = close ? len : len - 1;
  for (let i = 0; i < total; i++) {
    const p0 = getPoint(i - 1);
    const p1 = getPoint(i);
    const p2 = getPoint(i + 1);
    const p3 = getPoint(i + 2);
    const cp1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const cp2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    path += `C${p(cp1[0])} ${p(cp1[1])} ${p(cp2[0])} ${p(cp2[1])} ${p(
      p2[0]
    )} ${p(p2[1])}`;
  }
  return close ? `${path}Z` : path;
}

export function computeCardSketch(slug: string) {
  const rng = getSeededRandom(slug);
  const mask = pointsToPath(generateWobblePoints(rng, 45.5, 2.6), true);
  const outline = pointsToPath(generateWobblePoints(rng, 47.8, 3.1), true);
  const retraceStart = rng() * Math.PI * 2;
  const retrace = pointsToPath(
    generateWobblePoints(
      rng,
      49,
      3.4,
      30,
      retraceStart,
      Math.PI * (1.15 + rng() * 0.5)
    ),
    false
  );
  const wash = {
    d: pointsToPath(generateWobblePoints(rng, 46.5, 3.6), true),
    dx: (rng() - 0.5) * 9,
    dy: 3 + rng() * 4,
    color: WASH_COLORS[Math.floor(rng() * WASH_COLORS.length)],
  };
  const tilt = (rng() - 0.5) * 5;
  const sectorPairs = [
    [0.86, 1.08],
    [1.16, 1.42],
    [-0.08, 0.16],
  ]
    .map((z) => ({ z, k: rng() }))
    .sort((a, b) => a.k - b.k)
    .map((s) => s.z);

  const numDoodles = 2 + Math.floor(rng() * 2);
  const doodles: Array<{
    kind: string;
    x: number;
    y: number;
    rot: number;
    size: number;
    ink: string;
  }> = [];
  const usedDoodles = new Set<string>();

  for (let i = 0; i < numDoodles; i++) {
    let kind = DOODLE_KINDS[Math.floor(rng() * DOODLE_KINDS.length)];
    if (usedDoodles.has(kind)) {
      kind = DOODLE_KINDS.find((k) => !usedDoodles.has(k)) || kind;
    }
    usedDoodles.add(kind);
    const [start, end] = sectorPairs[i];
    const angle = Math.PI * (start + rng() * (end - start));
    const dist = 55 + rng() * 4;
    doodles.push({
      kind,
      x: 50 + Math.cos(angle) * dist,
      y: 50 + Math.sin(angle) * dist,
      rot: (rng() - 0.5) * 50,
      size: 0.85 + rng() * 0.35,
      ink: INK_COLORS[Math.floor(rng() * INK_COLORS.length)],
    });
  }

  return { mask, outline, retrace, wash, tilt, doodles };
}

export function Doodle({
  d,
}: {
  d: {
    kind: string;
    x: number;
    y: number;
    rot: number;
    size: number;
    ink: string;
  };
}) {
  const transform = `translate(${d.x.toFixed(1)} ${d.y.toFixed(
    1
  )}) rotate(${d.rot.toFixed(0)}) scale(${d.size.toFixed(2)})`;
  const strokeProps = {
    fill: "none",
    stroke: d.ink,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <g transform={transform}>
      <g className="tp-sketch__doodle">
        {d.kind === "sparkle" && (
          <path
            d="M0 -6c.6 3.6 2.4 5.4 6 6-3.6.6-5.4 2.4-6 6-.6-3.6-2.4-5.4-6-6 3.6-.6 5.4-2.4 6-6z"
            fill={d.ink}
          />
        )}
        {d.kind === "heart" && (
          <path
            d="M0 5C-4.6 1.8-6.4-.8-6.4-3.2c0-1.9 1.5-3.3 3.3-3.3 1.3 0 2.4.7 3.1 1.9.7-1.2 1.8-1.9 3.1-1.9 1.8 0 3.3 1.4 3.3 3.3C6.4-.8 4.6 1.8 0 5z"
            fill="none"
            stroke={d.ink}
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {d.kind === "dashes" && (
          <path d="M-5 -5l4 2M-6 0h5M-5 5l4 -2" {...strokeProps} />
        )}
        {d.kind === "swirl" && (
          <path
            d="M0 0c1.6-.6 2.4 1.4.8 2.6-2 1.4-4.6-.4-4-3 .7-3 4.8-3.8 6.8-1.2 2.4 3-0.2 7.4-3.8 7.2"
            {...strokeProps}
          />
        )}
        {d.kind === "dots" && (
          <g fill={d.ink}>
            <circle cx="-4" cy="1" r="1.2" />
            <circle cx="0" cy="-2" r="1.2" />
            <circle cx="4" cy="1" r="1.2" />
          </g>
        )}
        {d.kind === "paw" && (
          <path
            d={PAW_PATH}
            transform="scale(.17) translate(-32 -34)"
            fill={d.ink}
            opacity={0.85}
          />
        )}
      </g>
    </g>
  );
}

export function PuppySketchCard({
  pup,
  index = 0,
  sizes = DEFAULT_SIZES,
  preload,
  small = false,
}: {
  pup: Puppy;
  index?: number;
  sizes?: string;
  preload?: boolean;
  small?: boolean;
}) {
  const sketch = useMemo(() => computeCardSketch(pup.slug), [pup.slug]);
  const hasVideo = pup.media?.some((m) => m.kind === "video");
  const maskStyle = useMemo(() => buildSketchMaskUrl(sketch.mask), [sketch.mask]);
  const statusLabel = STATUS_LABEL[pup.status] ?? "Available";
  const isPriority = preload ?? index < 3;

  return (
    <Link
      href={`/puppies/${pup.slug}`}
      className={`tp-sketch${small ? " tp-sketch--small" : ""}`}
      data-reveal="true"
      style={
        {
          "--tilt": `${sketch.tilt.toFixed(2)}deg`,
          "--d": `${(index % 8) * 70}ms`,
          "--wash": sketch.wash.color,
        } as React.CSSProperties
      }
      aria-label={`${pup.displayName}${pup.name ? `, ${pup.breed}` : ""}, ${pup.genderLabel.toLowerCase()}${
        pup.age ? `, ${pup.age}` : ""
      }, ${statusLabel.toLowerCase()}`}
    >
      <span className="tp-sketch__frame">
        <svg
          aria-hidden={true}
          viewBox="0 0 100 100"
          className="tp-sketch__wash"
          style={{
            translate: `${sketch.wash.dx.toFixed(1)}% ${sketch.wash.dy.toFixed(1)}%`,
          }}
        >
          <path d={sketch.wash.d} />
        </svg>

        <span
          className="tp-sketch__photo"
          style={{
            maskImage: maskStyle,
            WebkitMaskImage: maskStyle,
          }}
        >
          {pup.cover && (
            <Image
              src={pup.cover.url}
              alt=""
              fill
              sizes={sizes}
              priority={isPriority}
              loading={isPriority ? "eager" : "lazy"}
              style={{
                objectFit: "cover",
                objectPosition:
                  pup.cover.focalX != null && pup.cover.focalY != null
                    ? `${(pup.cover.focalX * 100).toFixed(1)}% ${(pup.cover.focalY * 100).toFixed(1)}%`
                    : "50% 50%",
                backgroundColor: pup.cover.color || "#785838",
              }}
            />
          )}
        </span>

        <svg aria-hidden={true} viewBox="0 0 100 100" className="tp-sketch__ink">
          <path d={sketch.outline} pathLength={1} className="tp-sketch__line" />
          <path d={sketch.retrace} pathLength={1} className="tp-sketch__line tp-sketch__line--retrace" />
          {sketch.doodles.map((d, i) => (
            <Doodle d={d} key={i} />
          ))}
        </svg>

        {!small && (
          <span className="tp-sketch__sticker font-scrawl">{statusLabel}</span>
        )}
        {hasVideo && !small && <span className="tp-sketch__video">▶ video</span>}
        {small && (
          <span className="tp-sketch__sticker tp-sketch__sticker--home font-scrawl">
            gone home ♥
          </span>
        )}
      </span>

      <span className="tp-sketch__name font-plush">{pup.displayName}</span>
      {!small && (
        <span className="tp-sketch__meta">
          {pup.name ? `${pup.breed} · ` : ""}
          {pup.genderLabel.toLowerCase()}
          {pup.age ? ` · ${pup.age}` : ""}
        </span>
      )}
    </Link>
  );
}
