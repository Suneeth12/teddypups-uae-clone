import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { GONE_HOME_TICKETS } from "@/data/gone-home-tickets";
import { PupBuddy } from "@/components/PupBuddy";
import RevealScope from "@/components/RevealScope";

export const metadata: Metadata = {
  title: "Gone home | TeddyPups U.A.E.",
  description: "TeddyPups puppies who have already joined their families.",
};

export default function GoneHomePage() {
  return (
    <div data-page="gone" className="tp-page">
      <div className="gutter mx-auto max-w-[110rem] pb-24 pt-10 md:pt-16">
        <header className="tp-boothhead">
          <div className="max-w-3xl">
            <h1 className="font-plush text-giant">
              Gone home
              <svg
                viewBox="0 0 48 44"
                className="ml-3 inline-block w-[0.45em] -translate-y-[0.15em] text-toffee"
                aria-hidden="true"
              >
                <path
                  d="M24 40C10 30 4 22 4 14.5 4 8.7 8.6 4 14.3 4c4.1 0 7.6 2.4 9.7 6 2.1-3.6 5.6-6 9.7-6C39.4 4 44 8.7 44 14.5 44 22 38 30 24 40z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </h1>
            <p className="text-lede mt-6 text-cocoa-soft">
              Every puppy here has already joined a loving family. Looking for one just like them? Tell us — we&apos;ll help you find your match.
            </p>
            <Link className="btn btn-primary mt-8" href="/puppies">
              See available puppies
            </Link>
          </div>

          <div aria-hidden="true" className="tp-booth">
            <PupBuddy pose="peek" className="tp-booth__teddy" />
            <div className="tp-booth__counter">
              <span className="font-plush">tickets home</span>
            </div>
          </div>
        </header>

        <RevealScope>
          <ul className="tp-tickets" aria-label="Puppies who have gone home">
            {GONE_HOME_TICKETS.map((ticket) => (
              <li
                key={ticket.id}
                className="tp-ticket"
                data-reveal={true}
                style={
                  {
                    "--tilt": ticket.tilt,
                    "--i": ticket.i,
                  } as React.CSSProperties
                }
              >
                <Link className="tp-ticket__link" href={`/puppies/${ticket.slug}`}>
                  <span className="tp-ticket__main">
                    <span className="tp-ticket__photo">
                      <Image
                        src={ticket.src}
                        alt={ticket.alt}
                        fill
                        sizes="7rem"
                        loading="lazy"
                        style={{
                          objectFit: "cover",
                          objectPosition: ticket.pos,
                          backgroundColor: ticket.bg,
                        }}
                      />
                    </span>
                    <span className="tp-ticket__body">
                      <span className="font-scrawl tp-ticket__kicker">one ticket home</span>
                      <span className="font-plush tp-ticket__name">{ticket.name}</span>
                      <span className="tp-ticket__meta">{ticket.meta}</span>
                      <span className="tp-ticket__route">
                        <span>{ticket.origin}</span>
                        <svg viewBox="0 0 60 12" aria-hidden="true">
                          <path d="M2 6h46" />
                          <path d="M44 2l6 4-6 4" />
                        </svg>
                        <span>home ♥</span>
                      </span>
                    </span>
                  </span>
                  <span aria-hidden="true" className="tp-ticket__stub">
                    <span className="font-plush">admit one</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </RevealScope>
      </div>
    </div>
  );
}
