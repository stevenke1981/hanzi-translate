import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteName = "譯匠";
const title = "譯匠｜免費簡繁轉換、文字編碼與中英翻譯工具";
const description =
  "免費線上簡繁體中文轉換、Base64、URL、Unicode、HTML 與 UTF-8 編碼解碼，並支援中文英文互譯。免安裝、快速、重視隱私。";

export const metadata: Metadata = {
  title: {
    default: title,
    template: `%s｜${siteName}`,
  },
  description,
  keywords: [
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
  applicationName: siteName,
  category: "utility",
  referrer: "origin-when-cross-origin",
  alternates: {
    languages: {
      "zh-TW": "/",
      "zh-CN": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName,
    title,
    description,
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
  other: {
    "codex-preview": "development",
    "google-adsense-account":
      process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7faff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
