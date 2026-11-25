"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMediaQuery, useReducedMotion } from "@/lib/media-queries";
import { SITE_CONFIG } from "@/data/site";
import { PupStop } from "@/components/PupBuddy";
import { cuePup } from "@/components/PupActor";
import { PAW_PATH } from "@/components/pup-svg-paths";

const STEPS = [
  {
    title: "Choose your breed",
    text: "Select your preferred breed or tell us what you're looking for. We'll guide you based on availability and your lifestyle.",
  },
  {
    title: "Get photos & details",
    text: "Our team will share real photos, health details, and all necessary information directly on WhatsApp.",
  },
  {
    title: "Secure & safe delivery",
    text: "Once confirmed, we handle everything professionally and ensure your puppy reaches you safely and stress-free.",
  },
];

const BREED_CHIPS = ["Maltipoo", "Pomeranian", "Poodle", "Cavapoo", "Shih Tzu"];

const CHAT_SNAPS = [
  {
    src: "/media/FHyoHcIosLZE/60f6e7e00a/27b888_323008bb0f6a41d4bde2a0da7206cd98f000.jpg",
    alt: "A tiny apricot teddy bear puppy held up in the TeddyPups showroom",
    objectPosition: "54.3% 48.3%",
    backgroundColor: "#685848",
  },
  {
    src: "/media/Vi-kzyvemRl4/e740ed8a24/27b888_323008bb0f6a41d4bde2a0da7206cd98f001.jpg",
    alt: "The apricot teddy bear puppy from our showroom, close up",
    objectPosition: "46.0% 44.4%",
    backgroundColor: "#685848",
  },
  {
    src: "/media/g_e4ebbc7fyG/8276289ae7/27b888_323008bb0f6a41d4bde2a0da7206cd98f002.jpg",
    alt: "The apricot teddy bear puppy from our showroom, looking up",
    objectPosition: "43.7% 40.2%",
    backgroundColor: "#080818",
  },
  {
    src: "/media/skvodl2NZiKq/cefab5eee9/27b888_323008bb0f6a41d4bde2a0da7206cd98f003.jpg",
    alt: "The apricot teddy bear puppy from our showroom, held up to say hello",
    objectPosition: "45.3% 44.4%",
    backgroundColor: "#685848",
  },
];

function ChatVideoClip({
  src,
  poster,
  alt,
}: {
  src: string;
  poster: string;
  alt: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="tp-clip">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={alt}
        onEnded={() => setIsPlaying(false)}
      />
      <button
        type="button"
        className="tp-clip__play"
        aria-pressed={isPlaying}
        aria-label={isPlaying ? "Pause video" : "Play video"}
        onClick={togglePlay}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {isPlaying ? (
            <path d="M7 5h3v14H7zM14 5h3v14h-3z" />
          ) : (
            <path d="M8 5v14l11-7z" />
          )}
        </svg>
      </button>
    </div>
  );
}

export default function ChatSimulator() {
  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [activeStep, setActiveStep] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const stepsRef = useRef<HTMLOListElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(-1);

  const showAll = reducedMotion || !isDesktop;
  const effectiveStep = showAll ? STEPS.length - 1 : activeStep;

  useEffect(() => {
    if (showAll || !stepsRef.current) return;
    const stepEls = Array.from(stepsRef.current.children);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveStep(stepEls.indexOf(entry.target));
          }
        }
      },
      { rootMargin: "-28% 0px -62% 0px" }
    );
    stepEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [showAll]);

  useEffect(() => {
    if (showAll) {
      setIsTyping(false);
      return;
    }
    const advancing = activeStep > prevStepRef.current;
    prevStepRef.current = activeStep;
    if (!advancing || activeStep < 0) return;

    setIsTyping(true);
    const timer = window.setTimeout(() => {
      setIsTyping(false);
      const msgGroupEl = screenRef.current?.querySelector<HTMLElement>(
        `[data-step="${activeStep}"]`
      );
      if (msgGroupEl) {
        cuePup({
          look: msgGroupEl,
          secs: 1.4,
          say:
            activeStep === 1
              ? "ooh, photos!"
              : activeStep === 2
                ? "home soon!"
                : undefined,
        });
      }
    }, 750);

    return () => {
      window.clearTimeout(timer);
      setIsTyping(false);
    };
  }, [activeStep, showAll]);

  return (
    <section
      data-pup-scene="true"
      data-tone="light"
      aria-labelledby="journey-title"
      className="tp-scene tp-chat"
      style={
        {
          "--sky-top": "#f7d18d",
          "--sky-bottom": "#f0b866",
        } as React.CSSProperties
      }
    >
      <div className="tp-chat__grid gutter" data-pin-range={true}>
        <div className="tp-chat__story">
          <h2 id="journey-title" className="font-plush text-huge">
            Your puppy journey
          </h2>
          <p className="text-lede mt-5 max-w-[42ch] text-[var(--ink-soft)]">
            A premium, step-by-step concierge experience. We make adoption simple,
            secure, and purely joyful.
          </p>

          <ol ref={stepsRef} className="tp-chat__steps">
            {STEPS.map((s, idx) => (
              <li
                key={s.title}
                className="tp-chat__step"
                data-active={idx === effectiveStep || undefined}
                data-done={idx < effectiveStep || undefined}
              >
                <span className="tp-chat__num font-plush" aria-hidden="true">
                  {idx + 1}
                </span>
                <h3 className="font-plush tp-chat__title">{s.title}</h3>
                <p className="tp-chat__text">{s.text}</p>
              </li>
            ))}
          </ol>

          <Link href="/how-it-works" className="btn btn-ghost tp-chat__cta">
            How it works
          </Link>
        </div>

        <div className="tp-chat__side">
          <div
            className="tp-phone"
            aria-label="A WhatsApp conversation with TeddyPups U.A.E."
            role="group"
          >
            <div className="tp-phone__bar">
              <Image
                src="/brand/logo.png"
                alt=""
                width={40}
                height={40}
                className="tp-phone__avatar"
              />
              <span>
                <span className="tp-phone__name">TeddyPups U.A.E.</span>
                <span className="tp-phone__status">
                  {isTyping ? "typing…" : "online"}
                </span>
              </span>
            </div>

            <div ref={screenRef} className="tp-phone__screen">
              <p className="tp-msg tp-msg--me">
                Hi TeddyPups! I&apos;d love to know more about your puppies.
              </p>

              <div
                className="tp-msg-group"
                data-step="0"
                data-show={
                  0 < effectiveStep || (0 === effectiveStep && !isTyping)
                    ? "true"
                    : "false"
                }
              >
                <div className="tp-msg tp-msg--them">
                  <p>{STEPS[0].text}</p>
                  <ul className="tp-chips" aria-label="Breeds we have now">
                    {BREED_CHIPS.map((b) => (
                      <li key={b}>
                        <Link
                          href={`/puppies?breed=${b.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {b}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div
                className="tp-msg-group"
                data-step="1"
                data-show={
                  1 < effectiveStep || (1 === effectiveStep && !isTyping)
                    ? "true"
                    : "false"
                }
              >
                <div className="tp-msg tp-msg--them tp-msg--media">
                  <div className="tp-snaps">
                    {CHAT_SNAPS.map((snap) => (
                      <span key={snap.src} className="tp-snaps__one">
                        <Image
                          src={snap.src}
                          alt={snap.alt}
                          fill
                          sizes="9rem"
                          style={{
                            objectFit: "cover",
                            objectPosition: snap.objectPosition,
                            backgroundColor: snap.backgroundColor,
                          }}
                        />
                      </span>
                    ))}
                  </div>
                </div>
                <div className="tp-msg tp-msg--them tp-msg--media">
                  <ChatVideoClip
                    src="/media/dSAUmXs8Qai9/ef39cbea20/27b888_323008bb0f6a41d4bde2a0da7206cd98-720p.mp4"
                    poster="/media/FHyoHcIosLZE/60f6e7e00a/27b888_323008bb0f6a41d4bde2a0da7206cd98f000.jpg"
                    alt="Video of a tiny apricot teddy bear puppy in the TeddyPups showroom"
                  />
                </div>
                <p className="tp-msg tp-msg--them">{STEPS[1].text}</p>
              </div>

              <div
                className="tp-msg-group"
                data-step="2"
                data-show={
                  2 < effectiveStep || (2 === effectiveStep && !isTyping)
                    ? "true"
                    : "false"
                }
              >
                <div className="tp-msg tp-msg--them">
                  <p>{STEPS[2].text}</p>
                  <svg viewBox="0 0 220 70" className="tp-route" aria-hidden="true">
                    <path d="M14 52 C 60 6, 120 70, 170 28" className="tp-route__line" />
                    <circle cx="14" cy="52" r="5" className="tp-route__dot" />
                    <path d="M164 32 l12 -12 l12 12 v14 h-24 z" className="tp-route__home" />
                    <path
                      d="M176 42 c-2-3-7-2-6 2c1 3 6 5 6 5s5-2 6-5c1-4-4-5-6-2z"
                      className="tp-route__heart"
                    />
                    <path
                      d={PAW_PATH}
                      transform="translate(70 22) scale(.3) rotate(70 32 32)"
                      className="tp-route__paw"
                    />
                    <path
                      d={PAW_PATH}
                      transform="translate(104 38) scale(.3) rotate(100 32 32)"
                      className="tp-route__paw"
                    />
                  </svg>
                </div>
              </div>

              <p
                className="tp-typing"
                data-show={isTyping ? "true" : "false"}
                aria-hidden="true"
              >
                <span />
                <span />
                <span />
              </p>
            </div>

            <a
              href={SITE_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tp-phone__compose"
            >
              <span>Say hello on WhatsApp</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 20l18-8L3 4v6l12 2-12 2z" />
              </svg>
            </a>
          </div>

          <PupStop pose="sit" facing="right" className="tp-chat__teddy" />
        </div>
      </div>
    </section>
  );
}
