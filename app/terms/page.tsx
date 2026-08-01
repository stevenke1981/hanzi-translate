import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "服務條款",
  description: "譯匠免費文字轉換與翻譯服務的使用條款。",
  alternates: {
    canonical: "/terms",
  },
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

export default function TermsPage() {
  return (
    <main className="legal-page">
      <header className="legal-header">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
          </span>
          <strong>譯匠</strong>
        </Link>
        <h1>服務條款</h1>
        <p>最後更新：2026 年 7 月 29 日</p>
      </header>
      <article className="legal-content">
        <section>
          <h2>服務內容</h2>
          <p>
            譯匠提供簡繁轉換、文字編碼解碼與中英翻譯工具。服務可能因維護、供應商限制或網路狀況暫時無法使用。
          </p>
        </section>
        <section>
          <h2>合理使用</h2>
          <p>
            請勿利用本站進行違法活動、繞過使用限制、自動化大量請求、侵害他人權利或危害服務安全。本站得限制異常流量。
          </p>
        </section>
        <section>
          <h2>翻譯結果</h2>
          <p>
            自動翻譯可能出現錯誤，不應直接作為醫療、法律、財務或其他高風險決策的唯一依據。重要內容請由合格人員覆核。
          </p>
        </section>
        <section>
          <h2>自備金鑰與費用</h2>
          <p>
            使用第三方 API Key 時，相關費用、額度與條款由該供應商決定。使用者應自行保護金鑰並留意帳務。
          </p>
        </section>
        <section>
          <h2>廣告</h2>
          <p>
            本站可能顯示第三方廣告。廣告內容、商品或服務由廣告主負責；使用者與廣告主之間的交易不屬於本站服務。
          </p>
        </section>
        <p>
          <Link href="/">← 返回譯匠</Link>
        </p>
      </article>
    </main>
  );
}
