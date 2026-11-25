"use client";

import React, { useId, useMemo, useState } from "react";
import { PupBuddy } from "@/components/PupBuddy";
import RevealScope from "@/components/RevealScope";
import type { FAQItem } from "@/data/faqs";
import { SITE_CONFIG } from "@/data/site";

const TILTS = [-1.6, 1.2, -0.8, 1.8, -1.2, 0.7, -1.9, 1.4];
const PINS = [
  "var(--color-toffee)",
  "var(--color-sky-deep)",
  "#d9a13c",
  "#c45a6a",
];

function HighlightedText({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const parts = text.split(
    new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  );
  return (
    <>
      {parts.map((part, i) =>
        i % 2 ? (
          <mark key={i}>{part}</mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

interface NoticeBoardProps {
  items: FAQItem[];
  askHref?: string;
}

export function NoticeBoard({
  items,
  askHref = SITE_CONFIG.whatsappUrl,
}: NoticeBoardProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchId = useId();

  const qTrim = searchQuery.trim().toLowerCase();
  const filteredItems = useMemo(
    () =>
      qTrim
        ? items.filter((item) =>
            `${item.question} ${item.answer}`.toLowerCase().includes(qTrim)
          )
        : items,
    [items, qTrim]
  );

  return (
    <div className="tp-notes" data-open={openId || qTrim ? "" : undefined}>
      <aside className="tp-notes__side" aria-label="Find a question">
        <label htmlFor={searchId} className="font-scrawl tp-notes__label">
          sniff out a question
        </label>
        <div className="tp-notes__search">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="tp-notes__lens">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m15.5 15.5 5 5" />
          </svg>
          <input
            id={searchId}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="delivery, Korea, vaccinated…"
            autoComplete="off"
          />
        </div>
        <p className="tp-notes__count" aria-live="polite">
          {searchQuery.trim()
            ? `${filteredItems.length} ${filteredItems.length === 1 ? "note" : "notes"} found`
            : `${items.length} notes on the board`}
        </p>

        <div className="tp-notes__teddy">
          <span aria-hidden="true" className="tp-notes__bubble font-plush">
            <span className="tp-notes__q">?</span>
            <span className="tp-notes__a">!</span>
          </span>
          <PupBuddy pose="sit" act="tilt" label="Teddy, reading the notes" />
        </div>

        <a
          href={askHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp tp-notes__ask"
        >
          Ask your own question
        </a>
      </aside>

      <RevealScope className="tp-notes__board">
        <ul className="tp-notes__list">
          {filteredItems.map((item, idx) => {
            const isOpen =
              openId === item.id ||
              (Boolean(qTrim) && item.answer.toLowerCase().includes(qTrim));
            const qId = `q-${item.id}`;
            const aId = `a-${item.id}`;

            return (
              <li
                key={item.id}
                className="tp-note"
                data-reveal={true}
                data-unfolded={isOpen || undefined}
                style={
                  {
                    "--tilt": `${TILTS[idx % TILTS.length]}deg`,
                    "--pin": PINS[idx % PINS.length],
                    "--i": idx,
                  } as React.CSSProperties
                }
              >
                <span aria-hidden="true" className="tp-note__pin" />
                <h2 className="tp-note__q">
                  <button
                    type="button"
                    id={qId}
                    aria-expanded={isOpen}
                    aria-controls={aId}
                    onClick={() => setOpenId(openId === item.id ? null : item.id)}
                  >
                    <span className="font-plush-text">
                      <HighlightedText text={item.question} query={searchQuery} />
                    </span>
                    <span aria-hidden="true" className="tp-note__chevron" />
                  </button>
                </h2>
                <div
                  id={aId}
                  role="region"
                  aria-labelledby={qId}
                  className="tp-note__answer"
                  inert={!isOpen}
                >
                  <div className="tp-note__flap">
                    <p>
                      <HighlightedText text={item.answer} query={searchQuery} />
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {!filteredItems.length && (
          <div className="tp-note tp-note--empty">
            <span aria-hidden="true" className="tp-note__pin" />
            <p className="font-plush-text text-[1.2rem] font-bold">
              No note about “{searchQuery.trim()}” yet.
            </p>
            <p className="mt-2">
              <a
                href={askHref}
                target="_blank"
                rel="noopener noreferrer"
                className="link-ink"
              >
                Ask us on WhatsApp
              </a>{" "}
              and we&apos;ll answer.
            </p>
          </div>
        )}
      </RevealScope>
    </div>
  );
}

export default NoticeBoard;
