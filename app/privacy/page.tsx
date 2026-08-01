import type { Metadata } from "next";
import Link from "next/link";
import LanguageSync from "../../components/language-sync";

export const metadata: Metadata = {
  title: "隱私權政策",
  description: "瞭解譯匠如何處理文字、API Key、使用額度、Cookie 與廣告資料。",
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    title: "隱私權政策｜譯匠",
    description: "瞭解譯匠如何處理文字、API Key、使用額度、Cookie 與廣告資料。",
    url: "/privacy",
  },
  twitter: {
    title: "隱私權政策｜譯匠",
    description: "瞭解譯匠如何處理文字、API Key、使用額度、Cookie 與廣告資料。",
  },
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PrivacyPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const isEnglish =
    params.lang === "en" ||
    (Array.isArray(params.lang) && params.lang.includes("en"));
  const copy = isEnglish
    ? {
        language: "繁中",
        languageHref: "/privacy",
        title: "Privacy policy",
        updated: "Last updated: July 29, 2026",
        sections: [
          ["What data we process", "Script conversion and text encoding run in your browser, so your input is not sent to this site. Chinese-English translation sends text to the provider you choose so it can return a result."],
          ["Free quota and abuse prevention", "To keep the free service available, we create a one-way hash from a visitor network address and a random salt. Only the date, request count, and minute-level rate information are kept temporarily while the service runs. The original address is not written to our database."],
          ["Bring your own API key", "Your key is stored only in this browser. It is sent briefly to this site when you submit a translation request, and is never written to our database. Do not keep a key on a shared device."],
          ["Google ads and cookies", "After you accept advertising cookies, Google AdSense may use cookies, device information, and ad interaction data to display ads, limit frequency, and measure performance. You can decline without affecting the text tools."],
          ["Third-party services", "The service may use a free translation provider or a provider configured by the site. You may also choose OpenAI, OpenRouter, Gemini, or xAI with your own key. Google AdSense loads only after your consent."],
          ["Retention and deletion", "You can clear browser site data to remove local API settings and advertising consent. Anonymous quota information is used only to limit abuse and is cleared when the service instance restarts."],
        ],
        back: "← Back to Yijiang",
        adsLink: "Google advertising policy",
      }
    : {
        language: "English",
        languageHref: "/privacy?lang=en",
        title: "隱私權政策",
        updated: "最後更新：2026 年 7 月 29 日",
        sections: [
          ["我們處理哪些資料", "簡繁轉換與文字編碼在您的瀏覽器內完成，輸入內容不會傳送到本站伺服器。使用中英翻譯時，文字會傳送至所選翻譯供應商，以提供翻譯結果。"],
          ["免費額度與防止濫用", "為維持免費服務，我們會將訪客的網路位址與隨機鹽值產生不可逆雜湊，只在服務執行期間暫存日期、使用次數與分鐘級速率資訊。原始網路位址不會寫入本站資料庫。"],
          ["自備 API Key", "自備金鑰只儲存在目前裝置的瀏覽器儲存空間；送出翻譯請求時才短暫傳送至本站伺服器，本站不會將金鑰寫入資料庫。請勿在共用裝置長期保存金鑰。"],
          ["Google 廣告與 Cookie", "您同意廣告 Cookie 後，Google AdSense 可能使用 Cookie、裝置資訊與廣告互動資料來顯示、限制頻率及衡量廣告。您可以拒絕，且不影響文字工具。"],
          ["第三方服務", "免費翻譯服務或站方設定的 AI 翻譯供應商；您主動選擇的 OpenAI、OpenRouter、Gemini 或 xAI；以及經您同意後載入的 Google AdSense。"],
          ["保存與刪除", "您可清除瀏覽器網站資料，移除本機 API 設定與廣告同意選項。匿名額度資訊只用於限制服務濫用，服務執行個體重啟後即會清除。"],
        ],
        back: "← 返回譯匠",
        adsLink: "Google 廣告政策",
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
            <p>
              {body}
              {heading === "Google 廣告與 Cookie" && !isEnglish && (
                <> 更多資訊請參閱 <a href="https://policies.google.com/technologies/ads">{copy.adsLink}</a>。</>
              )}
              {heading === "Google ads and cookies" && isEnglish && (
                <> See the <a href="https://policies.google.com/technologies/ads">{copy.adsLink}</a> for more information.</>
              )}
            </p>
          </section>
        ))}
        <p><Link href={isEnglish ? "/?lang=en" : "/"}>{copy.back}</Link></p>
      </article>
      </main>
    </>
  );
}
