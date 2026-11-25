"use client";

import React, { useMemo } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { PUPPIES } from "@/data/puppies";
import { SITE_CONFIG } from "@/data/site";
import { PupBuddy } from "./PupBuddy";
import RevealScope from "./RevealScope";
import { PuppySketchCard } from "./puppy-card-sketch";
import PuppyFilterBar from "./puppy-filter-bar";

type FilterKey = "origin" | "breed" | "gender" | "collection";

export default function PuppyFilterGrid() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const origin = searchParams.get("origin") ?? "";
  const breed = searchParams.get("breed") ?? "";
  const gender = searchParams.get("gender") ?? "";
  const collection = searchParams.get("collection") ?? "";

  const filters: Record<FilterKey, string> = {
    origin,
    breed,
    gender,
    collection,
  };

  const updateFilter = (key: FilterKey, val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val && filters[key] !== val) {
      params.set(key, val);
    } else {
      params.delete(key);
    }
    const q = params.toString();
    window.history.replaceState(null, "", q ? `${pathname}?${q}` : pathname);
  };

  const clearFilters = () => {
    window.history.replaceState(null, "", pathname);
  };

  const filtered = useMemo(
    () =>
      PUPPIES.filter(
        (p) =>
          (!origin || p.origin?.slug === origin) &&
          (!breed || p.breeds.some((b) => b.slug === breed)) &&
          (!gender || p.gender === gender || p.gender === "male-female") &&
          (!collection || p.collections.some((c) => c.slug === collection))
      ),
    [origin, breed, gender, collection]
  );

  const hasFilters = Boolean(origin || breed || gender || collection);
  const breedsList = useMemo(
    () =>
      SITE_CONFIG.breeds.filter((b) =>
        PUPPIES.some((p) => p.breeds.some((pb) => pb.slug === b.slug))
      ),
    []
  );

  return (
    <div>
      <PuppyFilterBar
        puppies={PUPPIES}
        origin={origin}
        collection={collection}
        breed={breed}
        gender={gender}
        breedsList={breedsList}
        hasFilters={hasFilters}
        onUpdateFilter={updateFilter}
        onClearFilters={clearFilters}
      />

      <p className="font-scrawl mt-10 text-lg text-[var(--ink-soft)]" aria-live="polite">
        {filtered.length === 1 ? "1 puppy" : `${filtered.length} puppies`}{" "}
        {hasFilters ? "match" : "looking for a home"}
      </p>

      {filtered.length > 0 ? (
        <RevealScope>
          <motion.ul layout className="tp-sketches mt-8">
            <AnimatePresence mode="popLayout">
              {filtered.map((pup, idx) => (
                <motion.li
                  layout
                  key={pup.id}
                  initial={{ opacity: 0, scale: 0.86 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.86,
                    transition: { duration: 0.2 },
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                >
                  <PuppySketchCard pup={pup} index={idx} preload={idx < 3} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </RevealScope>
      ) : (
        <div className="tp-sketchpad mt-10 grid items-center gap-6 md:grid-cols-[auto_1fr] md:gap-10">
          <PupBuddy
            pose="sit"
            act="tilt"
            className="mx-auto w-44 md:w-52"
            label="Teddy, tilting his head"
          />
          <div>
            <p className="font-plush text-big">No puppies match just now.</p>
            <p className="mt-3 max-w-[48ch] text-cocoa-soft">
              Tell us what you&apos;re hoping for and we&apos;ll let you know what&apos;s in our
              showroom or what we can bring in for you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={SITE_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                Ask on WhatsApp
              </a>
              <button type="button" onClick={clearFilters} className="btn btn-ghost">
                Show all puppies
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
