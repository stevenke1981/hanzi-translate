import type { Metadata } from "next";
import Link from "next/link";
import LanguageSync from "../../components/language-sync";

export const metadata: Metadata = {
  title: "服務條款",
  description: "譯匠免費文字轉換與翻譯服務的使用條款。",
  alternates: { canonical: "/terms" },
  openGraph: {
    type: "website",
    title: "服務條款｜譯匠",
    description: "譯匠免費文字轉換與翻譯服務的使用條款。",
    url: "/terms",
  },
  twitter: {
    title: "服務條款｜譯匠",
    description: "譯匠免費文字轉換與翻譯服務的使用條款。",
  },
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TermsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const isEnglish =
    params.lang === "en" ||
    (Array.isArray(params.lang) && params.lang.includes("en"));
  const copy = isEnglish
    ? {
        language: "繁中",
        languageHref: "/terms",
        title: "Terms of service",
        updated: "Last updated: July 29, 2026",
        sections: [
          ["Service", "Yijiang provides script conversion, text encoding and decoding, and Chinese-English translation tools. The service may be temporarily unavailable because of maintenance, provider limits, or network conditions."],
          ["Fair use", "Do not use the service for unlawful activity, to bypass usage limits, automate large volumes of requests, infringe rights, or harm service security. We may limit abnormal traffic."],
          ["Translation results", "Machine translation may contain errors and should not be the sole basis for medical, legal, financial, or other high-risk decisions. Have important content reviewed by a qualified person."],
          ["Your API key and fees", "When you use a third-party API key, that provider controls the related fees, quota, and terms. Protect your key and monitor your account."],
          ["Advertising", "The service may display third-party advertising. Advertisers are responsible for their content, products, and services; transactions between you and an advertiser are not part of Yijiang's service."],
        ],
        back: "← Back to Yijiang",
      }
    : {
        language: "English",
        languageHref: "/terms?lang=en",
        title: "服務條款",
        updated: "最後更新：2026 年 7 月 29 日",
        sections: [
          ["服務內容", "譯匠提供簡繁轉換、文字編碼解碼與中英翻譯工具。服務可能因維護、供應商限制或網路狀況暫時無法使用。"],
          ["合理使用", "請勿利用本站進行違法活動、繞過使用限制、自動化大量請求、侵害他人權利或危害服務安全。本站得限制異常流量。"],
          ["翻譯結果", "自動翻譯可能出現錯誤，不應直接作為醫療、法律、財務或其他高風險決策的唯一依據。重要內容請由合格人員覆核。"],
          ["自備金鑰與費用", "使用第三方 API Key 時，相關費用、額度與條款由該供應商決定。使用者應自行保護金鑰並留意帳務。"],
          ["廣告", "本站可能顯示第三方廣告。廣告內容、商品或服務由廣告主負責；使用者與廣告主之間的交易不屬於本站服務。"],
        ],
        back: "← 返回譯匠",
      };

  return (
    <>
      <LanguageSync locale={isEnglish ? "en" : "zh-Hant"} title={copy.title} />
      <main className="legal-page">
      <header className="legal-header">
        <Link className="brand" href={isEnglish ? "/?lang=en" : "/"}>
          <span className="brand-mark" aria-hidden="true"><i /><i /></span>
          <strong>譯匠</strong>
        </Link>
        <h1>{copy.title}</h1>
        <p>{copy.updated}</p>
        <p><a href={copy.languageHref}>{copy.language}</a></p>
      </header>
      <article className="legal-content">
        {copy.sections.map(([heading, body]) => (
          <section key={heading}>
            <h2>{heading}</h2>
            <p>{body}</p>
          </section>
        ))}
        <p><Link href={isEnglish ? "/?lang=en" : "/"}>{copy.back}</Link></p>
      </article>
      </main>
    </>
  );
}
