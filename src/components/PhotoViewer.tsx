"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

export interface ViewerPhoto {
  id: string;
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  caption?: string;
  bgColor?: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction * 70,
    rotate: direction * 5,
    scale: 0.92,
  }),
  center: {
    opacity: 1,
    x: 0,
    rotate: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 26,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction * -70,
    rotate: direction * -5,
    scale: 0.92,
    transition: { duration: 0.22 },
  }),
};

function targetViewerWidth(photo: ViewerPhoto): number {
  if (typeof window === "undefined") return 1200;
  const ratio = photo.width && photo.height ? photo.width / photo.height : 1;
  return Math.ceil(
    Math.min(window.innerWidth, Math.max(1, window.innerHeight - 150) * ratio)
  );
}

export function usePhotoViewer(photos: ViewerPhoto[]) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const total = photos.length;

  const clampIdx = useCallback(
    (idx: number) => ((idx % total) + total) % total,
    [total]
  );

  const goTo = useCallback(
    (idx: number, dir: number) => {
      setDirection(dir);
      setActiveIdx(clampIdx(idx));
    },
    [clampIdx]
  );

  const open = useCallback((idx: number) => {
    setDirection(1);
    setActiveIdx(idx);
    dialogRef.current?.showModal();
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
    setActiveIdx(null);
  }, []);

  useEffect(() => {
    if (activeIdx === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(activeIdx + 1, 1);
      if (e.key === "ArrowLeft") goTo(activeIdx - 1, -1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIdx, goTo]);

  const current = activeIdx !== null ? photos[activeIdx] : null;
  const neighborIndices =
    activeIdx !== null && total >= 2
      ? [...new Set([clampIdx(activeIdx - 1), clampIdx(activeIdx + 1)])]
      : [];

  const viewer = (
    <dialog
      ref={dialogRef}
      aria-label="Photo viewer"
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-cocoa/95 p-0 text-milk backdrop:bg-cocoa/70"
      onClose={() => setActiveIdx(null)}
      onClick={(e) => e.target === dialogRef.current && close()}
      data-lenis-prevent="true"
    >
      {current && activeIdx !== null && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <p className="font-scrawl text-lg">
              {activeIdx + 1} / {total}
              {current.caption ? ` — ${current.caption}` : ""}
            </p>
            <button
              type="button"
              onClick={close}
              className="h-11 rounded-full bg-milk px-5 font-semibold text-cocoa"
            >
              Close
            </button>
          </div>

          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={current.id || activeIdx}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 touch-pan-y"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(_e, info) => {
                  if (info.offset.x < -80) goTo(activeIdx + 1, 1);
                  else if (info.offset.x > 80) goTo(activeIdx - 1, -1);
                }}
              >
                <Image
                  src={current.url}
                  alt={current.alt || current.caption || "TeddyPups photo"}
                  fill
                  sizes={`${targetViewerWidth(current)}px`}
                  quality={75}
                  loading="eager"
                  className="object-contain"
                />
              </motion.div>
            </AnimatePresence>

            {neighborIndices.length > 0 && (
              <span aria-hidden="true" className="sr-only">
                {neighborIndices.map((neighborIdx) => {
                  const neighbor = photos[neighborIdx];
                  return (
                    <Image
                      key={neighbor.id || neighborIdx}
                      src={neighbor.url}
                      alt=""
                      fill
                      sizes={`${targetViewerWidth(neighbor)}px`}
                      quality={75}
                      loading="eager"
                    />
                  );
                })}
              </span>
            )}
          </div>

          <div className="flex justify-center gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
            <button
              type="button"
              onClick={() => goTo(activeIdx - 1, -1)}
              className="h-12 rounded-full border-2 border-milk px-6 font-semibold"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIdx + 1, 1)}
              className="h-12 rounded-full bg-honey px-6 font-semibold text-cocoa"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </dialog>
  );

  return { open, close, viewer };
}
