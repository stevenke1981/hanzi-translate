# 在 ChatGPT Codex Desktop 繼續開發

## Windows

1. 將 ZIP 解壓縮到固定位置，例如：

   ```text
   C:\Projects\hanzi-translate
   ```

2. 開啟 ChatGPT Codex Desktop。
3. 選擇「Open folder／開啟資料夾」。
4. 選取解壓後的 `hanzi-translate` 資料夾。
5. 在 Codex 對話輸入：

   ```text
   請先完整閱讀 AGENTS.md、README.md 與 .openai/hosting.json，
   檢查專案狀態後繼續開發。保留既有功能與 SEO，不要重新初始化專案。
   ```

## 第一次啟動

```bash
npm ci
npm run dev
```

需要 Node.js 22.13 或更新版本。

## 正式網站

<https://translate.aquamoon.app>

Cloudflare Worker 備援網址：
<https://hanzi-translate.stevenke1981.workers.dev>

`.openai/hosting.json` 已保留原 Sites 專案識別。Codex 修改網站時，不要刪除、
改寫或重新建立這個檔案。

## 發布到自己的 Cloudflare 帳號

若要改用自己的 Cloudflare 帳號，先在 Codex Desktop 終端完成：

```bash
npx wrangler login
```

登入完成後再要求 Codex 檢查並建立適合此 Vinext 專案的 Cloudflare 部署設定。
不要把 Cloudflare Token 或其他密鑰貼進對話。
