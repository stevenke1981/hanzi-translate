import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { absoluteSiteUrl, getSiteOrigin } from "../lib/site-metadata";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const requestHeaders = await headers();
  const base = getSiteOrigin(requestHeaders.get("host"));
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: absoluteSiteUrl(base, "/sitemap.xml"),
  };
}
