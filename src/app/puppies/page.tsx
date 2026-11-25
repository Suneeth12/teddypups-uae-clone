import React, { Suspense } from "react";
import type { Metadata } from "next";
import { PUPPIES } from "@/data/puppies";
import PuppyFilterGrid from "@/components/PuppyFilterGrid";
import { PuppySketchCard } from "@/components/puppy-card-sketch";
import PuppyGoneStrip from "@/components/puppy-gone-strip";
import { PupBuddy } from "@/components/PupBuddy";
import RevealScope from "@/components/RevealScope";

export const metadata: Metadata = {
  title: "Available puppies | TeddyPups U.A.E.",
  description:
    "Teacup and teddy bear puppies available now in Dubai and imported from trusted breeders — every listing shows real photos of the puppy.",
};

export default function PuppiesPage() {
  return (
    <div data-page="pups" className="tp-page">
      <section aria-labelledby="pups-title" className="tp-sketchbook">
        <div className="gutter mx-auto max-w-[110rem] pb-24 pt-10 md:pt-16">
          <RevealScope className="tp-sketchbook__head">
            <div className="tp-sketchbook__words">
              <p
                className="font-scrawl text-lg text-toffee-ink"
                data-reveal="true"
              >
                from Teddy&apos;s sketchbook
              </p>
              <h1
                id="pups-title"
                className="font-plush text-giant tp-sketchbook__title"
                data-reveal="true"
              >
                Available puppies
                <svg
                  aria-hidden="true"
                  viewBox="0 0 400 24"
                  preserveAspectRatio="none"
                  className="tp-sketchbook__underline"
                >
                  <path
                    d="M4 15c40-9 70 5 112-2s70-9 112 0 74 8 116-1 38-4 52 1"
                    pathLength={1}
                  />
                </svg>
              </h1>
              <p
                className="tp-sketchbook__lede text-lede mt-6 max-w-[46ch] text-cocoa-soft"
                data-reveal="true"
              >
                Every listing shows real photos of the actual puppy. Open a
                profile to see them all, then ask us about them on WhatsApp.
              </p>
            </div>
            <div className="tp-sketchbook__self" data-reveal="true">
              <PupBuddy pose="sit" facing="left" label="Teddy, the TeddyPups puppy" />
              <span className="font-scrawl tp-sketchbook__caption">self-portrait</span>
            </div>
          </RevealScope>

          <div className="mt-12">
            <Suspense
              fallback={
                <ul className="tp-sketches mt-20">
                  {PUPPIES.map((pup, idx) => (
                    <li key={pup.id}>
                      <PuppySketchCard pup={pup} index={idx} preload={idx < 3} />
                    </li>
                  ))}
                </ul>
              }
            >
              <PuppyFilterGrid />
            </Suspense>
          </div>
        </div>
      </section>

      <PuppyGoneStrip />
    </div>
  );
}
