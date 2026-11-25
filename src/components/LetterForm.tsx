"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { SITE_CONFIG } from "@/data/site";
import { prefersReducedMotion } from "@/lib/media-queries";
import { PAW_PATH } from "./pup-svg-paths";
import {
  BlankInput,
  EnvelopePostScene,
  SentMailboxIcon,
  validateEnquiry,
  type FormState,
  type LetterFormPuppyOption,
} from "./letter-envelope";

export type { LetterFormPuppyOption } from "./letter-envelope";

interface LetterFormProps {
  puppies: LetterFormPuppyOption[];
  success?: {
    heading: string;
    body: string;
  };
  whatsappHref?: string;
}

export function LetterForm({
  puppies,
  success = {
    heading: "Message received!",
    body: "Thank you — our team will get back to you promptly. For the quickest reply, message us on WhatsApp.",
  },
  whatsappHref = SITE_CONFIG.whatsappUrl,
}: LetterFormProps) {
  const [state, setState] = useState<FormState>({ ok: false });
  const [phase, setPhase] = useState<"writing" | "sealing" | "posting" | "sent">("writing");
  const [lockedHeight, setLockedHeight] = useState<number | undefined>();

  const postRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);

  const puppySelectId = useId();
  const messageId = useId();

  useEffect(() => {
    if (!state.ok) return;
    const timers = prefersReducedMotion()
      ? [window.setTimeout(() => setPhase("sent"), 0)]
      : [
          window.setTimeout(() => {
            setLockedHeight(postRef.current?.offsetHeight);
            setPhase("sealing");
          }, 0),
          window.setTimeout(() => setPhase("posting"), 750),
          window.setTimeout(() => {
            setLockedHeight(undefined);
            setPhase("sent");
          }, 1750),
        ];
    return () => timers.forEach(clearTimeout);
  }, [state.ok]);

  useEffect(() => {
    const el = sentRef.current;
    if (phase !== "sent" || !el) return;
    el.focus({ preventScroll: true });
    const top = el.getBoundingClientRect().top;
    // --header-h is specified in rem in globals.css (4.75rem / 4rem).
    const headerH =
      16 * parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) ||
      76;
    if (top < headerH + 8) {
      window.scrollBy({
        top: top - headerH - 24,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    }
  }, [phase]);

  useEffect(() => {
    if (!state.ok && state.errors) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [state]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (phase !== "writing") return;
    setState(validateEnquiry(new FormData(e.currentTarget)));
  };

  const errors = state.errors ?? {};
  const visibleErrors = Object.entries(errors).filter(([key]) => key !== "website");
  const isSubmitting = phase === "sealing" || phase === "posting";

  return (
    <div
      ref={postRef}
      className="tp-post"
      data-phase={phase}
      style={{ minHeight: lockedHeight }}
    >
      {phase !== "sent" && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          className="tp-letterform"
          aria-hidden={phase !== "writing" || undefined}
          inert={phase !== "writing"}
        >
          <span aria-hidden="true" className="tp-letter__stamp">
            <svg viewBox="0 0 64 64" className="size-9" aria-hidden="true" fill="currentColor">
              <path d={PAW_PATH} />
            </svg>
          </span>

          <p className="font-scrawl tp-letterform__greeting">Dear TeddyPups,</p>

          {state.message && !state.ok && (
            <div role="alert" className="tp-letterform__alert">
              <p className="font-semibold">{state.message}</p>
              {visibleErrors.length > 0 && (
                <ul>
                  {visibleErrors.map(([key, msg]) => (
                    <li key={key} id={`${key}-err`}>
                      {msg}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <p className="tp-letterform__line">
            my name is{" "}
            <BlankInput
              name="name"
              label="Your name (required)"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              size={16}
              error={errors.name}
            />
            , and you can reach me on{" "}
            <BlankInput
              name="phone"
              label="Phone or WhatsApp number with country code (required)"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              size={15}
              placeholder="+971 50 123 4567"
              error={errors.phone}
            />{" "}
            or by email at{" "}
            <BlankInput
              name="email"
              label="Email (optional)"
              type="email"
              autoComplete="email"
              size={20}
              placeholder="optional"
              error={errors.email}
            />
            .
          </p>

          <p className="tp-letterform__line">
            I live in{" "}
            <BlankInput
              name="area"
              label="Your area (optional)"
              autoComplete="address-level2"
              maxLength={80}
              size={13}
              placeholder="e.g. Dubai Marina"
              error={errors.area}
            />
            , and I&apos;m curious about{" "}
            <span className="tp-blank tp-blank--select">
              <label htmlFor={puppySelectId} className="sr-only">
                Puppy you&apos;re interested in (optional)
              </label>
              <select id={puppySelectId} name="puppyId" defaultValue="">
                <option value="">any puppy (not sure yet)</option>
                {puppies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </span>
            .
          </p>

          <label htmlFor={messageId} className="sr-only">
            Your message (optional)
          </label>
          <textarea
            id={messageId}
            name="message"
            rows={4}
            maxLength={2000}
            placeholder="Anything else you'd like to tell us…"
            className="tp-letterform__note"
            aria-invalid={Boolean(errors.message) || undefined}
            aria-describedby={errors.message ? "message-err" : undefined}
          />

          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
            </label>
          </div>

          <div className="tp-letterform__sign">
            <p className="font-scrawl">with love, a future puppy parent</p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary disabled:opacity-70"
            >
              {isSubmitting ? "Sealing the envelope…" : "Post my letter"}
            </button>
          </div>
        </form>
      )}

      {(phase === "sealing" || phase === "posting") && <EnvelopePostScene />}

      {phase === "sent" && (
        <div ref={sentRef} tabIndex={-1} role="status" className="tp-post__sent">
          <SentMailboxIcon />
          <p className="font-plush mt-4 text-[2rem]">{success.heading}</p>
          <p className="mx-auto mt-2 max-w-[40ch] text-cocoa-soft">{success.body}</p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp mt-6"
          >
            WhatsApp us
          </a>
        </div>
      )}
    </div>
  );
}

export default LetterForm;
