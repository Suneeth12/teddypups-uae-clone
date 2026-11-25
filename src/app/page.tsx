import React from "react";
import Link from "next/link";
import Image from "next/image";
import HeroStage from "@/components/HeroStage";
import PuppyLineup from "@/components/PuppyLineup";
import ShowroomWays from "@/components/ShowroomWays";
import ChatSimulator from "@/components/ChatSimulator";
import TrustCards from "@/components/TrustCards";
import FamilyReviews from "@/components/FamilyReviews";
import PupActor from "@/components/PupActor";
import { PupStop } from "@/components/PupBuddy";
import { SITE_CONFIG } from "@/data/site";

const NIGHT_STARS = [
  { left: "8%", top: "12%", width: "16.2px", delay: "0.00s" },
  { left: "22%", top: "30%", width: "9px", delay: "0.40s" },
  { left: "41%", top: "8%", width: "12.6px", delay: "0.80s" },
  { left: "57%", top: "22%", width: "8.1px", delay: "1.20s" },
  { left: "72%", top: "6%", width: "14.4px", delay: "1.60s" },
  { left: "88%", top: "18%", width: "10.8px", delay: "2.00s" },
  { left: "95%", top: "42%", width: "9px", delay: "2.40s" },
  { left: "4%", top: "58%", width: "10.8px", delay: "2.80s" },
  { left: "34%", top: "70%", width: "7.2px", delay: "3.20s" },
  { left: "63%", top: "84%", width: "9.9px", delay: "3.60s" },
  { left: "83%", top: "66%", width: "12.6px", delay: "4.00s" },
];

const PET_STORE_LD = {
  "@context": "https://schema.org",
  "@type": "PetStore",
  name: "TeddyPups U.A.E.",
  description:
    "TeddyPups U.A.E. is a Dubai-based brand specializing in miniature puppies, offering premium services and worldwide shipping.",
  url: "https://puppy.instabizweb.com",
  logo: "https://puppy.instabizweb.com/brand/logo.png",
  image: "https://puppy.instabizweb.com/brand/logo.png",
  telephone: "+971 50 000 0000",
  email: "info@instabizweb.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Downtown Dubai, United Arab Emirates",
    addressLocality: "Dubai",
    addressCountry: "AE",
  },
  sameAs: [
    "https://www.instabizweb.com/",
    "https://www.instabizweb.com/",
    "https://www.instabizweb.com/",
  ],
};

export default function HomePage() {
  return (
    <div data-page="home" className="tp-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PET_STORE_LD) }}
      />
      <div data-section="hero">
        <HeroStage />
      </div>

      <div data-section="meet">
        <PuppyLineup />
      </div>

      <div data-section="paths">
        <ShowroomWays />
      </div>

      <div data-section="journey">
        <ChatSimulator />
      </div>

      <div data-section="trust">
        <TrustCards />
      </div>

      <div data-section="families">
        <FamilyReviews />
      </div>

      <div data-section="questions">
        <section
          data-pup-scene="true"
          data-tone="dark"
          className="tp-scene tp-night"
          style={
            {
              "--sky-top": "#4d2b19",
              "--sky-bottom": "#2f1a10",
            } as React.CSSProperties
          }
          aria-labelledby="questions-title"
        >
          <div aria-hidden="true" className="pointer-events-none tp-night__stars">
            {NIGHT_STARS.map((s, idx) => (
              <svg
                key={idx}
                viewBox="0 0 40 40"
                className="tp-twinkle absolute text-honey"
                style={{
                  left: s.left,
                  top: s.top,
                  width: s.width,
                  animationDelay: s.delay,
                }}
                aria-hidden="true"
              >
                <path
                  d="M20 3c1.6 9.4 7.6 15.4 17 17-9.4 1.6-15.4 7.6-17 17-1.6-9.4-7.6-15.4-17-17 9.4-1.6 15.4-7.6 17-17z"
                  fill="currentColor"
                />
              </svg>
            ))}
          </div>

          <div className="tp-night__grid gutter">
            <div className="tp-night__intro">
              <h2 id="questions-title" className="font-plush text-huge">
                Questions, answered
              </h2>
              <Link className="btn btn-ghost tp-night__cta" href="/faq">
                Read all questions
              </Link>

              <div className="tp-night__pup">
                <span aria-hidden="true" className="tp-night__wonder font-plush">
                  ?
                </span>
                <PupStop
                  pose="sit"
                  facing="right"
                  act="tilt"
                  className="tp-night__teddy"
                />
              </div>
            </div>

            <dl className="tp-night__list">
              <div className="tp-qa" data-pup-look="">
                <dt className="font-plush tp-qa__q">
                  <svg viewBox="0 0 40 40" className="tp-qa__star" aria-hidden="true">
                    <path
                      d="M20 3c1.6 9.4 7.6 15.4 17 17-9.4 1.6-15.4 7.6-17 17-1.6-9.4-7.6-15.4-17-17 9.4-1.6 15.4-7.6 17-17z"
                      fill="currentColor"
                    />
                  </svg>
                  Are your puppies vaccinated and health-checked?
                </dt>
                <dd className="tp-qa__a">
                  Yes. All our puppies come with a verified health certificate from
                  licensed vets. Every puppy is vaccinated, dewormed, and thoroughly
                  checked before joining your family.
                </dd>
              </div>

              <div className="tp-qa" data-pup-look="">
                <dt className="font-plush tp-qa__q">
                  <svg viewBox="0 0 40 40" className="tp-qa__star" aria-hidden="true">
                    <path
                      d="M20 3c1.6 9.4 7.6 15.4 17 17-9.4 1.6-15.4 7.6-17 17-1.6-9.4-7.6-15.4-17-17 9.4-1.6 15.4-7.6 17-17z"
                      fill="currentColor"
                    />
                  </svg>
                  Can I meet a puppy before I decide?
                </dt>
                <dd className="tp-qa__a">
                  Yes. Come meet our locally available puppies in our Downtown Dubai
                  showroom and spend time bonding before making your decision.
                </dd>
              </div>

              <div className="tp-qa">
                <dt className="font-plush tp-qa__q">
                  <svg viewBox="0 0 40 40" className="tp-qa__star" aria-hidden="true">
                    <path
                      d="M20 3c1.6 9.4 7.6 15.4 17 17-9.4 1.6-15.4 7.6-17 17-1.6-9.4-7.6-15.4-17-17 9.4-1.6 15.4-7.6 17-17z"
                      fill="currentColor"
                    />
                  </svg>
                  Can I take my puppy home the same day?
                </dt>
                <dd className="tp-qa__a">
                  Local puppies are available immediately, so you can take your puppy home
                  the same day.
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>

      <div data-section="cta">
        <section
          data-pup-scene="true"
          data-tone="dark"
          className="tp-scene tp-home"
          style={
            {
              "--sky-top": "#2f1a10",
              "--sky-bottom": "#24130b",
            } as React.CSSProperties
          }
          aria-labelledby="cta-title"
        >
          <div className="tp-home__copy gutter">
            <h2 id="cta-title" className="font-plush text-huge">
              Ready to meet your new best friend?
            </h2>
            <p className="tp-home__lede">
              Bring home a healthy, happy teacup or designer puppy with expert guidance
              every step of the way. We help you find the right match and ensure a
              smooth, safe delivery across the UAE.
            </p>
          </div>

          <div className="tp-house">
            <span aria-hidden="true" className="tp-house__plant tp-house__plant--left" />
            <span aria-hidden="true" className="tp-house__lamp" />

            <div className="tp-house__doorway">
              <span className="tp-house__inside">
                <Image
                  src="/media/Z0ToauDx7Eve/5fffe4d022/b942a5_4b8cfb8204d24eadaf524332aba1dc15-mv2.webp"
                  alt="Max, waiting inside"
                  fill
                  sizes="16rem"
                  style={{
                    objectFit: "cover",
                    objectPosition: "53.8% 44.3%",
                    backgroundColor: "#785838",
                  }}
                />
              </span>
              <span aria-hidden="true" className="tp-house__door">
                <span className="tp-house__peep" />
                <span className="tp-house__knob" />
              </span>
            </div>

            <span aria-hidden="true" className="tp-house__plant tp-house__plant--right" />
            <span aria-hidden="true" className="tp-house__mat font-scrawl">
              welcome home
            </span>

            <PupStop
              pose="bow"
              facing="right"
              className="tp-house__teddy"
            />
          </div>

          <div className="tp-home__actions gutter">
            <a
              href={SITE_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              Enquire on WhatsApp
            </a>
            <Link className="btn btn-ghost tp-home__ghost" href="/contact">
              Visit &amp; contact
            </Link>
          </div>
        </section>
      </div>

      <PupActor />
    </div>
  );
}
