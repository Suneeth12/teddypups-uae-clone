import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/data/site";
import { PUPPIES } from "@/data/puppies";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_CONFIG.url}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_CONFIG.url}/puppies`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_CONFIG.url}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_CONFIG.url}/happy-families`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_CONFIG.url}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_CONFIG.url}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_CONFIG.url}/gone-home`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
  ];

  const puppyRoutes: MetadataRoute.Sitemap = PUPPIES.map((p) => ({
    url: `${SITE_CONFIG.url}/puppies/${p.slug}`,
    lastModified: now,
    changeFrequency: p.status === "available" ? "daily" : "monthly",
    priority: p.status === "available" ? 0.85 : 0.5,
  }));

  return [...staticRoutes, ...puppyRoutes];
}
