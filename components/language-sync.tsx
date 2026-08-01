"use client";

import { useEffect } from "react";

export default function LanguageSync({
  locale,
  title,
}: {
  locale: "zh-Hant" | "en";
  title: string;
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = `${title}｜譯匠`;
  }, [locale, title]);

  return null;
}
