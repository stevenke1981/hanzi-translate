export const PUBLIC_SITE_URL =
  "https://translate.aquamoon.app";
export const AQUAMOON_SITE_URL = "https://aquamoon.app";
export const SITE_CONTENT_UPDATED_AT = "2026-08-03";

export function isAquaMoonHost(host: string | null | undefined) {
  const normalized = host?.split(":", 1)[0].toLowerCase();
  return normalized === "aquamoon.app" || normalized === "www.aquamoon.app";
}

export function getSiteOrigin(host?: string | null) {
  if (isAquaMoonHost(host)) return new URL(AQUAMOON_SITE_URL);
  if (host?.split(":", 1)[0].toLowerCase() === "translate.aquamoon.app") {
    return new URL(PUBLIC_SITE_URL);
  }
  return new URL(process.env.NEXT_PUBLIC_SITE_URL || PUBLIC_SITE_URL);
}

export function absoluteSiteUrl(origin: URL, path = "/") {
  return new URL(path, origin).toString();
}
