import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_PUPPIES, getPuppyBySlug } from "@/data/puppies";
import PuppyDetailView from "@/components/PuppyDetailView";

interface PuppyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return ALL_PUPPIES.map((puppy) => ({
    slug: puppy.slug,
  }));
}

export async function generateMetadata({
  params,
}: PuppyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const puppy = getPuppyBySlug(slug);
  if (!puppy) {
    return {
      title: "Puppy Not Found | TeddyPups U.A.E.",
    };
  }

  const ogTitle = puppy.name
    ? `${puppy.displayName}, ${puppy.breed} puppy`
    : `${puppy.displayName} puppy`;
  const title = `${ogTitle} | TeddyPups U.A.E.`;
  const description = `Meet ${puppy.displayName}: ${puppy.breed}, ${puppy.genderLabel.toLowerCase()}${
    puppy.age ? `, ${puppy.age} old` : ""
  }, ${puppy.origin?.slug === "local" ? "in Dubai" : "imported"}. Real photos and video from TeddyPups U.A.E.`;

  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description,
      images: puppy.cover
        ? [
            {
              url: puppy.cover.url,
              width: puppy.cover.width,
              height: puppy.cover.height,
              alt: puppy.cover.alt,
            },
          ]
        : [],
    },
  };
}

export default async function PuppyPage({ params }: PuppyPageProps) {
  const { slug } = await params;
  const puppy = getPuppyBySlug(slug);

  if (!puppy) {
    notFound();
  }

  return <PuppyDetailView puppy={puppy} />;
}
