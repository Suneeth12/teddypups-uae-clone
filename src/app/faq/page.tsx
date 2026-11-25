import type { Metadata } from "next";
import type React from "react";
import { NoticeBoard } from "@/components/NoticeBoard";
import { FAQS } from "@/data/faqs";
import { SITE_CONFIG } from "@/data/site";

export const metadata: Metadata = {
  title: "Questions & answers | TeddyPups U.A.E.",
  description:
    "Answers about TeddyPups puppies: health checks and vaccinations, meeting local puppies, imported teacup breeds and delivery.",
  alternates: { canonical: "https://puppy.instabizweb.com/faq" },
  openGraph: {
    title: "Questions & answers | TeddyPups U.A.E.",
    description:
      "Answers about TeddyPups puppies: health checks and vaccinations, meeting local puppies, imported teacup breeds and delivery.",
    siteName: "TeddyPups U.A.E.",
    locale: "en_AE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Questions & answers | TeddyPups U.A.E.",
    description:
      "Answers about TeddyPups puppies: health checks and vaccinations, meeting local puppies, imported teacup breeds and delivery.",
  },
};

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div data-page="faq" className="tp-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section
        data-pup-scene="true"
        data-tone="dark"
        className="tp-scene tp-faqroom overflow-hidden"
        style={
          {
            "--sky-top": "#a95e32",
            "--sky-bottom": "#331c11",
          } as React.CSSProperties
        }
        aria-labelledby="faq-title"
      >
        <div className="gutter relative mx-auto max-w-[110rem] pb-24 pt-10 md:pt-16">
          <header className="max-w-4xl">
            <h1 id="faq-title" className="font-plush text-giant">
              Questions &amp; answers
            </h1>
            <p className="text-lede mt-6 max-w-[52ch] text-[var(--ink-soft)]">
              Can&apos;t find what you&apos;re looking for? Message us on WhatsApp — our team is available 24/7.
            </p>
          </header>

          <div className="mt-12 md:mt-16">
            <NoticeBoard items={FAQS} askHref={SITE_CONFIG.whatsappUrl} />
          </div>
        </div>
      </section>
    </div>
  );
}
