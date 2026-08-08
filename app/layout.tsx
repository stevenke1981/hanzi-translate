import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { getSiteOrigin, isAquaMoonHost } from "../lib/site-metadata";

const siteName = "譯匠";
const title = "譯匠｜免費簡繁轉換、文字編碼與中英翻譯工具";
const description =
  "免費線上簡繁體中文轉換、Base64、URL、Unicode、HTML 與 UTF-8 編碼解碼，並支援中文英文互譯。免安裝、快速、重視隱私。";
const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();
async function metadataBase() {
  const requestHeaders = await headers();
  return getSiteOrigin(requestHeaders.get("host"));
}

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const isAquaMoon = isAquaMoonHost(requestHeaders.get("host"));
  return {
    metadataBase: await metadataBase(),
    title: isAquaMoon
      ? { default: "AquaMoon｜清楚、可靠的網路工具", template: "%s" }
      : { default: title, template: `%s｜${siteName}` },
    description,
    keywords: isAquaMoon
      ? ["AquaMoon", "網路工具", "線上工具", "譯匠"]
      : [
          "簡繁轉換",
          "繁簡轉換",
          "簡體轉繁體",
          "繁體轉簡體",
          "中文翻譯",
          "中英翻譯",
          "英文翻譯",
          "Base64 解碼",
          "URL 編碼",
          "Unicode 轉換",
          "文字編碼",
        ],
    applicationName: isAquaMoon ? "AquaMoon" : siteName,
    category: "utility",
    referrer: "origin-when-cross-origin",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "zh_TW",
      siteName: isAquaMoon ? "AquaMoon" : siteName,
      title: isAquaMoon ? "AquaMoon｜清楚、可靠的網路工具" : title,
      description: isAquaMoon
        ? "AquaMoon 打造清楚、可靠並尊重資料的網路工具。"
        : description,
      url: "/",
      images: [
        {
          url: "/og.png",
          width: 1728,
          height: 910,
          alt: "譯匠｜簡繁、編碼與中英翻譯",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
    other: {
      "google-adsense-account":
        process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "",
    },
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7faff",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const isAquaMoon = isAquaMoonHost(requestHeaders.get("host"));
  const siteUrl = getSiteOrigin(requestHeaders.get("host")).toString().replace(/\/$/, "");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: `${siteUrl}/`,
      name: isAquaMoon ? "AquaMoon" : siteName,
      alternateName: isAquaMoon ? "AquaMoon 網路工具" : "譯匠文字工具",
    inLanguage: "zh-Hant",
  };

  return (
    <html lang="zh-Hant">
      <head>
        {adsenseClient ? (
          <script
            id="google-adsense-script"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseClient)}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
