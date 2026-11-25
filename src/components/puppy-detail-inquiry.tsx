"use client";

import React, { useId, useState } from "react";
import { motion } from "motion/react";
import { Puppy } from "@/data/puppies";
import { SITE_CONFIG } from "@/data/site";
import { PAW_PATH } from "./puppy-card-sketch";

interface InquiryProps {
  puppy: Puppy;
}

interface FieldErrors {
  name?: string;
  phone?: string;
  email?: string;
  area?: string;
  message?: string;
}

const INPUT_CLASS =
  "mt-1.5 h-12 w-full rounded-2xl border-2 border-cocoa/60 bg-milk px-4 text-base outline-none transition-[border-color,box-shadow] focus:border-cocoa focus:shadow-[0_0_0_4px_rgb(242_190_107/0.6)] aria-[invalid=true]:border-[#b3261e]";

export default function PuppyDetailInquiry({ puppy }: InquiryProps) {
  const nameId = useId();
  const phoneId = useId();
  const emailId = useId();
  const areaId = useId();
  const messageId = useId();

  const puppyLabel = puppy.name ? `${puppy.displayName} (${puppy.breed})` : puppy.displayName;

  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formArea, setFormArea] = useState("");
  const [formMessage, setFormMessage] = useState(
    `Hi! I'd love to know more about ${puppyLabel}.`
  );
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [alertMessage, setAlertMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (website.trim()) return;

    const nextErrors: FieldErrors = {};
    const trimmedName = formName.trim();
    const trimmedPhone = formPhone.trim();
    const trimmedEmail = formEmail.trim();
    const digitsCount = trimmedPhone.replace(/\D/g, "").length;

    if (trimmedName.length < 2) {
      nextErrors.name = "Please enter your name (at least 2 characters).";
    }
    if (!trimmedPhone || digitsCount < 7) {
      nextErrors.phone = "Please enter a valid phone or WhatsApp number.";
    }
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setAlertMessage("Please check the highlighted fields and try again.");
      return;
    }

    setErrors({});
    setAlertMessage("");
    setFormSubmitted(true);
  };

  return (
    <section
      id={`enquire-${puppy.slug}`}
      aria-labelledby={`enquire-title-${puppy.slug}`}
      className="tp-letter mt-20 grid gap-10 lg:grid-cols-12"
    >
      <span aria-hidden="true" className="tp-letter__stamp">
        <svg viewBox="0 0 64 64" className="size-9" aria-hidden="true" fill="currentColor">
          <path d={PAW_PATH} />
        </svg>
      </span>

      <div className="lg:col-span-4">
        <p className="tp-chapter">
          <span aria-hidden="true" className="tp-chapter__n font-plush">
            4
          </span>
          <span className="font-scrawl">dear TeddyPups…</span>
        </p>
        <h2 id={`enquire-title-${puppy.slug}`} className="font-plush text-big mt-2">
          Ask about {puppy.displayName}
        </h2>
        <p className="mt-4 text-cocoa-soft">
          Leave your details and our team will get back to you promptly — or message us on WhatsApp
          for the quickest reply.
        </p>
      </div>

      <div className="lg:col-span-7 lg:col-start-6">
        {formSubmitted ? (
          <motion.div
            role="status"
            initial={{ rotateX: -80, opacity: 0, y: -10 }}
            animate={{ rotateX: 0, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 16 }}
            className="tp-sent rounded-[2rem] border-[3px] border-cocoa bg-honey p-8 text-center"
          >
            <svg viewBox="0 0 120 84" className="tp-envelope mx-auto w-32" aria-hidden="true">
              <path
                d="M6 10h108v68H6z"
                fill="#fffdf8"
                stroke="#2a170e"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path
                d="M6 10l54 40 54-40"
                fill="none"
                stroke="#2a170e"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <circle cx="94" cy="62" r="12" fill="#c2622b" stroke="#2a170e" strokeWidth="2.5" />
            </svg>
            <p className="font-plush mt-4 text-[2rem]">Message received!</p>
            <p className="mx-auto mt-2 max-w-[38ch] text-cocoa-soft">
              Thank you — our team will get back to you promptly. For the quickest reply, message us
              on WhatsApp.
            </p>
            <a
              href={SITE_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp mt-6"
            >
              WhatsApp us
            </a>
          </motion.div>
        ) : (
          <form onSubmit={handleFormSubmit} noValidate className="space-y-5">
            {alertMessage && (
              <p role="alert" className="rounded-2xl bg-blush px-4 py-3 font-semibold">
                {alertMessage}
              </p>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor={nameId} className="block text-[0.95rem] font-semibold">
                  Your name<span className="text-toffee-ink"> *</span>
                </label>
                <input
                  id={nameId}
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={80}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? `${nameId}-err` : undefined}
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  className={INPUT_CLASS}
                />
                {errors.name && (
                  <p id={`${nameId}-err`} className="mt-1 text-sm font-semibold text-[#b3261e]">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor={phoneId} className="block text-[0.95rem] font-semibold">
                  Phone or WhatsApp<span className="text-toffee-ink"> *</span>
                </label>
                <input
                  id={phoneId}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? `${phoneId}-err` : `${phoneId}-hint`}
                  value={formPhone}
                  onChange={(e) => {
                    setFormPhone(e.target.value);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  className={INPUT_CLASS}
                />
                {!errors.phone && (
                  <p id={`${phoneId}-hint`} className="mt-1 text-sm text-cocoa-soft">
                    With country code, e.g. +971 50 123 4567
                  </p>
                )}
                {errors.phone && (
                  <p id={`${phoneId}-err`} className="mt-1 text-sm font-semibold text-[#b3261e]">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor={emailId} className="block text-[0.95rem] font-semibold">
                  Email<span className="font-normal text-cocoa-soft"> (optional)</span>
                </label>
                <input
                  id={emailId}
                  name="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? `${emailId}-err` : undefined}
                  value={formEmail}
                  onChange={(e) => {
                    setFormEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={INPUT_CLASS}
                />
                {errors.email && (
                  <p id={`${emailId}-err`} className="mt-1 text-sm font-semibold text-[#b3261e]">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor={areaId} className="block text-[0.95rem] font-semibold">
                  Your area<span className="font-normal text-cocoa-soft"> (optional)</span>
                </label>
                <input
                  id={areaId}
                  name="area"
                  autoComplete="address-level2"
                  maxLength={80}
                  aria-invalid={Boolean(errors.area)}
                  aria-describedby={errors.area ? `${areaId}-err` : `${areaId}-hint`}
                  value={formArea}
                  onChange={(e) => setFormArea(e.target.value)}
                  className={INPUT_CLASS}
                />
                {!errors.area && (
                  <p id={`${areaId}-hint`} className="mt-1 text-sm text-cocoa-soft">
                    e.g. Dubai Marina
                  </p>
                )}
                {errors.area && (
                  <p id={`${areaId}-err`} className="mt-1 text-sm font-semibold text-[#b3261e]">
                    {errors.area}
                  </p>
                )}
              </div>
            </div>

            <input type="hidden" name="puppyId" value={puppy.id} />

            <div>
              <label htmlFor={messageId} className="block text-[0.95rem] font-semibold">
                Message <span className="font-normal text-cocoa-soft">(optional)</span>
              </label>
              <textarea
                id={messageId}
                name="message"
                rows={4}
                maxLength={2000}
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border-2 border-cocoa/60 bg-milk px-4 py-3 text-base outline-none focus:border-cocoa focus:shadow-[0_0_0_4px_rgb(242_190_107/0.6)]"
              />
              {errors.message && (
                <p className="mt-1 text-sm font-semibold text-[#b3261e]">{errors.message}</p>
              )}
            </div>

            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Website
                <input
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </label>
            </div>

            <button type="submit" className="btn btn-primary w-full disabled:opacity-70 sm:w-auto">
              Send enquiry
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
