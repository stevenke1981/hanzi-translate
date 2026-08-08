import type { Metadata } from "next";

const ROOT_URL = "https://aquamoon.app";
const TRANSLATOR_URL = "https://translate.aquamoon.app/";

export const metadata: Metadata = {
  metadataBase: new URL(ROOT_URL),
  title: { absolute: "AquaMoon｜清楚、可靠的網路工具" },
  description:
    "AquaMoon 打造專注、清楚並尊重使用者資料的網路工具。從譯匠開始，持續整理更多真正有用的應用。",
  alternates: { canonical: `${ROOT_URL}/` },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "AquaMoon",
    title: "AquaMoon｜清楚、可靠的網路工具",
    description:
      "AquaMoon 打造專注、清楚並尊重使用者資料的網路工具。",
    url: `${ROOT_URL}/`,
    images: [
      {
        url: `${ROOT_URL}/og.png`,
        width: 1728,
        height: 910,
        alt: "AquaMoon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AquaMoon｜清楚、可靠的網路工具",
    description:
      "AquaMoon 打造專注、清楚並尊重使用者資料的網路工具。",
    images: [`${ROOT_URL}/og.png`],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${ROOT_URL}/#organization`,
      name: "AquaMoon",
      url: `${ROOT_URL}/`,
      description:
        "AquaMoon 打造專注、清楚並尊重使用者資料的網路工具。",
    },
    {
      "@type": "WebSite",
      "@id": `${ROOT_URL}/#website`,
      url: `${ROOT_URL}/`,
      name: "AquaMoon",
      publisher: { "@id": `${ROOT_URL}/#organization` },
      inLanguage: "zh-Hant",
    },
  ],
};

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <i />
      <i />
    </span>
  );
}

export default function AquaMoonPage() {
  return (
    <div className="aqua-home">
      <a className="skip-link" href="#aqua-main">
        跳至主要內容
      </a>

      <header className="aqua-header">
        <a className="brand" href={ROOT_URL} aria-label="AquaMoon 首頁">
          <BrandMark />
          <strong>AquaMoon</strong>
        </a>
        <nav aria-label="主要導覽">
          <a href="#products">產品</a>
          <a href="#principles">設計原則</a>
          <a href="#faq">常見問題</a>
          <a href="/privacy">隱私</a>
        </nav>
        <a className="header-cta" href={TRANSLATOR_URL}>
          開啟譯匠
        </a>
      </header>

      <main id="aqua-main">
        <section className="aqua-hero" aria-labelledby="aqua-title">
          <div className="aqua-hero-copy">
            <p className="aqua-eyebrow">
              <span /> AQUAMOON / DIGITAL TOOLS
            </p>
            <h1 id="aqua-title">讓好工具，先被理解，再被使用。</h1>
            <p className="aqua-lede">
              AquaMoon 打造專注、清楚並尊重使用者資料的網路工具。從文字開始，
              持續整理更多能真正解決日常問題的應用。
            </p>
            <div className="aqua-actions">
              <a className="primary-button" href={TRANSLATOR_URL}>
                開啟譯匠
                <span aria-hidden="true">→</span>
              </a>
              <a className="secondary-button" href="#principles">
                了解我們的原則
              </a>
            </div>
            <p className="aqua-note">
              <span aria-hidden="true">✓</span> 目前可用：譯匠文字工具
            </p>
          </div>
          <div className="aqua-hero-art" aria-hidden="true">
            <div className="aqua-moon-orbit aqua-moon-orbit-one" />
            <div className="aqua-moon-orbit aqua-moon-orbit-two" />
            <div className="aqua-moon-core">AM</div>
          </div>
        </section>

        <section className="aqua-section" id="products" aria-labelledby="products-title">
          <div className="aqua-section-heading">
            <p className="aqua-eyebrow">目前可用</p>
            <h2 id="products-title">一個專注的入口，先把事情做好。</h2>
            <p>
              AquaMoon 目前推出譯匠，將常見的中文文字工作集中在一個簡潔、快速的工作區。
            </p>
          </div>
          <article className="aqua-product-card">
            <div className="aqua-product-icon" aria-hidden="true">譯</div>
            <div className="aqua-product-content">
              <p className="aqua-card-kicker">YIJIANG / 譯匠</p>
              <h3>簡繁、編碼與中英翻譯</h3>
              <p>
                在瀏覽器內完成簡體與繁體轉換、Base64／URL／Unicode／HTML／UTF-8
                編碼處理，並可使用免費額度或自己的 API Key 進行中英翻譯。
              </p>
              <ul className="aqua-feature-list">
                <li>自動偵測簡體中文並輸出繁體中文或英文</li>
                <li>簡繁與編碼處理在本機完成，不限次數</li>
                <li>自備 API Key 僅保留在使用者裝置</li>
              </ul>
              <a className="aqua-text-link" href={TRANSLATOR_URL}>
                前往 translate.aquamoon.app <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        </section>

        <section className="aqua-section aqua-section-muted" id="principles" aria-labelledby="principles-title">
          <div className="aqua-section-heading">
            <p className="aqua-eyebrow">我們如何做工具</p>
            <h2 id="principles-title">少一點干擾，多一點掌控。</h2>
            <p>
              每個功能都從使用者真正要完成的事情出發，讓介面、資料與結果都保持可理解。
            </p>
          </div>
          <div className="aqua-principle-grid">
            <article>
              <span className="aqua-principle-number">01</span>
              <h3>清楚</h3>
              <p>用明確的文字、分層與回饋，讓第一次使用也知道下一步。</p>
            </article>
            <article>
              <span className="aqua-principle-number">02</span>
              <h3>可靠</h3>
              <p>保留可回復的操作，為錯誤、額度與外部服務中斷提供清楚說明。</p>
            </article>
            <article>
              <span className="aqua-principle-number">03</span>
              <h3>尊重</h3>
              <p>不把使用者的文字或金鑰當成產品資產，讓資料邊界容易理解與管理。</p>
            </article>
          </div>
        </section>

        <section className="aqua-section aqua-story" aria-labelledby="story-title">
          <div>
            <p className="aqua-eyebrow">關於 AquaMoon</p>
            <h2 id="story-title">從一個實用工具，慢慢長成一個值得信任的工具集。</h2>
          </div>
          <div className="aqua-story-copy">
            <p>
              我們相信，好的網路工具不需要複雜的學習曲線。它應該在需要時快速出現，
              把重要資訊說清楚，並在使用者離開時留下乾淨的資料邊界。
            </p>
            <p>
              AquaMoon 會以這個原則持續推出不同用途的應用。現在先從譯匠開始，
              讓中文文字工作變得更容易，也為後續產品保留一致的使用體驗。
            </p>
          </div>
        </section>

        <section className="aqua-section aqua-faq" id="faq" aria-labelledby="faq-title">
          <div className="aqua-section-heading">
            <p className="aqua-eyebrow">常見問題</p>
            <h2 id="faq-title">在開始之前，先了解幾件事。</h2>
          </div>
          <div className="aqua-faq-list">
            <details>
              <summary>AquaMoon 現在有哪些產品？</summary>
              <p>目前可使用譯匠文字工具，未來會在這個根網域整理其他正式上線的應用。</p>
            </details>
            <details>
              <summary>譯匠會保存我輸入的文字嗎？</summary>
              <p>簡繁與編碼處理在瀏覽器內完成；翻譯功能則依所選供應商傳送必要文字。詳細規則請閱讀隱私權政策。</p>
            </details>
            <details>
              <summary>網站會顯示廣告嗎？</summary>
              <p>網站可能使用 Google AdSense 維持免費服務；廣告會在同意相關選項後載入，且不影響文字工具的基本使用。</p>
            </details>
          </div>
        </section>

        <section className="aqua-final-cta" aria-labelledby="final-cta-title">
          <p className="aqua-eyebrow">現在就開始</p>
          <h2 id="final-cta-title">先用譯匠，感受 AquaMoon 的第一個工具。</h2>
          <a className="primary-button" href={TRANSLATOR_URL}>
            開啟譯匠
            <span aria-hidden="true">→</span>
          </a>
        </section>
      </main>

      <footer className="aqua-footer">
        <div className="footer-brand">
          <a className="brand" href={ROOT_URL}>
            <BrandMark />
            <strong>AquaMoon</strong>
          </a>
          <p>清楚、可靠、尊重資料的網路工具。</p>
        </div>
        <div className="footer-links">
          <a href={TRANSLATOR_URL}>譯匠</a>
          <a href="/privacy">隱私權政策</a>
          <a href="/terms">服務條款</a>
        </div>
        <p className="copyright">© {new Date().getFullYear()} AquaMoon</p>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
