import type { MetadataRoute } from "next";
import { absoluteSiteUrl, getSiteOrigin } from "../lib/site-metadata";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await getSiteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: absoluteSiteUrl(base, "/sitemap.xml"),
  };
}
