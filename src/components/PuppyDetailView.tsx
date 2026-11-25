"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll } from "motion/react";
import { Puppy, PUPPIES, REHOMED_PUPPIES } from "@/data/puppies";
import { SITE_CONFIG } from "@/data/site";
import { PupBuddy } from "./PupBuddy";
import RevealScope from "./RevealScope";
import { PAW_PATH, STATUS_LABEL } from "./puppy-card-sketch";
import PuppyDetailGallery from "./puppy-detail-gallery";
import PuppyDetailInquiry from "./puppy-detail-inquiry";

const CheckIcon = () => (
  <svg viewBox="0 0 32 32" className="mt-0.5 size-6 shrink-0 text-toffee-deep" aria-hidden="true">
    <path
      d="M5 17l7 7L27 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const INCLUSIONS = [
  "Vaccinated",
  "Dewormed",
  "Verified health certificate from licensed vets",
  "Thoroughly checked before joining your family",
];

function StoryRibbon() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 30%", "end end"],
  });

  return (
    <div ref={ref} aria-hidden="true" className="tp-ribbon">
      <div className="tp-ribbon__track">
        <motion.span className="tp-ribbon__band" style={{ scaleY: scrollYProgress }} />
      </div>
    </div>
  );
}

interface PuppyDetailViewProps {
  puppy: Puppy;
}

export default function PuppyDetailView({ puppy }: PuppyDetailViewProps) {
  const mediaList =
    puppy.media && puppy.media.length > 0 ? puppy.media : puppy.cover ? [puppy.cover] : [];

  const isLocal = puppy.origin?.slug === "local";
  const locationLabel = isLocal ? "Dubai showroom" : "Imported for you";
  const statusLabel = STATUS_LABEL[puppy.status] ?? "Available";
  const dominantColor = puppy.cover?.color || "#785838";

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Puppies",
        item: `${SITE_CONFIG.url}/puppies`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: puppy.displayName,
        item: `${SITE_CONFIG.url}/puppies/${puppy.slug}`,
      },
    ],
  };

  const navPool =
    puppy.status === "rehomed" || puppy.status === "gone-home" ? REHOMED_PUPPIES : PUPPIES;
  const currentIdx = navPool.findIndex((p) => p.slug === puppy.slug);
  const prevPup =
    navPool.length > 1 && currentIdx >= 0
      ? navPool[(currentIdx - 1 + navPool.length) % navPool.length]
      : null;
  const nextPup =
    navPool.length > 1 && currentIdx >= 0
      ? navPool[(currentIdx + 1) % navPool.length]
      : null;

  const trailSteps = isLocal
    ? [
        {
          num: 1,
          title: "Explore our puppies",
          desc: "Browse our website to view the available puppies.",
        },
        {
          num: 2,
          title: "Choose your puppy",
          desc: "Open their profile to see real photos and send an enquiry.",
        },
        {
          num: 3,
          title: "Meet before you choose",
          desc: "Spend time bonding in our Downtown Dubai showroom before making your decision.",
        },
        {
          num: 4,
          title: "Pick-up or delivery",
          desc: "Pick up your puppy from us or have them delivered to your home within Dubai.",
        },
      ]
    : [
        {
          num: 1,
          title: "Reserve your puppy",
          desc: "Tell us which puppy has captured your heart.",
        },
        {
          num: 2,
          title: "Personalized consultation",
          desc: "We finalize details with you and share updates on your puppy's journey.",
        },
        {
          num: 3,
          title: "Import and arrival",
          desc: "We manage health checks, travel arrangements, and documentation.",
        },
        {
          num: 4,
          title: "Welcome home",
          desc: "We help your new puppy settle in and ensure a smooth transition into your home.",
        },
      ];

  const specs = [
    { label: "Breed", value: puppy.breed },
    { label: "Boy or girl", value: puppy.genderLabel },
    ...(puppy.age ? [{ label: "Age", value: puppy.age }] : []),
    { label: "Where", value: locationLabel },
  ];

  const isRehomed = puppy.status === "rehomed" || puppy.status === "gone-home";

  return (
    <div data-page="pup" className="tp-page">
      <article
        className="tp-storybook"
        style={{
          background: `linear-gradient(180deg, color-mix(in oklab, ${dominantColor} 24%, var(--color-milk)) 0, var(--color-milk) 85%)`,
        }}
      >
        <StoryRibbon />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
        />

        <RevealScope className="gutter mx-auto max-w-[110rem] pb-20 pt-8 md:pt-12">
          <nav aria-label="Breadcrumb" className="text-[0.95rem] font-semibold text-cocoa-soft">
            <Link className="link-ink" href={isRehomed ? "/gone-home" : "/puppies"}>
              {isRehomed ? "Gone home" : "Available puppies"}
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{puppy.displayName}</span>
          </nav>

          <p className="tp-chapter">
            <span aria-hidden="true" className="tp-chapter__n font-plush">
              1
            </span>
            <span className="font-scrawl">hello, it&apos;s me</span>
          </p>

          <div className="mt-4 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="min-w-0 lg:col-span-7">
              <PuppyDetailGallery
                puppy={puppy}
                mediaList={mediaList}
                dominantColor={dominantColor}
              />
            </div>

            <div className="min-w-0 lg:col-span-5">
              <div className="lg:sticky lg:top-[calc(var(--header-h)+5.5rem)]">
                <div
                  className="tp-tag tp-board mt-16 !rounded-[2.2rem_2.2rem_2.2rem_0.6rem] !p-7 md:!p-9 lg:mt-20"
                  data-reveal="true"
                >
                  <span aria-hidden="true" className="tp-tag__ring" />

                  <PupBuddy
                    pose="peek"
                    className="absolute -top-[4.8rem] right-6 w-[9.5rem]"
                    label={`Teddy, peeking over ${puppy.displayName}'s tag`}
                  />

                  <span className="chip">
                    <svg
                      viewBox="0 0 64 64"
                      className="size-4 text-toffee"
                      aria-hidden="true"
                      fill="currentColor"
                    >
                      <path d={PAW_PATH} />
                    </svg>
                    {statusLabel}
                  </span>

                  <h1 className="font-plush mt-4 text-[clamp(2.6rem,5vw,4.6rem)]">
                    {puppy.displayName}
                  </h1>
                  {puppy.name && (
                    <p className="mt-2 text-lg font-semibold text-cocoa-soft">{puppy.breed}</p>
                  )}

                  <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4">
                    {specs.map((item) => (
                      <div key={item.label}>
                        <dt className="font-scrawl text-sm text-cocoa-soft">{item.label}</dt>
                        <dd className="mt-0.5 text-[1.05rem] font-semibold">{item.value}</dd>
                      </div>
                    ))}
                  </dl>

                  {puppy.description && (
                    <p className="mt-5 text-cocoa-soft">{puppy.description}</p>
                  )}

                  <div className="mt-8 flex flex-col gap-3">
                    <a
                      href={SITE_CONFIG.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp"
                    >
                      Ask about {puppy.displayName} on WhatsApp
                    </a>
                    <a href={`#enquire-${puppy.slug}`} className="btn btn-ghost">
                      Send an enquiry
                    </a>
                  </div>
                </div>

                <div className="tp-paper mt-8 -rotate-1">
                  <p className="tp-chapter">
                    <span aria-hidden="true" className="tp-chapter__n font-plush">
                      2
                    </span>
                    <span className="font-scrawl">what comes with {puppy.displayName}</span>
                  </p>
                  <h2 className="font-plush mt-1 text-[1.9rem]">Every Teddy Pup comes</h2>
                  <ul className="mt-4 space-y-2.5">
                    {INCLUSIONS.map((text) => (
                      <li key={text} className="flex items-start gap-3 font-semibold">
                        <CheckIcon />
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <section aria-labelledby={`home-steps-${puppy.slug}`} className="mt-20">
            <p className="tp-chapter">
              <span aria-hidden="true" className="tp-chapter__n font-plush">
                3
              </span>
              <span className="font-scrawl">the way home</span>
            </p>
            <h2 id={`home-steps-${puppy.slug}`} className="font-plush text-big mt-3">
              {isLocal ? "Meeting in our Dubai showroom" : "Coming home from abroad"}
            </h2>
            <ol className="tp-trail tp-trail--row tp-trail--paws mt-10">
              {trailSteps.map((step) => (
                <li key={step.title}>
                  <span aria-hidden="true" className="tp-trail__num font-plush">
                    {step.num}
                  </span>
                  <h3 className="font-plush-text text-xl font-bold leading-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-[38ch] text-cocoa-soft">{step.desc}</p>
                </li>
              ))}
            </ol>
          </section>

          <PuppyDetailInquiry puppy={puppy} />

          {prevPup && nextPup && (
            <nav aria-label="More puppies" className="mt-16 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Previous pup", pup: prevPup },
                { label: "Next pup", pup: nextPup },
              ].map(({ label, pup }) => (
                <Link
                  key={label}
                  href={`/puppies/${pup.slug}`}
                  className="group flex items-center gap-5 rounded-[2rem] border-[3px] border-cocoa bg-milk p-4 transition-transform duration-500 hover:-rotate-1 sm:last:flex-row-reverse sm:last:text-right"
                >
                  <span className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[999px_999px_0.6rem_0.6rem] border-[3px] border-cocoa bg-honey-soft">
                    {pup.cover && (
                      <Image
                        src={pup.cover.url}
                        alt={pup.cover.alt || pup.displayName}
                        fill
                        sizes="80px"
                        loading="lazy"
                        style={{
                          objectFit: "cover",
                          objectPosition:
                            pup.cover.focalX != null && pup.cover.focalY != null
                              ? `${(pup.cover.focalX * 100).toFixed(1)}% ${(pup.cover.focalY * 100).toFixed(1)}%`
                              : "50% 50%",
                          backgroundColor: pup.cover.color || "#785838",
                        }}
                      />
                    )}
                  </span>
                  <span>
                    <span className="font-scrawl block text-sm text-cocoa-soft">{label}</span>
                    <span className="font-plush text-[1.6rem]">{pup.displayName}</span>
                  </span>
                </Link>
              ))}
            </nav>
          )}
        </RevealScope>
      </article>
    </div>
  );
}
