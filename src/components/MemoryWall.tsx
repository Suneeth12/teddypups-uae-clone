"use client";

import React from "react";
import Image from "next/image";
import type { FamilyGalleryItem } from "@/data/families-gallery";
import RevealScope from "@/components/RevealScope";
import { usePhotoViewer, ViewerPhoto } from "@/components/PhotoViewer";
import { PAW_PATH } from "@/components/pup-svg-paths";

const WALL_SIZES = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw";
const TILTS = [-2.2, 1.6, -0.9, 2.4, -1.5, 0.8, -2.6, 1.2] as const;
const TAPES = ["center", "left", "right", "corners", "center", "right", "left", "center"] as const;
const TAPE_COLORS = ["#f6d79a", "#f9cdbf", "#cfe5f6", "#f6d79a", "#e9dcc4"] as const;

interface MemoryWallProps {
  photos: FamilyGalleryItem[];
}

export default function MemoryWall({ photos }: MemoryWallProps) {
  const viewerPhotos: ViewerPhoto[] = React.useMemo(
    () =>
      photos.map((p) => ({
        id: String(p.idx),
        url: p.src,
        width: p.width,
        height: p.height,
        alt: p.alt || "A happy TeddyPups family with their new puppy",
        caption: p.caption || undefined,
        bgColor: p.bgColor,
      })),
    [photos]
  );

  const { open, viewer } = usePhotoViewer(viewerPhotos);

  return (
    <>
      <RevealScope>
        <ul className="tp-wall" aria-label="Photos from TeddyPups families">
          {photos.map((photo, idx) => {
            const tiltMatch = photo.tilt?.match(/--tilt:([^;]+)/);
            const tapeMatch = photo.tilt?.match(/--tape:([^;]+)/);
            const tiltVal = tiltMatch ? tiltMatch[1] : `${TILTS[idx % TILTS.length]}deg`;
            const tapeVal = tapeMatch ? tapeMatch[1] : TAPE_COLORS[idx % TAPE_COLORS.length];
            const isCorners =
              photo.tapeClass.includes("corners") ||
              photo.tapeClass.includes("tl") ||
              TAPES[idx % TAPES.length] === "corners";

            return (
              <li
                key={photo.idx}
                className="tp-wall__item"
                data-reveal="true"
                style={{ "--d": `${(idx % 4) * 60}ms` } as React.CSSProperties}
              >
                <button
                  type="button"
                  className="tp-wall__print"
                  onClick={() => open(idx)}
                  aria-label={`Open photo ${idx + 1} of ${photos.length}${photo.caption ? `: ${photo.caption}` : ""}`}
                >
                  <span
                    className="tp-polaroid"
                    style={
                      {
                        "--tilt": tiltVal,
                        "--tape": tapeVal,
                        "--i": idx,
                      } as React.CSSProperties
                    }
                  >
                    {isCorners ? (
                      <>
                        <span aria-hidden="true" className="tp-tape tp-tape--tl" />
                        <span aria-hidden="true" className="tp-tape tp-tape--tr" />
                      </>
                    ) : (
                      <span
                        aria-hidden="true"
                        className={photo.tapeClass || `tp-tape tp-tape--${TAPES[idx % TAPES.length]}`}
                      />
                    )}

                    <span className="tp-polaroid__photo">
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        width={photo.width}
                        height={photo.height}
                        sizes={WALL_SIZES}
                        loading={idx < 2 ? "eager" : "lazy"}
                        priority={idx < 2}
                        style={{
                          color: "transparent",
                          width: "100%",
                          height: "auto",
                          backgroundColor: photo.bgColor,
                        }}
                      />
                    </span>

                    <span className="tp-polaroid__caption font-scrawl">
                      {photo.caption || ""}
                    </span>
                  </span>

                  <svg viewBox="0 0 64 64" className="tp-wall__paw" aria-hidden="true" fill="currentColor">
                    <path d={PAW_PATH} />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      </RevealScope>

      {viewer}
    </>
  );
}
