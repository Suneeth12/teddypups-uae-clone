"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { buildSketchMaskUrl, computeCardSketch, Doodle } from "./puppy-card-sketch";
import RevealScope from "@/components/RevealScope";

interface GonePup {
  id: string;
  name: string;
  slug: string;
  ariaLabel: string;
  tilt: string;
  d: string;
  wash: string;
  src: string;
  pos: string;
  bg: string;
}

const GONE_PUPPIES: GonePup[] = [
  {
    id: "cf49862d-1441-4aed-89e7-8fc389e06cca",
    name: "Ace",
    slug: "pomeranian-ace-boy",
    ariaLabel: "Ace, Pomeranian, boy, 3 months, gone home",
    tilt: "-0.63deg",
    d: "0ms",
    wash: "#f9cdbf",
    src: "/media/mihUKGFCatU3/0461cca56e/27b888_bac41adfadc44dce846a1c3fd0cdb0de-mv2.avif",
    pos: "52.8% 46.2%",
    bg: "#f8e8e8",
  },
  {
    id: "a5c77029-5f65-4ab4-b31c-01cb138e76fa",
    name: "Leo",
    slug: "poodle-leo-male",
    ariaLabel: "Leo, Poodle, boy, 3 months, gone home",
    tilt: "0.28deg",
    d: "70ms",
    wash: "#f9cdbf",
    src: "/media/QgFG5s09n-ss/81af626d2d/27b888_5f9a7189bb21477d832047aae2040921-mv2.avif",
    pos: "52.1% 38.0%",
    bg: "#f8e8e8",
  },
  {
    id: "fa8aae8d-7829-48a0-bb60-dcfe863afcc2",
    name: "Mia",
    slug: "maltipoo-mia-girl",
    ariaLabel: "Mia, Maltipoo, girl, 3 months, gone home",
    tilt: "-0.47deg",
    d: "140ms",
    wash: "#bfddf5",
    src: "/media/4vu6_PGfL64H/537c367d85/27b888_747a4667fec640c69aad9bc045d61ac6-mv2.avif",
    pos: "50.3% 43.2%",
    bg: "#b88878",
  },
  {
    id: "709e3caa-a772-421e-90a5-15af282e9526",
    name: "Sadie",
    slug: "maltipoo-sadie-girl",
    ariaLabel: "Sadie, Maltipoo, girl, 3 months, gone home",
    tilt: "0.31deg",
    d: "210ms",
    wash: "#e8c39a",
    src: "/media/159oT4F46uhk/b66c2be87f/27b888_ea6e7e0fcd43447d854657b6de98d4cb-mv2.avif",
    pos: "47.9% 41.8%",
    bg: "#f8d8d8",
  },
  {
    id: "8bca8b3b-4488-4a44-b35c-9b78875af35e",
    name: "Pomeranian",
    slug: "blue-marle-pomeranian",
    ariaLabel: "Pomeranian, boy, 3 months, gone home",
    tilt: "2.49deg",
    d: "280ms",
    wash: "#e8c39a",
    src: "/media/bMSEHnYcBTFF/970fdc1ee6/27b888_5e612a215bf343328c08d99e0e9c5a37-mv2.avif",
    pos: "52.3% 51.6%",
    bg: "#887878",
  },
];

function GonePuppyItem({ pup }: { pup: GonePup }) {
  const sketch = useMemo(() => computeCardSketch(pup.slug), [pup.slug]);
  const maskStyle = useMemo(() => buildSketchMaskUrl(sketch.mask), [sketch.mask]);

  return (
    <li>
      <Link
        href={`/puppies/${pup.slug}`}
        className="tp-sketch tp-sketch--small"
        data-reveal="true"
        style={
          {
            "--tilt": pup.tilt,
            "--d": pup.d,
            "--wash": pup.wash,
          } as React.CSSProperties
        }
        aria-label={pup.ariaLabel}
      >
        <span className="tp-sketch__frame">
          <svg
            aria-hidden={true}
            viewBox="0 0 100 100"
            className="tp-sketch__wash"
            style={{ translate: `${sketch.wash.dx.toFixed(1)}% ${sketch.wash.dy.toFixed(1)}%` }}
          >
            <path d={sketch.wash.d} />
          </svg>

          <span
            className="tp-sketch__photo"
            style={{ maskImage: maskStyle, WebkitMaskImage: maskStyle }}
          >
            <Image
              src={pup.src}
              alt=""
              fill
              sizes="9rem"
              loading="lazy"
              style={{
                objectFit: "cover",
                objectPosition: pup.pos,
                backgroundColor: pup.bg,
              }}
            />
          </span>

          <svg aria-hidden={true} viewBox="0 0 100 100" className="tp-sketch__ink">
            <path d={sketch.outline} pathLength={1} className="tp-sketch__line" />
            <path d={sketch.retrace} pathLength={1} className="tp-sketch__line tp-sketch__line--retrace" />
            {sketch.doodles.map((d, i) => (
              <Doodle d={d} key={i} />
            ))}
          </svg>

          <span className="tp-sketch__sticker tp-sketch__sticker--home font-scrawl">
            gone home ♥
          </span>
        </span>
        <span className="tp-sketch__name font-plush">{pup.name}</span>
      </Link>
    </li>
  );
}

export default function PuppyGoneStrip() {
  return (
    <section aria-labelledby="gone-title" className="tp-gone-strip">
      <RevealScope className="gutter mx-auto flex max-w-[110rem] flex-col gap-10 md:flex-row md:items-center">
        <div className="md:w-1/3" data-reveal="true">
          <h2 id="gone-title" className="font-plush text-big">Already gone home</h2>
          <p className="mt-3 text-cocoa-soft">These puppies have found their families.</p>
          <Link href="/gone-home" className="btn btn-primary mt-6">
            See the puppies who&apos;ve gone home
          </Link>
        </div>

        <ul className="tp-gone-strip__row" aria-label="Some puppies who have gone home">
          {GONE_PUPPIES.map((pup) => (
            <GonePuppyItem key={pup.id} pup={pup} />
          ))}
        </ul>
      </RevealScope>
    </section>
  );
}
