"use client";

import OpenCC from "opencc-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Mode = "script" | "encoding" | "translate";
type ScriptLocale = "tw" | "twp" | "cn" | "hk";
type Language = "zh-TW" | "zh-CN" | "en";
type Encoding = "base64" | "url" | "html" | "unicode" | "hex";
type Provider = "builtin" | "openai" | "openrouter" | "gemini" | "xai";
type Consent = "accepted" | "rejected" | null;

type ApiSettings = {
  provider: Provider;
  apiKey: string;
  model: string;
};

const SCRIPT_LABELS: Record<ScriptLocale, string> = {
  tw: "繁體中文（台灣）",
  twp: "繁體中文（台灣詞彙）",
  cn: "簡體中文",
  hk: "繁體中文（香港）",
};

const LANGUAGE_LABELS: Record<Language, string> = {
  "zh-TW": "繁體中文",
  "zh-CN": "簡體中文",
  en: "English",
};

const ENCODING_LABELS: Record<Encoding, string> = {
  base64: "Base64",
  url: "URL Encode",
  html: "HTML Entities",
  unicode: "Unicode Escape",
  hex: "UTF-8 Hex",
};

const MODEL_DEFAULTS: Record<Exclude<Provider, "builtin">, string> = {
  openai: "gpt-4.1-mini",
  openrouter: "openai/gpt-4.1-mini",
  gemini: "gemini-2.5-flash",
  xai: "grok-3-mini",
};

const SAMPLES: Record<Mode, string> = {
  script: "軟體讓資訊傳遞更有效率，也讓世界彼此靠近。",
  encoding: "譯匠：讓文字跨越語言與編碼的距離。",
  translate: "讓文字跨越語言的距離。",
};

function ArrowIcon({ direction = "right" }: { direction?: "right" | "swap" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {direction === "swap" ? (
        <>
          <path d="M7 7h11m0 0-3-3m3 3-3 3M17 17H6m0 0 3 3m-3-3 3-3" />
        </>
      ) : (
        <path d="M5 12h14m0 0-5-5m5 5-5 5" />
      )}
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="9" width="10" height="11" rx="2" />
      <path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <i />
      <i />
    </span>
  );
}

function utf8ToBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 8192) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 8192));
  }
  return btoa(binary);
}

function base64ToUtf8(value: string) {
  const normalized = value.replace(/\s/g, "");
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function encodeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function decodeHtml(value: string) {
  const parser = new DOMParser();
  return parser.parseFromString(`<!doctype html><body>${value}`, "text/html")
    .body.textContent ?? "";
}

function encodeUnicode(value: string) {
  return Array.from(value)
    .map((character) => {
      const code = character.codePointAt(0) ?? 0;
      return code <= 0xffff
        ? `\\u${code.toString(16).padStart(4, "0")}`
        : `\\u{${code.toString(16)}}`;
    })
    .join("");
}

function decodeUnicode(value: string) {
  return value
    .replace(/\\u\{([0-9a-fA-F]{1,6})\}/g, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    );
}

function encodeHex(value: string) {
  return Array.from(new TextEncoder().encode(value))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join(" ");
}

function decodeHex(value: string) {
  const normalized = value.replace(/0x/gi, "").replace(/[^0-9a-fA-F]/g, "");
  if (normalized.length % 2 !== 0) throw new Error("十六進位內容長度不正確");
  const bytes = new Uint8Array(
    normalized.match(/.{2}/g)?.map((hex) => Number.parseInt(hex, 16)) ?? [],
  );
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function AdSlot({ slot, label }: { slot?: string; label: string }) {
  const initialized = useRef(false);
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const [consent, setConsent] = useState<Consent>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setConsent(
        (localStorage.getItem("yijiang-ad-consent") as Consent) || null,
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!client || !slot || consent !== "accepted" || initialized.current) return;
    const scriptId = "google-adsense-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      document.head.appendChild(script);
    }
    const timer = window.setTimeout(() => {
      try {
        const adsWindow = window as typeof window & {
          adsbygoogle?: Record<string, never>[];
        };
        (adsWindow.adsbygoogle ||= []).push({});
        initialized.current = true;
      } catch {
        // Ad blockers and unfilled inventory should not affect the tool.
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [client, slot, consent]);

  useEffect(() => {
    const listener = () =>
      setConsent(
        (localStorage.getItem("yijiang-ad-consent") as Consent) || null,
      );
    window.addEventListener("yijiang-consent", listener);
    return () => window.removeEventListener("yijiang-consent", listener);
  }, []);

  if (!client || !slot || consent !== "accepted") {
    return (
      <aside className="ad-placeholder" aria-label={`${label}廣告位置`}>
        <span>AD</span>
        <p>{label}廣告版位</p>
      </aside>
    );
  }

  return (
    <aside className="ad-live" aria-label={`${label}廣告`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("script");
  const [input, setInput] = useState(SAMPLES.script);
  const [output, setOutput] = useState("");
  const [scriptFrom, setScriptFrom] = useState<ScriptLocale>("tw");
  const [scriptTo, setScriptTo] = useState<ScriptLocale>("cn");
  const [encoding, setEncoding] = useState<Encoding>("base64");
  const [decode, setDecode] = useState(false);
  const [languageFrom, setLanguageFrom] = useState<Language>("zh-TW");
  const [languageTo, setLanguageTo] = useState<Language>("en");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("準備就緒");
  const [copied, setCopied] = useState(false);
  const [remaining, setRemaining] = useState(20);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [consent, setConsent] = useState<Consent>(null);
  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    provider: "builtin",
    apiKey: "",
    model: "",
  });

  const sourceLabel = useMemo(() => {
    if (mode === "script") return SCRIPT_LABELS[scriptFrom];
    if (mode === "encoding") return decode ? ENCODING_LABELS[encoding] : "純文字";
    return LANGUAGE_LABELS[languageFrom];
  }, [decode, encoding, languageFrom, mode, scriptFrom]);

  const targetLabel = useMemo(() => {
    if (mode === "script") return SCRIPT_LABELS[scriptTo];
    if (mode === "encoding") return decode ? "純文字" : ENCODING_LABELS[encoding];
    return LANGUAGE_LABELS[languageTo];
  }, [decode, encoding, languageTo, mode, scriptTo]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setConsent(
        (localStorage.getItem("yijiang-ad-consent") as Consent) || null,
      );
      const stored = localStorage.getItem("yijiang-api-settings");
      if (stored) {
        try {
          setApiSettings(JSON.parse(stored) as ApiSettings);
        } catch {
          localStorage.removeItem("yijiang-api-settings");
        }
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const refreshQuota = useCallback(async () => {
    try {
      const response = await fetch("/api/translate", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { remaining?: number };
      if (typeof data.remaining === "number") setRemaining(data.remaining);
    } catch {
      // Quota display gracefully keeps the default during offline use.
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshQuota(), 0);
    return () => window.clearTimeout(timer);
  }, [refreshQuota]);

  function chooseMode(nextMode: Mode) {
    setMode(nextMode);
    setInput(SAMPLES[nextMode]);
    setOutput("");
    setNotice("準備就緒");
  }

  function swap() {
    if (mode === "script") {
      setScriptFrom(scriptTo);
      setScriptTo(scriptFrom);
    } else if (mode === "encoding") {
      setDecode((current) => !current);
    } else {
      setLanguageFrom(languageTo);
      setLanguageTo(languageFrom);
    }
    setInput(output || input);
    setOutput(input);
  }

  async function runConversion() {
    if (!input.trim()) {
      setNotice("請先輸入要處理的文字");
      return;
    }

    setBusy(true);
    setNotice("處理中…");
    setCopied(false);

    try {
      if (mode === "script") {
        const from = scriptFrom === "twp" ? "tw" : scriptFrom;
        const converter = OpenCC.Converter({ from, to: scriptTo });
        setOutput(converter(input));
      } else if (mode === "encoding") {
        const result = decode
          ? {
              base64: base64ToUtf8,
              url: decodeURIComponent,
              html: decodeHtml,
              unicode: decodeUnicode,
              hex: decodeHex,
            }[encoding](input)
          : {
              base64: utf8ToBase64,
              url: encodeURIComponent,
              html: encodeHtml,
              unicode: encodeUnicode,
              hex: encodeHex,
            }[encoding](input);
        setOutput(result);
      } else {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            text: input,
            source: languageFrom,
            target: languageTo,
            provider: apiSettings.provider,
            apiKey: apiSettings.apiKey,
            model: apiSettings.model,
          }),
        });
        const responseText = await response.text();
        if (!responseText) {
          throw new Error("翻譯服務沒有回應，請稍後再試");
        }
        const data = JSON.parse(responseText) as {
          translation?: string;
          error?: string;
          remaining?: number;
        };
        if (!response.ok || !data.translation) {
          throw new Error(data.error || "翻譯服務暫時無法使用");
        }
        setOutput(data.translation);
        if (typeof data.remaining === "number") setRemaining(data.remaining);
      }
      setNotice("已完成");
    } catch (error) {
      setOutput("");
      setNotice(error instanceof Error ? error.message : "轉換失敗，請再試一次");
    } finally {
      setBusy(false);
    }
  }

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setNotice("已複製到剪貼簿");
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function pasteInput() {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      setNotice("已貼上");
    } catch {
      setNotice("請允許瀏覽器讀取剪貼簿");
    }
  }

  function saveSettings() {
    localStorage.setItem("yijiang-api-settings", JSON.stringify(apiSettings));
    setSettingsOpen(false);
    setNotice(
      apiSettings.provider === "builtin"
        ? "已使用免費翻譯額度"
        : "API 設定已儲存在這台裝置",
    );
  }

  function updateConsent(value: Exclude<Consent, null>) {
    localStorage.setItem("yijiang-ad-consent", value);
    setConsent(value);
    window.dispatchEvent(new Event("yijiang-consent"));
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "譯匠",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        inLanguage: "zh-Hant",
        description:
          "免費簡繁體轉換、文字編碼解碼與中文英文翻譯工具。",
        offers: { "@type": "Offer", price: "0", priceCurrency: "TWD" },
        featureList: [
          "繁體中文與簡體中文互換",
          "Base64、URL、HTML、Unicode 與 UTF-8 Hex 編碼解碼",
          "中文與英文互譯",
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "簡繁轉換會消耗免費額度嗎？",
            acceptedAnswer: {
              "@type": "Answer",
              text: "不會。簡繁轉換與文字編碼都在瀏覽器內完成，不消耗中英翻譯額度。",
            },
          },
          {
            "@type": "Question",
            name: "API Key 會被保存嗎？",
            acceptedAnswer: {
              "@type": "Answer",
              text: "自備的 API Key 只儲存在目前裝置的瀏覽器，不會寫入本站資料庫。",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <a className="skip-link" href="#translator">
        跳至轉換工具
      </a>
      <header className="site-header">
        <a className="brand" href="#" aria-label="譯匠首頁">
          <BrandMark />
          <strong>譯匠</strong>
        </a>
        <nav aria-label="主要導覽">
          <a href="#features">功能</a>
          <a href="#guide">使用說明</a>
          <a href="/privacy">隱私</a>
          <button type="button" onClick={() => setSettingsOpen(true)}>
            API 設定
          </button>
        </nav>
        <a className="header-cta" href="#translator">
          立即使用
        </a>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-orb hero-orb-left" />
          <div className="hero-orb hero-orb-right" />
          <p className="eyebrow">
            <span />
            免費、快速、免安裝
          </p>
          <h1 id="hero-title">文字，換一種方式抵達</h1>
          <p>簡繁、編碼與中英翻譯，一個工作區快速完成。</p>
        </section>

        <section className="translator-wrap" id="translator" aria-label="文字轉換工具">
          <div className="mode-tabs" role="tablist" aria-label="選擇轉換功能">
            {(
              [
                ["script", "簡繁轉換"],
                ["encoding", "文字編碼"],
                ["translate", "中英翻譯"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                onClick={() => chooseMode(value)}
              >
                {label}
                {value !== "translate" && <small>不限次數</small>}
              </button>
            ))}
          </div>

          <div className="workspace">
            <div className="pane">
              <div className="pane-head">
                {mode === "script" ? (
                  <select
                    aria-label="來源文字"
                    value={scriptFrom}
                    onChange={(event) =>
                      setScriptFrom(event.target.value as ScriptLocale)
                    }
                  >
                    {Object.entries(SCRIPT_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                ) : mode === "encoding" ? (
                  <span className="static-select">{sourceLabel}</span>
                ) : (
                  <select
                    aria-label="來源語言"
                    value={languageFrom}
                    onChange={(event) =>
                      setLanguageFrom(event.target.value as Language)
                    }
                  >
                    {Object.entries(LANGUAGE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                )}
                <button className="text-action" type="button" onClick={pasteInput}>
                  貼上
                </button>
              </div>
              <textarea
                aria-label={`${sourceLabel}輸入文字`}
                value={input}
                maxLength={10000}
                onChange={(event) => setInput(event.target.value)}
                placeholder="在這裡輸入或貼上文字…"
              />
              <div className="pane-foot">
                <button
                  type="button"
                  className="text-action"
                  onClick={() => setInput("")}
                >
                  清除
                </button>
                <span>{input.length.toLocaleString()} / 10,000</span>
              </div>
            </div>

            <button
              className="swap-button"
              type="button"
              onClick={swap}
              aria-label={`交換${sourceLabel}與${targetLabel}`}
            >
              <ArrowIcon direction="swap" />
            </button>

            <div className="pane result-pane">
              <div className="pane-head">
                {mode === "script" ? (
                  <select
                    aria-label="目標文字"
                    value={scriptTo}
                    onChange={(event) =>
                      setScriptTo(event.target.value as ScriptLocale)
                    }
                  >
                    {Object.entries(SCRIPT_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                ) : mode === "encoding" ? (
                  <select
                    aria-label="編碼格式"
                    value={encoding}
                    onChange={(event) =>
                      setEncoding(event.target.value as Encoding)
                    }
                  >
                    {Object.entries(ENCODING_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    aria-label="目標語言"
                    value={languageTo}
                    onChange={(event) =>
                      setLanguageTo(event.target.value as Language)
                    }
                  >
                    {Object.entries(LANGUAGE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                )}
                <span className={`status ${notice === "已完成" ? "success" : ""}`}>
                  <i />
                  {notice}
                </span>
              </div>
              <textarea
                aria-label={`${targetLabel}轉換結果`}
                value={output}
                readOnly
                placeholder="轉換結果會顯示在這裡"
              />
              <div className="pane-foot">
                <span>{output.length.toLocaleString()} 個字元</span>
                <button
                  className="copy-button"
                  type="button"
                  onClick={copyOutput}
                  disabled={!output}
                  aria-label="複製轉換結果"
                >
                  <CopyIcon />
                  {copied ? "已複製" : "複製"}
                </button>
              </div>
            </div>
          </div>

          <div className="action-bar">
            <button
              className="primary-button"
              type="button"
              disabled={busy}
              onClick={runConversion}
            >
              {busy ? "正在處理…" : "開始轉換"}
              <ArrowIcon />
            </button>

            {mode === "encoding" ? (
              <label className="direction-toggle">
                <input
                  type="checkbox"
                  checked={decode}
                  onChange={(event) => setDecode(event.target.checked)}
                />
                <span />
                {decode ? "解碼模式" : "編碼模式"}
              </label>
            ) : mode === "translate" ? (
              <div className="quota">
                <div>
                  <strong>
                    {apiSettings.provider === "builtin"
                      ? `今日免費額度 ${20 - remaining}/20`
                      : "自備金鑰不計免費額度"}
                  </strong>
                  <button type="button" onClick={() => setSettingsOpen(true)}>
                    {apiSettings.provider === "builtin" ? "設定自己的 API Key" : "管理 API"}
                  </button>
                </div>
                <progress
                  value={apiSettings.provider === "builtin" ? 20 - remaining : 0}
                  max={20}
                  aria-label="今日免費翻譯使用量"
                />
              </div>
            ) : (
              <p className="local-note">
                <span>✓</span> 在瀏覽器內完成，不上傳文字、不限次數
              </p>
            )}
          </div>
        </section>

        <AdSlot
          label="工具下方"
          slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP}
        />

        <section className="content-section" id="features">
          <div className="section-heading">
            <p className="eyebrow">一站完成</p>
            <h2>三種文字工作，一個乾淨介面</h2>
            <p>常用工具不必分散在不同網站，也不必安裝額外程式。</p>
          </div>
          <div className="feature-grid">
            <article>
              <span className="feature-icon">繁</span>
              <h3>準確的簡繁轉換</h3>
              <p>
                使用 OpenCC 詞庫支援簡體、台灣繁體與香港繁體，包含常見地區詞彙轉換。
              </p>
              <a href="#translator" onClick={() => chooseMode("script")}>
                開始轉換 <ArrowIcon />
              </a>
            </article>
            <article>
              <span className="feature-icon">{"</>"}</span>
              <h3>完整的編碼工具</h3>
              <p>
                支援 Base64、URL、HTML Entities、Unicode Escape 與 UTF-8 Hex
                雙向轉換。
              </p>
              <a href="#translator" onClick={() => chooseMode("encoding")}>
                開始編碼 <ArrowIcon />
              </a>
            </article>
            <article>
              <span className="feature-icon">EN</span>
              <h3>自然的中英互翻</h3>
              <p>
                提供每日免費額度，也能使用 OpenAI、OpenRouter、Gemini 或 xAI
                的自有金鑰。
              </p>
              <a href="#translator" onClick={() => chooseMode("translate")}>
                開始翻譯 <ArrowIcon />
              </a>
            </article>
          </div>
        </section>

        <section className="steps-section" id="guide">
          <div className="section-heading">
            <p className="eyebrow">使用說明</p>
            <h2>三步完成文字轉換</h2>
          </div>
          <ol className="steps">
            <li>
              <span>01</span>
              <div>
                <h3>選擇功能</h3>
                <p>切換簡繁、編碼或中英翻譯。</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>貼上文字</h3>
                <p>每次最多可處理 10,000 個字元。</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>轉換並複製</h3>
                <p>取得結果後一鍵複製，立即使用。</p>
              </div>
            </li>
          </ol>
        </section>

        <AdSlot
          label="內容中段"
          slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CONTENT}
        />

        <section className="faq-section" id="faq">
          <div className="section-heading">
            <p className="eyebrow">常見問題</p>
            <h2>關於額度、隱私與 API</h2>
          </div>
          <div className="faq-list">
            <details>
              <summary>簡繁與編碼轉換會消耗額度嗎？</summary>
              <p>
                不會。這兩項功能完全在瀏覽器中執行，不會呼叫翻譯 API，也沒有每日次數限制。
              </p>
            </details>
            <details>
              <summary>免費中英翻譯有什麼限制？</summary>
              <p>
                每位訪客每天最多使用 20 次、每分鐘最多 5
                次。限制能保護免費金鑰，讓更多人都能使用服務。
              </p>
            </details>
            <details>
              <summary>我的 API Key 安全嗎？</summary>
              <p>
                自備金鑰只儲存在目前裝置的瀏覽器，送出翻譯請求時才短暫傳送，不會寫入本站資料庫。共用裝置使用後請清除設定。
              </p>
            </details>
            <details>
              <summary>可以處理哪些中文地區用語？</summary>
              <p>
                支援簡體中文、台灣繁體與香港繁體。選擇「台灣詞彙」時，還會轉換常見地區用語。
              </p>
            </details>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-brand">
          <a className="brand" href="#">
            <BrandMark />
            <strong>譯匠</strong>
          </a>
          <p>讓文字跨越語言與編碼的距離。</p>
        </div>
        <div className="footer-links">
          <a href="#features">功能</a>
          <a href="#guide">使用說明</a>
          <a href="#faq">常見問題</a>
          <a href="/privacy">隱私權政策</a>
          <a href="/terms">服務條款</a>
        </div>
        <p className="copyright">© {new Date().getFullYear()} 譯匠</p>
      </footer>

      {settingsOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSettingsOpen(false);
          }}
        >
          <section
            className="settings-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="api-settings-title"
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setSettingsOpen(false)}
              aria-label="關閉 API 設定"
            >
              ×
            </button>
            <p className="eyebrow">翻譯服務</p>
            <h2 id="api-settings-title">API 設定</h2>
            <p className="modal-copy">
              免費方案每天 20 次；使用自己的金鑰則不計本站額度。設定只儲存在目前瀏覽器。
            </p>

            <label>
              服務供應商
              <select
                value={apiSettings.provider}
                onChange={(event) => {
                  const provider = event.target.value as Provider;
                  setApiSettings({
                    provider,
                    apiKey: provider === "builtin" ? "" : apiSettings.apiKey,
                    model:
                      provider === "builtin"
                        ? ""
                        : MODEL_DEFAULTS[provider],
                  });
                }}
              >
                <option value="builtin">譯匠免費額度（每日 20 次）</option>
                <option value="openai">OpenAI</option>
                <option value="openrouter">OpenRouter</option>
                <option value="gemini">Google Gemini</option>
                <option value="xai">xAI</option>
              </select>
            </label>

            {apiSettings.provider !== "builtin" && (
              <>
                <label>
                  API Key
                  <input
                    type="password"
                    autoComplete="off"
                    value={apiSettings.apiKey}
                    onChange={(event) =>
                      setApiSettings({
                        ...apiSettings,
                        apiKey: event.target.value.trim(),
                      })
                    }
                    placeholder="貼上 API Key"
                  />
                </label>
                <label>
                  模型
                  <input
                    type="text"
                    value={apiSettings.model}
                    onChange={(event) =>
                      setApiSettings({
                        ...apiSettings,
                        model: event.target.value,
                      })
                    }
                  />
                </label>
              </>
            )}

            <div className="privacy-chip">
              <span>✓</span>
              不會將 API Key 寫入伺服器資料庫
            </div>
            <button className="primary-button modal-save" type="button" onClick={saveSettings}>
              儲存設定
            </button>
          </section>
        </div>
      )}

      {consent === null && (
        <aside className="consent-banner" aria-label="廣告與隱私設定">
          <div>
            <strong>廣告與隱私</strong>
            <p>
              我們使用廣告維持免費服務。接受後 Google
              可能使用 Cookie 顯示與衡量廣告；拒絕不影響轉換功能。
            </p>
          </div>
          <a href="/privacy">瞭解更多</a>
          <button type="button" className="secondary-button" onClick={() => updateConsent("rejected")}>
            拒絕
          </button>
          <button type="button" className="primary-button" onClick={() => updateConsent("accepted")}>
            接受
          </button>
        </aside>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
