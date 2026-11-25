import React from "react";
import Link from "next/link";
import { PupBuddy } from "@/components/PupBuddy";

export default function NotFound() {
  return (
    <div className="tp-page" data-tone="light">
      <section className="gutter mx-auto flex max-w-[60rem] flex-col items-center py-24 text-center">
        <PupBuddy pose="sit" facing="right" act="tilt" className="w-40" label="Teddy tilting his head" />
        <p className="font-scrawl mt-6 text-lg text-rust">404 — wrong trail</p>
        <h1 className="font-plush text-big mt-2">
          We couldn&apos;t sniff out that page
        </h1>
        <p className="mt-4 max-w-[44ch] text-cocoa-soft">
          That link may have wandered off, or the puppy found their forever home.
          Head back to our showroom to meet everyone waiting for a family.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/" className="btn btn-primary">
            Back to home
          </Link>
          <Link href="/puppies" className="btn btn-ghost">
            Meet our puppies
          </Link>
        </div>
      </section>
    </div>
  );
}
