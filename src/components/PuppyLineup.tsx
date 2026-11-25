"use client";

import React, { useState, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/media-queries";
import { PUPPIES } from "@/data/puppies";
import { PupStop } from "@/components/PupBuddy";
import { cuePup } from "@/components/PupActor";
import { PAW_PATH } from "@/components/pup-svg-paths";

const DOOR_COLORS = ["#a24a1a", "#5a3a28", "#d4893f", "#b8644a", "#7a4a2e"];

const STATUS_LABEL: Record<string, string> = {
  available: "Available",
  reserved: "Reserved",
  rehomed: "Gone home",
};

export default function PuppyLineup() {
  const pinRef = useRef<HTMLDivElement>(null);
  const hallRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const reducedMotion = useReducedMotion();
  const [maxScrollX, setMaxScrollX] = useState(0);
  const [isPinned, setIsPinned] = useState(false);

  const available = PUPPIES.filter((p) => p.status === "available");

  useLayoutEffect(() => {
    const measure = () => {
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      const pinned = desktop && !reducedMotion;
      setIsPinned(pinned);

      const track = trackRef.current;
      const hall = hallRef.current;
      if (hall && track && pinned) {
        const stage = hall.parentElement;
        if (stage) {
          const head = stage.querySelector<HTMLElement>(".tp-meet__head");
          const plates = Array.from(track.querySelectorAll<HTMLElement>(".tp-door__plate"));
          const plateMaxH = Math.max(64, ...plates.map((p) => p.offsetHeight));
          const floorH = hall.querySelector<HTMLElement>(".tp-meet__floor")?.offsetHeight ?? 0;
          const headH = head ? head.offsetTop + head.offsetHeight : 0;
          const doorW = Math.max(
            128,
            Math.min(
              256,
              window.innerWidth * 0.15,
              (stage.clientHeight - headH - floorH - plateMaxH - 40) / 1.3
            )
          );
          hall.style.setProperty("--door-w", `${doorW.toFixed(0)}px`);
        }
      } else {
        hall?.style.removeProperty("--door-w");
      }

      setMaxScrollX(track ? Math.max(0, track.scrollWidth - window.innerWidth) : 0);
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    if (hallRef.current?.parentElement) ro.observe(hallRef.current.parentElement);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [reducedMotion, isPinned]);

  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });

  const springProgress = useSpring(scrollYProgress, {
    stiffness: 170,
    damping: 32,
    mass: 0.35,
  });

  const x = useTransform(springProgress, [0, 1], [0, -maxScrollX]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!isPinned || !track) return;

    const sync = (val: number, shouldCue: boolean) => {
      hallRef.current?.style.setProperty("--floor-x", `${val.toFixed(1)}px`);
      const openThreshold = window.innerWidth * 0.36;
      for (const child of Array.from(track.children)) {
        const doorEl = child as HTMLElement;
        const isOpen = doorEl.offsetLeft + val < openThreshold;
        if ((doorEl.dataset.open === "true") !== isOpen) {
          doorEl.dataset.open = String(isOpen);
          if (isOpen && shouldCue) {
            cuePup({ look: doorEl, secs: 0.9 });
          }
        }
      }
    };

    sync(x.get(), false);
    return x.on("change", (val) => sync(val, true));
  }, [isPinned, x]);

  if (!available.length) return null;

  return (
    <section
      data-pup-scene="true"
      data-tone="light"
      aria-labelledby="meet-title"
      className="tp-scene tp-meet"
      data-pinned={isPinned || undefined}
      style={
        {
          "--sky-top": "#fff1d8",
          "--sky-bottom": "#fbe3b4",
        } as React.CSSProperties
      }
    >
      <div
        ref={pinRef}
        data-pin-range="true"
        style={
          {
            height: isPinned ? `calc(100vh + ${Math.round(0.8 * maxScrollX)}px)` : undefined,
            "--pinned": isPinned ? 1 : 0,
          } as React.CSSProperties
        }
      >
        <div className="tp-meet__stage">
          <header className="tp-meet__head gutter">
            <div>
              <h2 id="meet-title" className="font-plush text-huge">
                Meet the pups
              </h2>
              <p className="text-lede mt-3 max-w-[44ch] text-[var(--ink-soft)]">
                Real puppies, real photos, looking for their families right now.
              </p>
            </div>
            <Link href="/puppies" className="btn btn-primary shrink-0">
              See all available puppies
            </Link>
          </header>

          <div ref={hallRef} className="tp-meet__hall">
            <motion.ol
              ref={trackRef}
              style={isPinned ? { x } : undefined}
              className="tp-meet__track"
              data-treadmill="true"
              aria-label="Puppies looking for a family"
            >
              {available.map((puppy, index) => {
                const breedPrefix = puppy.name ? `${puppy.breed}, ` : "";
                const hasVid = puppy.hasVideo || puppy.media?.some((m) => m.kind === "video");
                const metaText = `${breedPrefix}${puppy.genderLabel.toLowerCase()}${puppy.age ? `, ${puppy.age}` : ""}${hasVid ? ", with video" : ""}`;

                return (
                  <li className="tp-door" data-open={isPinned ? "false" : "true"} key={puppy.id}>
                    <Link
                      href={`/puppies/${puppy.slug}`}
                      className="tp-door__link"
                      style={
                        {
                          "--door": DOOR_COLORS[index % DOOR_COLORS.length],
                        } as React.CSSProperties
                      }
                    >
                      <span className="tp-door__plate">
                        <span className="font-plush tp-door__name">
                          {puppy.displayName || puppy.name}
                        </span>
                        <span className="tp-door__meta">{metaText}</span>
                      </span>
                      <span className="tp-door__frame">
                        <span className="tp-door__room">
                          {puppy.cover && (
                            <Image
                              src={puppy.cover.url}
                              alt={puppy.cover.alt || puppy.displayName || puppy.name}
                              fill
                              sizes="(min-width: 1024px) 15rem, 44vw"
                              style={{
                                objectFit: "cover",
                                objectPosition:
                                  puppy.cover.focalX != null && puppy.cover.focalY != null
                                    ? `${(puppy.cover.focalX * 100).toFixed(1)}% ${(puppy.cover.focalY * 100).toFixed(1)}%`
                                    : "50% 50%",
                                backgroundColor: puppy.cover.color || undefined,
                              }}
                            />
                          )}
                        </span>
                        <span aria-hidden={true} className="tp-door__way">
                          <span className="tp-door__leaf">
                            <svg
                              viewBox="0 0 64 64"
                              className="tp-door__peephole"
                              aria-hidden="true"
                              fill="currentColor"
                            >
                              <path d={PAW_PATH} />
                            </svg>
                            <span className="tp-door__knob" />
                          </span>
                        </span>
                        <span className="tp-door__tag font-scrawl">
                          {STATUS_LABEL[puppy.status] ?? "Available"}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}

              <li className="tp-door tp-door--all" data-open="true">
                <Link href="/puppies" className="tp-door__link">
                  <span className="tp-door__frame tp-door__frame--all">
                    <span className="font-plush tp-door__all">Meet them all</span>
                  </span>
                </Link>
              </li>
            </motion.ol>

            <div aria-hidden={true} className="tp-meet__floor" />

            <PupStop
              pose={isPinned ? "walk" : "sit"}
              act={isPinned ? "treadmill" : undefined}
              className="tp-meet__teddy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
