export const PUBLIC_SITE_URL =
  "https://hanzi-translate.stevenke1981.workers.dev";
export const SITE_CONTENT_UPDATED_AT = "2026-08-01";

export function getSiteOrigin() {
  return new URL(process.env.NEXT_PUBLIC_SITE_URL || PUBLIC_SITE_URL);
}

export function absoluteSiteUrl(origin: URL, path = "/") {
  return new URL(path, origin).toString();
}
