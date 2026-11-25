"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Puppy } from "@/data/puppies";

const SEAT_COORDS = [
  [9, 8.6, 0.62, -5],
  [22.5, 10.4, 0.8, 3],
  [35, 9.2, 0.7, -2],
  [65, 9.4, 0.74, 3],
  [77.5, 10.6, 0.82, -3],
  [91, 8.4, 0.6, 4],
];

const ROTATION_DELAYS = [1900, 2500, 1700, 2300, 2000, 2800, 1800];

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export interface HeroLineupProps {
  friends: Puppy[];
}

export function HeroLineup({ friends }: HeroLineupProps) {
  const seatCount = Math.min(SEAT_COORDS.length, friends.length);
  const [activeSeats, setActiveSeats] = useState<number[]>(() =>
    friends.slice(0, seatCount).map((_, idx) => idx)
  );
  const [animState, setAnimState] = useState<Record<number, "duck" | "pop" | undefined>>({});
  const [activeTag, setActiveTag] = useState<number | null>(null);
  const [hoverTag, setHoverTag] = useState<number | null>(null);
  const [preloadIndex, setPreloadIndex] = useState<number | null>(
    friends.length > seatCount ? seatCount : null
  );

  const lineupRef = useRef<HTMLUListElement>(null);
  const wingsRef = useRef<HTMLSpanElement>(null);
  const seatsRef = useRef(activeSeats);

  useEffect(() => {
    seatsRef.current = activeSeats;
  }, [activeSeats]);

  useEffect(() => {
    const el = lineupRef.current;
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!el || !seatCount || reducedMotion) return;

    const hasPool = friends.length > seatCount;
    const scene = el.closest("[data-pup-scene]") as HTMLElement | null;
    let isIntersecting = true;
    let pauseUntil = 0;
    let isAlive = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
      },
      { threshold: 0.35 }
    );
    observer.observe(el);

    const bumpPause = () => {
      pauseUntil = performance.now() + 1200;
    };
    addEventListener("scroll", bumpPause, { passive: true });
    addEventListener("pointerdown", bumpPause, { passive: true });
    el.addEventListener("pointerover", bumpPause, { passive: true });

    const bench = friends.map((_, i) => i).filter((i) => !seatsRef.current.includes(i));
    let pool = bench.includes(seatCount)
      ? [seatCount, ...shuffle(bench.filter((i) => i !== seatCount))]
      : shuffle(bench);

    let seatQueue: number[] = [];
    let lastRotatedSeat = -1;
    let rotationStep = 0;
    const timeouts = new Set<ReturnType<typeof setTimeout>>();
    const schedule = (fn: () => void, delayMs: number) => {
      if (!isAlive) return;
      const id = setTimeout(() => {
        timeouts.delete(id);
        if (isAlive) fn();
      }, delayMs);
      timeouts.add(id);
    };
    let retryCount = 0;

    const checkNextReady = () => {
      if (!isAlive) return;
      if (
        document.hidden ||
        !isIntersecting ||
        performance.now() < pauseUntil ||
        scene?.dataset.here === "false"
      ) {
        return schedule(checkNextReady, 900);
      }

      if (!hasPool) {
        return rotateSeat();
      }

      if (!pool.length) {
        pool = shuffle(
          friends.map((_, i) => i).filter((i) => !seatsRef.current.includes(i))
        );
      }

      const img =
        wingsRef.current?.dataset.for === String(pool[0])
          ? wingsRef.current.querySelector("img")
          : null;

      if (!img || !img.complete || !img.naturalWidth) {
        if (++retryCount < 15) {
          return schedule(checkNextReady, 400);
        } else {
          pool.push(pool.shift()!);
          setPreloadIndex(pool[0] ?? null);
          retryCount = 0;
          return schedule(checkNextReady, 800);
        }
      }

      retryCount = 0;
      img.decode().then(rotateSeat, rotateSeat);
    };

    const rotateSeat = () => {
      if (!isAlive) return;
      if (!seatQueue.length) {
        seatQueue = shuffle(
          [...el.children]
            .map((c, idx) => (c.getClientRects().length ? idx : -1))
            .filter((idx) => idx >= 0)
        ).filter((idx, pos, arr) => pos !== 0 || idx !== lastRotatedSeat || arr.length <= 1);
      }

      const seatIdx = seatQueue.shift();
      if (seatIdx === undefined) {
        return schedule(checkNextReady, 2000);
      }

      lastRotatedSeat = seatIdx;
      const nextPupIdx = hasPool ? pool.shift()! : seatsRef.current[seatIdx];

      setAnimState((prev) => ({ ...prev, [seatIdx]: "duck" }));

      schedule(() => {
        if (hasPool) {
          const departingIdx = seatsRef.current[seatIdx];
          setActiveSeats((prev) =>
            prev.map((val, idx) => (idx === seatIdx ? nextPupIdx : val))
          );
          pool.push(departingIdx);
          setPreloadIndex(pool[0] ?? null);
        }

        setAnimState((prev) => ({ ...prev, [seatIdx]: "pop" }));
        setActiveTag(seatIdx);

        schedule(() => {
          setActiveTag((prev) => (prev === seatIdx ? null : prev));
        }, 1800);

        schedule(() => {
          setAnimState((prev) => ({ ...prev, [seatIdx]: undefined }));
        }, 700);
      }, 360);

      schedule(
        checkNextReady,
        ROTATION_DELAYS[rotationStep++ % ROTATION_DELAYS.length]
      );
    };

    if (hasPool) {
      setPreloadIndex(pool[0] ?? null);
    }

    const peekAnims = [...el.querySelectorAll(".tp-lineup__pup")]
      .flatMap((pup) => pup.getAnimations())
      .filter((anim) => (anim as CSSAnimation).animationName === "tp-peek");

    const kickstart = () => {
      if (isAlive) schedule(checkNextReady, 250);
    };

    if (peekAnims.length) {
      Promise.all(peekAnims.map((a) => a.finished)).then(kickstart, kickstart);
    } else {
      kickstart();
    }

    return () => {
      isAlive = false;
      timeouts.forEach(clearTimeout);
      timeouts.clear();
      observer.disconnect();
      removeEventListener("scroll", bumpPause);
      removeEventListener("pointerdown", bumpPause);
      el.removeEventListener("pointerover", bumpPause);
    };
  }, [friends, seatCount]);

  if (!seatCount) return null;

  const getSeatStyle = (index: number): React.CSSProperties => {
    const [x, w, peek, tilt] = SEAT_COORDS[index];
    return {
      "--x": `${x}%`,
      "--w": `${w}rem`,
      "--peek": peek,
      "--tilt": `${tilt}deg`,
      "--i": index,
    } as React.CSSProperties;
  };

  const handlePointerLeave = (seatIdx: number) => () => {
    setHoverTag((prev) => (prev === seatIdx ? null : prev));
  };

  return (
    <>
      <ul
        ref={lineupRef}
        className="tp-lineup"
        aria-label="Some of the puppies in our showroom"
      >
        {activeSeats.map((friendIdx, seatIdx) => {
          const pup = friends[friendIdx];
          if (!pup) return null;
          return (
            <li
              key={seatIdx}
              className="tp-lineup__seat"
              style={getSeatStyle(seatIdx)}
            >
              <Link
                href={`/puppies/${pup.slug}`}
                className="tp-lineup__pup"
                data-pup-friend="true"
                data-state={animState[seatIdx]}
                aria-label={`Meet ${pup.displayName}, ${pup.breed}`}
                onPointerEnter={() => setHoverTag(seatIdx)}
                onPointerLeave={handlePointerLeave(seatIdx)}
                onFocus={() => setHoverTag(seatIdx)}
                onBlur={handlePointerLeave(seatIdx)}
              >
                <span className="tp-lineup__photo">
                  {pup.cover && (
                    <Image
                      key={pup.id}
                      src={pup.cover.url}
                      alt={pup.cover.alt || pup.displayName}
                      fill
                      sizes="11rem"
                      loading={seatIdx < 2 ? undefined : "eager"}
                      priority={seatIdx < 2}
                      style={{
                        objectFit: "cover",
                        objectPosition:
                          pup.cover.focalX != null && pup.cover.focalY != null
                            ? `${(pup.cover.focalX * 100).toFixed(1)}% ${(pup.cover.focalY * 100).toFixed(1)}%`
                            : "50% 50%",
                        backgroundColor: pup.cover.color || undefined,
                      }}
                    />
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <ul aria-hidden="true" className="tp-lineup tp-lineup--tags">
        {activeSeats.map((friendIdx, seatIdx) => {
          const pup = friends[friendIdx];
          if (!pup) return null;
          const isShowing = activeTag === seatIdx || hoverTag === seatIdx;
          return (
            <li
              key={seatIdx}
              className="tp-lineup__seat"
              style={getSeatStyle(seatIdx)}
            >
              <span
                className="tp-lineup__ghost"
                data-state={animState[seatIdx]}
                data-tag={isShowing ? "show" : undefined}
              >
                <span className="tp-lineup__name font-scrawl">
                  {pup.displayName}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      {preloadIndex !== null && friends[preloadIndex]?.cover && (
        <span
          ref={wingsRef}
          aria-hidden="true"
          className="tp-lineup__wings"
          data-for={preloadIndex}
        >
          <Image
            key={friends[preloadIndex].id}
            src={friends[preloadIndex].cover!.url}
            alt=""
            fill
            sizes="11rem"
            loading="eager"
            style={{
              objectFit: "cover",
              objectPosition:
                friends[preloadIndex].cover!.focalX != null &&
                friends[preloadIndex].cover!.focalY != null
                  ? `${(friends[preloadIndex].cover!.focalX! * 100).toFixed(1)}% ${(friends[preloadIndex].cover!.focalY! * 100).toFixed(1)}%`
                  : "50% 50%",
              backgroundColor: friends[preloadIndex].cover!.color || undefined,
            }}
          />
        </span>
      )}
    </>
  );
}
