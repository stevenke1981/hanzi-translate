# 譯匠

繁體／簡體中文轉換、文字編碼解碼與中英翻譯網站。簡繁與編碼處理全程在瀏覽器內完成，不限次數。

正式網站：<https://hanzi-translate.mulinbro35964.chatgpt.site>

原始碼：<https://github.com/stevenke1981/hanzi-translate>

## 主要功能

- 簡體、台灣繁體、台灣詞彙與香港繁體互換
- Base64、URL、HTML Entities、Unicode Escape、UTF-8 Hex 編解碼
- 中文與英文互譯
- 免費翻譯額度與自備 API Key
- OpenAI、OpenRouter、Gemini、xAI
- 可從介面清除儲存在裝置上的 API 設定
- SEO metadata、JSON-LD、FAQ、sitemap、robots.txt
- 專屬 Open Graph 社群分享圖
- Google AdSense 版位與隱私同意
- 響應式版面、隱私政策與服務條款

## 快速開始

- Node.js 22.13 或更新版本
- npm
- Windows、macOS 或 Linux

```bash
npm ci
npm run dev
```

本機開發網址依終端顯示為準。

## 品質檢查

```bash
npm run lint
npm run build
npm test
```

`npm run build` 會同時驗證 Cloudflare Worker 入口與 Sites hosting manifest。測試涵蓋正式 metadata、法律與 SEO 路由、翻譯 API、台灣詞彙轉換及編碼往返。

## 環境變數

複製 `.env.example` 為 `.env.local`，再填入需要的值。不要把 API Key
提交到 Git。

自備翻譯 API Key 只會儲存在使用者目前的瀏覽器裝置，送出翻譯時才透過本站端點轉送，不會寫入伺服器資料庫。正式環境金鑰請透過 Sites 管理，不要寫入原始碼。

## 專案結構

- `app/`：網站頁面、SEO／法律路由與翻譯 API
- `lib/text-tools.ts`：本機簡繁與編碼核心
- `tests/`：產物、路由、API 與文字工具回歸
- `scripts/`：跨平台建置與 Sites 產物驗證
- `.agent/`：意圖、變更、驗收與 Baseline 紀錄

## 部署

本專案使用 Vinext、Vite、Cloudflare plugin 與 Sites，並沿用 `.openai/hosting.json` 內的既有專案識別。發布前必須完成全部品質檢查；請勿建立第二個 Sites 專案或提交雲端憑證。

## Codex Desktop

請先閱讀 [CODEX_DESKTOP.md](CODEX_DESKTOP.md) 與 [AGENTS.md](AGENTS.md)。
