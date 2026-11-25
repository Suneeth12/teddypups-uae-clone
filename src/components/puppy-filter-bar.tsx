"use client";

import React from "react";
import { Puppy } from "@/data/puppies";

type FilterKey = "origin" | "breed" | "gender" | "collection";

interface FilterBarProps {
  puppies: Puppy[];
  origin: string;
  collection: string;
  breed: string;
  gender: string;
  breedsList: Array<{ slug: string; name: string }>;
  hasFilters: boolean;
  onUpdateFilter: (key: FilterKey, val: string) => void;
  onClearFilters: () => void;
}

export default function PuppyFilterBar({
  puppies,
  origin,
  collection,
  breed,
  gender,
  breedsList,
  hasFilters,
  onUpdateFilter,
  onClearFilters,
}: FilterBarProps) {
  const hasLocal = puppies.some((p) => p.origin?.slug === "local");
  const hasKoreanTeacup = puppies.some((p) =>
    p.collections.some((c) => c.slug === "korean-teacup")
  );

  return (
    <div role="group" aria-label="Filter puppies" className="tp-sketchpad flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-scrawl mr-1 w-full shrink-0 text-cocoa-soft sm:w-28">where</span>
        <button
          type="button"
          aria-pressed={!origin && !collection}
          onClick={onClearFilters}
          className="tp-sticker-chip"
        >
          Everywhere
        </button>
        {hasLocal && (
          <button
            type="button"
            aria-pressed={origin === "local"}
            onClick={() => onUpdateFilter("origin", "local")}
            className="tp-sticker-chip"
          >
            In Dubai
          </button>
        )}
        <button
          type="button"
          aria-pressed={origin === "imported"}
          onClick={() => onUpdateFilter("origin", "imported")}
          className="tp-sticker-chip"
        >
          Imported
        </button>
        {hasKoreanTeacup && (
          <button
            type="button"
            aria-pressed={collection === "korean-teacup"}
            onClick={() => onUpdateFilter("collection", "korean-teacup")}
            className="tp-sticker-chip"
          >
            Korean Teacup
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-scrawl mr-1 w-full shrink-0 text-cocoa-soft sm:w-28">breed</span>
        {breedsList.map((b) => (
          <button
            key={b.slug}
            type="button"
            aria-pressed={breed === b.slug}
            onClick={() => onUpdateFilter("breed", b.slug)}
            className="tp-sticker-chip"
          >
            {b.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-scrawl mr-1 w-full shrink-0 text-cocoa-soft sm:w-28">boy or girl</span>
        <button
          type="button"
          aria-pressed={gender === "male"}
          onClick={() => onUpdateFilter("gender", "male")}
          className="tp-sticker-chip"
        >
          Boys
        </button>
        <button
          type="button"
          aria-pressed={gender === "female"}
          onClick={() => onUpdateFilter("gender", "female")}
          className="tp-sticker-chip"
        >
          Girls
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="link-ink ml-auto text-[0.95rem] font-semibold"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
