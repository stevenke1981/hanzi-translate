import type { MetadataRoute } from "next";
import {
  absoluteSiteUrl,
  getSiteOrigin,
  SITE_CONTENT_UPDATED_AT,
} from "../lib/site-metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await getSiteOrigin();
  const lastModified = new Date(`${SITE_CONTENT_UPDATED_AT}T00:00:00.000Z`);
  return [
    {
      url: absoluteSiteUrl(base),
      lastModified,
    },
    {
      url: absoluteSiteUrl(base, "/privacy"),
      lastModified,
    },
    {
      url: absoluteSiteUrl(base, "/terms"),
      lastModified,
    },
  ];
}
