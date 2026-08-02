export const PUBLIC_SITE_URL =
  "https://translate.aquamoon.app";
export const SITE_CONTENT_UPDATED_AT = "2026-08-03";

export function getSiteOrigin() {
  return new URL(process.env.NEXT_PUBLIC_SITE_URL || PUBLIC_SITE_URL);
}

export function absoluteSiteUrl(origin: URL, path = "/") {
  return new URL(path, origin).toString();
}
