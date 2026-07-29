import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "隱私權政策",
  description: "瞭解譯匠如何處理文字、API Key、使用額度、Cookie 與廣告資料。",
};

export default function PrivacyPage() {
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
        <h1>隱私權政策</h1>
        <p>最後更新：2026 年 7 月 29 日</p>
      </header>
      <article className="legal-content">
        <section>
          <h2>我們處理哪些資料</h2>
          <p>
            簡繁轉換與文字編碼在您的瀏覽器內完成，輸入內容不會傳送到本站伺服器。使用中英翻譯時，文字會傳送至所選翻譯供應商，以提供翻譯結果。
          </p>
        </section>
        <section>
          <h2>免費額度與防止濫用</h2>
          <p>
            為維持免費服務，我們會將訪客的網路位址與隨機鹽值產生不可逆雜湊，只在服務執行期間暫存日期、使用次數與分鐘級速率資訊。原始網路位址不會寫入本站資料庫。
          </p>
        </section>
        <section>
          <h2>自備 API Key</h2>
          <p>
            自備金鑰只儲存在目前裝置的瀏覽器儲存空間；送出翻譯請求時才短暫傳送至本站伺服器，本站不會將金鑰寫入資料庫。請勿在共用裝置長期保存金鑰。
          </p>
        </section>
        <section>
          <h2>Google 廣告與 Cookie</h2>
          <p>
            您同意廣告 Cookie 後，Google AdSense
            可能使用 Cookie、裝置資訊與廣告互動資料來顯示、限制頻率及衡量廣告。您可以拒絕，且不影響文字工具。更多資訊請參閱{" "}
            <a href="https://policies.google.com/technologies/ads">
              Google 廣告政策
            </a>
            。
          </p>
        </section>
        <section>
          <h2>第三方服務</h2>
          <ul>
            <li>免費翻譯服務或站方設定的 AI 翻譯供應商</li>
            <li>您主動選擇的 OpenAI、OpenRouter、Gemini 或 xAI</li>
            <li>經您同意後載入的 Google AdSense</li>
          </ul>
        </section>
        <section>
          <h2>保存與刪除</h2>
          <p>
            您可清除瀏覽器網站資料，移除本機 API
            設定與廣告同意選項。匿名額度資訊只用於限制服務濫用，服務執行個體重啟後即會清除。
          </p>
        </section>
        <p>
          <Link href="/">← 返回譯匠</Link>
        </p>
      </article>
    </main>
  );
}
