"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { TESTIMONIALS, FAMILY_PHOTOS } from "@/data/families";
import { FAMILY_GALLERY } from "@/data/families-gallery";
import { PupStop } from "@/components/PupBuddy";
import RevealScope from "@/components/RevealScope";
import { usePhotoViewer, ViewerPhoto } from "@/components/PhotoViewer";

const WALL_SIZES = "(min-width: 1024px) 18vw, (min-width: 640px) 28vw, 42vw";
const DELAYS = [3, 0, 5, 1, 6, 2, 7, 4];
const TILTS = [
  "-2.2deg",
  "1.6deg",
  "-0.9deg",
  "2.4deg",
  "-1.5deg",
  "0.8deg",
  "-2.6deg",
  "1.2deg",
];
const TAPES = ["#f6d79a", "#f9cdbf", "#cfe5f6", "#f6d79a", "#e9dcc4"];
const TAPE_PLACEMENTS = [
  "center",
  "left",
  "right",
  "corners",
  "center",
  "right",
  "left",
  "center",
] as const;

const WALL_PHOTOS = FAMILY_PHOTOS.slice(0, 8);
const FEATURED_URLS = new Set(WALL_PHOTOS.map((p) => p.url));
const ALL_VIEWER_PHOTOS: ViewerPhoto[] = [
  ...WALL_PHOTOS.map((p) => ({
    id: p.id,
    url: p.url,
    width: p.width,
    height: p.height,
    alt: p.alt,
    caption: p.caption,
    bgColor: p.color || undefined,
  })),
  ...FAMILY_GALLERY.filter((g) => !FEATURED_URLS.has(g.src)).map((g) => ({
    id: `gallery-${g.idx}`,
    url: g.src,
    width: g.width,
    height: g.height,
    alt: g.alt,
    caption: g.caption,
    bgColor: g.bgColor,
  })),
];

export default function FamilyReviews() {
  const primaryReview = TESTIMONIALS[0];
  const { open, viewer } = usePhotoViewer(ALL_VIEWER_PHOTOS);

  if (!WALL_PHOTOS.length) return null;

  return (
    <section
      data-pup-scene="true"
      data-tone="dark"
      aria-labelledby="dusk-title"
      className="tp-scene tp-dusk"
      style={
        {
          "--sky-top": "#a65a30",
          "--sky-bottom": "#4d2b19",
        } as React.CSSProperties
      }
    >
      <div className="tp-dusk__sky gutter">
        <div className="tp-dusk__head">
          <h2 id="dusk-title" className="font-plush text-huge">
            Happy families &amp; puppies
          </h2>
          <p className="text-lede mt-5 max-w-[50ch] text-[var(--ink-soft)]">
            We are truly honored to see our puppies become cherished members of
            loving families. These heartwarming moments have been shared by our
            valued clients who welcomed a Teddy Pup into their homes and hearts.
          </p>
        </div>

        <figure className="tp-dusk__note">
          <blockquote className="font-plush-text">
            “{primaryReview.quote}”
          </blockquote>
          <figcaption className="font-scrawl">
            {primaryReview.author}
            {primaryReview.location ? `, ${primaryReview.location}` : ""}
          </figcaption>
        </figure>
      </div>

      <div className="tp-photowall">
        <RevealScope className="tp-photowall__wall">
          <ul
            className="tp-photowall__prints"
            aria-label="Photos from TeddyPups families"
          >
            {WALL_PHOTOS.map((item, idx) => {
              const placement = TAPE_PLACEMENTS[idx % TAPE_PLACEMENTS.length];
              return (
                <li
                  key={item.id || idx}
                  data-reveal="true"
                  data-pup-look={idx === 1 || idx === 4 ? "" : undefined}
                  style={{ "--d": `${DELAYS[idx] * 110}ms` } as React.CSSProperties}
                >
                  <button
                    type="button"
                    className="tp-photowall__print"
                    aria-label={`Open photo ${idx + 1} of ${ALL_VIEWER_PHOTOS.length}${item.caption ? `: ${item.caption}` : ""}`}
                    onClick={() => open(idx)}
                  >
                    <span
                      className="tp-polaroid"
                      style={
                        {
                          "--tilt": TILTS[idx % TILTS.length],
                          "--tape": TAPES[idx % TAPES.length],
                          "--i": idx,
                        } as React.CSSProperties
                      }
                    >
                      {placement === "corners" ? (
                        <>
                          <span aria-hidden="true" className="tp-tape tp-tape--tl" />
                          <span aria-hidden="true" className="tp-tape tp-tape--tr" />
                        </>
                      ) : (
                        <span
                          aria-hidden="true"
                          className={`tp-tape tp-tape--${placement}`}
                        />
                      )}
                      <span className="tp-polaroid__photo">
                        <Image
                          src={item.url}
                          alt={item.alt || item.caption}
                          width={item.width}
                          height={item.height}
                          sizes={WALL_SIZES}
                          style={{
                            width: "100%",
                            height: "auto",
                            backgroundColor: item.color || undefined,
                          }}
                        />
                      </span>
                      <span className="tp-polaroid__caption font-scrawl">
                        {item.caption || item.alt}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="tp-facade__ground">
            <span aria-hidden={true} className="tp-facade__door" />
            <span aria-hidden={true} className="tp-lamp">
              <span className="tp-lamp__light" />
            </span>
            <Link
              href="/happy-families"
              className="btn btn-primary tp-facade__cta"
            >
              See every happy family
            </Link>

            <PupStop pose="sit" facing="right" className="tp-dusk__teddy" />
          </div>
        </RevealScope>

        <div aria-hidden="true" className="tp-street__pavement" />
      </div>

      {viewer}
    </section>
  );
}
