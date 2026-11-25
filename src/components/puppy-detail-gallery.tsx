"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Puppy, PuppyMedia } from "@/data/puppies";

const STAGE_SIZES = "(min-width: 1024px) 55vw, 92vw";

interface GalleryProps {
  puppy: Puppy;
  mediaList: PuppyMedia[];
  dominantColor: string;
}

export default function PuppyDetailGallery({ puppy, mediaList, dominantColor }: GalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const total = mediaList.length;
  const currentMedia = mediaList[activeIdx] || mediaList[0];

  const goTo = useCallback(
    (nextIndex: number) => {
      if (total <= 0) return;
      setDir(nextIndex > activeIdx ? 1 : -1);
      setActiveIdx(((nextIndex % total) + total) % total);
    },
    [activeIdx, total]
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(activeIdx + 1);
      if (e.key === "ArrowLeft") goTo(activeIdx - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, activeIdx, goTo]);

  if (!currentMedia) return null;

  const mediaLabel = (idx: number) =>
    `${puppy.displayName}, ${mediaList[idx].kind === "video" ? "video" : "photo"} ${idx + 1} of ${total}`;

  return (
    <div>
      <div className="tp-storypage relative aspect-[4/5] md:aspect-[5/6]">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.button
            key={currentMedia.id}
            type="button"
            custom={dir}
            className="absolute inset-0 block size-full"
            initial={{
              clipPath: dir > 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)",
              rotateY: -14 * dir,
              transformPerspective: 1400,
            }}
            animate={{
              clipPath: "inset(0% 0% 0% 0%)",
              rotateY: 0,
            }}
            exit={{
              opacity: 0.4,
              scale: 0.97,
            }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              transformOrigin: dir > 0 ? "0% 50%" : "100% 50%",
            }}
            onClick={() => {
              dialogRef.current?.showModal();
              setLightboxOpen(true);
            }}
            aria-label={`Open ${mediaLabel(activeIdx)} full screen`}
          >
            {currentMedia.kind === "video" ? (
              <video
                src={currentMedia.url}
                poster={currentMedia.poster?.url}
                className="size-full object-cover"
                muted
                loop
                playsInline
                autoPlay
                aria-label={currentMedia.alt || puppy.displayName}
              />
            ) : (
              <Image
                src={currentMedia.url}
                alt={currentMedia.alt || puppy.displayName}
                fill
                priority={activeIdx === 0}
                quality={85}
                sizes={STAGE_SIZES}
                style={{
                  objectFit: "cover",
                  objectPosition:
                    currentMedia.focalX != null && currentMedia.focalY != null
                      ? `${(currentMedia.focalX * 100).toFixed(1)}% ${(currentMedia.focalY * 100).toFixed(1)}%`
                      : "50% 50%",
                  backgroundColor: currentMedia.color || dominantColor,
                }}
              />
            )}
          </motion.button>
        </AnimatePresence>

        {total > 1 && (
          <div className="absolute inset-x-4 bottom-4 flex justify-between">
            <button
              type="button"
              onClick={() => goTo(activeIdx - 1)}
              className="grid size-12 place-items-center rounded-full border-2 border-cocoa bg-milk/95 text-xl font-bold"
              aria-label="Previous photo"
            >
              ‹
            </button>
            <span className="self-center rounded-full bg-cocoa/80 px-3 py-1 text-sm font-semibold text-milk">
              {activeIdx + 1} / {total}
            </span>
            <button
              type="button"
              onClick={() => goTo(activeIdx + 1)}
              className="grid size-12 place-items-center rounded-full border-2 border-cocoa bg-milk/95 text-xl font-bold"
              aria-label="Next photo"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {total > 1 && (
        <ul
          className="mt-3 flex gap-3 overflow-x-auto px-1 pb-2 pt-2 [scrollbar-width:thin]"
          aria-label={`All photos of ${puppy.displayName}`}
        >
          {mediaList.map((item, idx) => {
            const thumb = item.kind === "video" ? item.poster : item;
            return (
              <li key={item.id || idx} className="shrink-0">
                <button
                  type="button"
                  aria-label={mediaLabel(idx)}
                  aria-current={activeIdx === idx ? "true" : "false"}
                  onClick={() => goTo(idx)}
                  className={`relative block h-24 w-20 overflow-hidden rounded-[0.9rem] border-[3px] transition-transform duration-300 md:h-28 md:w-24 ${
                    activeIdx === idx
                      ? "-rotate-3 -translate-y-1 border-toffee-deep"
                      : "border-cocoa/30 hover:-rotate-2 hover:border-cocoa"
                  }`}
                >
                  {thumb && (
                    <Image
                      src={thumb.url}
                      alt=""
                      fill
                      sizes="96px"
                      loading="lazy"
                      style={{
                        objectFit: "cover",
                        objectPosition:
                          thumb.focalX != null && thumb.focalY != null
                            ? `${(thumb.focalX * 100).toFixed(1)}% ${(thumb.focalY * 100).toFixed(1)}%`
                            : "50% 50%",
                        backgroundColor: thumb.color || dominantColor,
                      }}
                    />
                  )}
                  {item.kind === "video" && (
                    <span className="absolute inset-0 grid place-items-center bg-cocoa/30 text-lg text-milk">
                      ▶
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        aria-label={`${puppy.displayName} photos`}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-cocoa/95 p-0 text-milk backdrop:bg-cocoa/70"
        data-lenis-prevent="true"
        onClose={() => setLightboxOpen(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        {lightboxOpen && currentMedia && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <p className="font-scrawl text-lg">{mediaLabel(activeIdx)}</p>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="h-11 rounded-full bg-milk px-5 font-semibold text-cocoa"
              >
                Close
              </button>
            </div>

            <div className="relative flex-1 touch-pan-y">
              <motion.div
                key={currentMedia.id}
                className="absolute inset-0"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) {
                    goTo(activeIdx + 1);
                  } else if (info.offset.x > 80) {
                    goTo(activeIdx - 1);
                  }
                }}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {currentMedia.kind === "video" ? (
                  <video
                    src={currentMedia.url}
                    poster={currentMedia.poster?.url}
                    controls
                    autoPlay
                    playsInline
                    className="size-full object-contain"
                  />
                ) : (
                  <Image
                    src={currentMedia.url}
                    alt={currentMedia.alt || puppy.displayName}
                    fill
                    sizes="100vw"
                    quality={85}
                    className="object-contain"
                  />
                )}
              </motion.div>
            </div>

            {total > 1 && (
              <div className="flex justify-center gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
                <button
                  type="button"
                  onClick={() => goTo(activeIdx - 1)}
                  className="h-12 rounded-full border-2 border-milk px-6 font-semibold"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => goTo(activeIdx + 1)}
                  className="h-12 rounded-full bg-honey px-6 font-semibold text-cocoa"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
