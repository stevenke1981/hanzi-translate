"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  convertEncoding,
  convertScript,
  detectTextKind,
  type DetectedTextKind,
  type Encoding,
  type ScriptLocale,
} from "../lib/text-tools";
import {
  APP_COPY,
  isUiLocale,
  type AppCopy,
  type TranslationLanguage,
  type UiLocale,
} from "../lib/i18n";

type Mode = "auto" | "script" | "encoding" | "translate";
type Provider = "builtin" | "openai" | "openrouter" | "gemini" | "xai";
type Consent = "accepted" | "rejected" | null;

type ApiSettings = {
  provider: Provider;
  apiKey: string;
  model: string;
};

const MODEL_DEFAULTS: Record<Exclude<Provider, "builtin">, string> = {
  openai: "gpt-4.1-mini",
  openrouter: "openai/gpt-4.1-mini",
  gemini: "gemini-2.5-flash",
  xai: "grok-3-mini",
};

const MODE_ORDER: Mode[] = ["auto", "script", "encoding", "translate"];
const INITIAL_SAMPLE = "软件让信息传递更有效率，也让世界彼此靠近。";
const DEFAULT_API_SETTINGS: ApiSettings = {
  provider: "builtin",
  apiKey: "",
  model: "",
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

function AdSlot({
  slot,
  label,
  copy,
}: {
  slot?: string;
  label: string;
  copy: AppCopy;
}) {
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
      <aside
        className="ad-placeholder"
        aria-label={copy.ad.placeholderAria(label)}
      >
        <span>AD</span>
        <p>{copy.ad.placeholderText(label)}</p>
      </aside>
    );
  }

  return (
    <aside className="ad-live" aria-label={copy.ad.liveAria(label)}>
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
  const [uiLanguage, setUiLanguage] = useState<UiLocale>("zh-Hant");
  const [languageReady, setLanguageReady] = useState(false);
  const [mode, setMode] = useState<Mode>("auto");
  const [input, setInput] = useState(INITIAL_SAMPLE);
  const [output, setOutput] = useState("");
  const [autoTarget, setAutoTarget] = useState<"zh-TW" | "en">("zh-TW");
  const [detectedSource, setDetectedSource] =
    useState<DetectedTextKind | null>(null);
  const [scriptFrom, setScriptFrom] = useState<ScriptLocale>("tw");
  const [scriptTo, setScriptTo] = useState<ScriptLocale>("cn");
  const [encoding, setEncoding] = useState<Encoding>("base64");
  const [decode, setDecode] = useState(false);
  const [languageFrom, setLanguageFrom] =
    useState<TranslationLanguage>("zh-TW");
  const [languageTo, setLanguageTo] = useState<TranslationLanguage>("en");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(APP_COPY["zh-Hant"].notices.ready);
  const [copied, setCopied] = useState(false);
  const [remaining, setRemaining] = useState(20);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [consent, setConsent] = useState<Consent>(null);
  const [apiSettings, setApiSettings] =
    useState<ApiSettings>(DEFAULT_API_SETTINGS);
  const settingsProviderRef = useRef<HTMLSelectElement>(null);
  const copy = APP_COPY[uiLanguage];

  const sourceLabel = useMemo(() => {
    if (mode === "auto") {
      return detectedSource
        ? copy.detectedLabels[detectedSource]
        : copy.translator.autoDetect;
    }
    if (mode === "script") return copy.scriptLabels[scriptFrom];
    if (mode === "encoding") {
      return decode ? copy.encodingLabels[encoding] : copy.translator.plainText;
    }
    return copy.languageLabels[languageFrom];
  }, [copy, decode, detectedSource, encoding, languageFrom, mode, scriptFrom]);

  const targetLabel = useMemo(() => {
    if (mode === "auto") return copy.languageLabels[autoTarget];
    if (mode === "script") return copy.scriptLabels[scriptTo];
    if (mode === "encoding") {
      return decode ? copy.translator.plainText : copy.encodingLabels[encoding];
    }
    return copy.languageLabels[languageTo];
  }, [autoTarget, copy, decode, encoding, languageTo, mode, scriptTo]);

  const usesTranslationQuota =
    mode === "translate" || (mode === "auto" && autoTarget === "en");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const queryLanguage = new URLSearchParams(window.location.search).get(
        "lang",
      );
      const storedLanguage = localStorage.getItem("yijiang-ui-language");
      const nextLanguage = isUiLocale(queryLanguage)
        ? queryLanguage
        : isUiLocale(storedLanguage)
          ? storedLanguage
          : "zh-Hant";
      setUiLanguage(nextLanguage);
      setLanguageReady(true);
      document.documentElement.lang = nextLanguage;
      document.title =
        nextLanguage === "en"
          ? "Yijiang | Free script conversion, encoding, and translation tools"
          : "譯匠｜免費簡繁轉換、文字編碼與中英翻譯工具";
      setNotice(APP_COPY[nextLanguage].notices.ready);
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

  useEffect(() => {
    if (!languageReady) return;
    localStorage.setItem("yijiang-ui-language", uiLanguage);
    document.documentElement.lang = uiLanguage;
    document.title =
      uiLanguage === "en"
        ? "Yijiang | Free script conversion, encoding, and translation tools"
        : "譯匠｜免費簡繁轉換、文字編碼與中英翻譯工具";
  }, [languageReady, uiLanguage]);

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

  useEffect(() => {
    if (!settingsOpen) return;

    const previouslyFocused = document.activeElement;
    const focusTimer = window.setTimeout(
      () => settingsProviderRef.current?.focus(),
      0,
    );
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSettingsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", closeOnEscape);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [settingsOpen]);

  function chooseMode(nextMode: Mode) {
    setMode(nextMode);
    setOutput("");
    setDetectedSource(null);
    setNotice(copy.notices.ready);
  }

  function changeUiLanguage(nextLanguage: UiLocale) {
    setUiLanguage(nextLanguage);
    setLanguageReady(true);
    document.documentElement.lang = nextLanguage;
    document.title =
      nextLanguage === "en"
        ? "Yijiang | Free script conversion, encoding, and translation tools"
        : "譯匠｜免費簡繁轉換、文字編碼與中英翻譯工具";
    const url = new URL(window.location.href);
    if (nextLanguage === "en") {
      url.searchParams.set("lang", "en");
    } else {
      url.searchParams.delete("lang");
    }
    window.history.replaceState({}, "", url);
  }

  function selectAdjacentMode(
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentMode: Mode,
  ) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }
    event.preventDefault();
    const currentIndex = MODE_ORDER.indexOf(currentMode);
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? MODE_ORDER.length - 1
          : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + MODE_ORDER.length) %
            MODE_ORDER.length;
    chooseMode(MODE_ORDER[nextIndex]);
    const tabs = event.currentTarget.parentElement?.querySelectorAll("button");
    (tabs?.[nextIndex] as HTMLButtonElement | undefined)?.focus();
  }

  function swap() {
    if (mode === "auto") {
      setAutoTarget((current) => (current === "en" ? "zh-TW" : "en"));
    } else if (mode === "script") {
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
    setDetectedSource(null);
  }

  async function requestTranslation(
    source: TranslationLanguage,
    target: TranslationLanguage,
  ) {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        text: input,
        source,
        target,
        provider: apiSettings.provider,
        apiKey: apiSettings.apiKey,
        model: apiSettings.model,
      }),
    });
    const responseText = await response.text();
    if (!responseText) {
      throw new Error(copy.notices.emptyResponse);
    }
    const data = JSON.parse(responseText) as {
      translation?: string;
      error?: string;
      remaining?: number;
    };
    if (!response.ok || !data.translation) {
      throw new Error(data.error || copy.notices.serviceUnavailable);
    }
    if (typeof data.remaining === "number") setRemaining(data.remaining);
    return data.translation;
  }

  async function runConversion() {
    if (!input.trim()) {
      setNotice(copy.notices.inputRequired);
      return;
    }

    setBusy(true);
    setNotice(copy.notices.processing);
    setCopied(false);

    try {
      if (mode === "auto") {
        const detected = await detectTextKind(input);
        setDetectedSource(detected);
        if (autoTarget === "zh-TW") {
          if (detected === "simplified" || detected === "mixed") {
            setOutput(await convertScript(input, "cn", "tw"));
          } else if (detected === "traditional") {
            setOutput(input);
          } else if (detected === "english") {
            setOutput(await requestTranslation("en", "zh-TW"));
          } else {
            throw new Error(copy.notices.autoUnsupported);
          }
        } else if (detected === "english") {
          setOutput(input);
        } else if (
          detected === "simplified" ||
          detected === "traditional" ||
          detected === "mixed"
        ) {
          setOutput(
            await requestTranslation(
              detected === "traditional" ? "zh-TW" : "zh-CN",
              "en",
            ),
          );
        } else {
          throw new Error(copy.notices.autoUnsupported);
        }
      } else if (mode === "script") {
        setOutput(await convertScript(input, scriptFrom, scriptTo));
      } else if (mode === "encoding") {
        setOutput(convertEncoding(input, encoding, decode));
      } else {
        setOutput(await requestTranslation(languageFrom, languageTo));
      }
      setNotice(copy.notices.done);
    } catch (error) {
      setOutput("");
      setNotice(
        error instanceof Error ? error.message : copy.notices.conversionFailed,
      );
    } finally {
      setBusy(false);
    }
  }

  async function copyOutput() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setNotice(copy.notices.copied);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setNotice(copy.notices.clipboardWriteFailed);
    }
  }

  async function pasteInput() {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      setDetectedSource(null);
      setNotice(copy.notices.pasted);
    } catch {
      setNotice(copy.notices.clipboardReadFailed);
    }
  }

  function saveSettings() {
    localStorage.setItem("yijiang-api-settings", JSON.stringify(apiSettings));
    setSettingsOpen(false);
    setNotice(
      apiSettings.provider === "builtin"
        ? copy.notices.freeQuotaSaved
        : copy.notices.apiSettingsSaved,
    );
  }

  function clearSettings() {
    localStorage.removeItem("yijiang-api-settings");
    setApiSettings(DEFAULT_API_SETTINGS);
    setSettingsOpen(false);
    setNotice(copy.notices.settingsCleared);
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
        inLanguage: uiLanguage,
        description: copy.hero.description,
        offers: { "@type": "Offer", price: "0", priceCurrency: "TWD" },
        featureList: [
          copy.features.scriptTitle,
          copy.features.encodingTitle,
          copy.features.translationTitle,
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: copy.faq.items.slice(0, 2).map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };

  return (
    <>
      <a className="skip-link" href="#translator">
        {uiLanguage === "en" ? "Skip to conversion tool" : "跳至轉換工具"}
      </a>
      <header className="site-header">
        <a className="brand" href="#" aria-label={copy.header.homeAria}>
          <BrandMark />
          <strong>譯匠</strong>
        </a>
        <nav aria-label={copy.header.navAria}>
          <a href="#features">{copy.header.features}</a>
          <a href="#guide">{copy.header.guide}</a>
          <a href={`/privacy${uiLanguage === "en" ? "?lang=en" : ""}`}>
            {copy.header.privacy}
          </a>
          <button type="button" onClick={() => setSettingsOpen(true)}>
            {copy.header.apiSettings}
          </button>
        </nav>
        <button
          className="language-toggle"
          type="button"
          aria-label={copy.header.languageToggleAria}
          aria-pressed={uiLanguage === "en"}
          onClick={() =>
            changeUiLanguage(uiLanguage === "en" ? "zh-Hant" : "en")
          }
        >
          {copy.header.languageToggle}
        </button>
        <a className="header-cta" href="#translator">
          {copy.header.useNow}
        </a>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-orb hero-orb-left" />
          <div className="hero-orb hero-orb-right" />
          <p className="eyebrow">
            <span />
            {copy.hero.eyebrow}
          </p>
          <h1 id="hero-title">{copy.hero.title}</h1>
          <p>{copy.hero.description}</p>
        </section>

        <section
          className="translator-wrap"
          id="translator"
          aria-label={copy.translator.aria}
        >
          <div
            className="mode-tabs"
            role="tablist"
            aria-label={copy.translator.tabsAria}
          >
            {(
              [
                ["auto", copy.translator.auto],
                ["script", copy.translator.script],
                ["encoding", copy.translator.encoding],
                ["translate", copy.translator.translate],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                onClick={() => chooseMode(value)}
                onKeyDown={(event) => selectAdjacentMode(event, value)}
              >
                {label}
                {value === "script" || value === "encoding" ? (
                  <small>{copy.translator.unlimited}</small>
                ) : null}
              </button>
            ))}
          </div>

          <div className="workspace">
            <div className="pane">
              <div className="pane-head">
                {mode === "auto" ? (
                  <span className="static-select">{sourceLabel}</span>
                ) : mode === "script" ? (
                  <select
                    aria-label={copy.translator.sourceText}
                    value={scriptFrom}
                    onChange={(event) =>
                      setScriptFrom(event.target.value as ScriptLocale)
                    }
                  >
                    {Object.entries(copy.scriptLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                ) : mode === "encoding" ? (
                  <span className="static-select">{sourceLabel}</span>
                ) : (
                  <select
                    aria-label={copy.translator.sourceLanguage}
                    value={languageFrom}
                    onChange={(event) =>
                      setLanguageFrom(event.target.value as TranslationLanguage)
                    }
                  >
                    {Object.entries(copy.languageLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                )}
                <button className="text-action" type="button" onClick={pasteInput}>
                  {copy.translator.paste}
                </button>
              </div>
              <textarea
                aria-label={`${sourceLabel} ${copy.translator.sourceText}`}
                value={input}
                maxLength={10000}
                onChange={(event) => {
                  setInput(event.target.value);
                  setDetectedSource(null);
                }}
                placeholder={copy.translator.inputPlaceholder}
              />
              <div className="pane-foot">
                <button
                  type="button"
                  className="text-action"
                  onClick={() => {
                    setInput("");
                    setDetectedSource(null);
                  }}
                >
                  {copy.translator.clear}
                </button>
                <span>
                  {copy.translator.inputCount(input.length.toLocaleString())}
                </span>
              </div>
            </div>

            <button
              className="swap-button"
              type="button"
              onClick={swap}
              aria-label={copy.translator.swap(sourceLabel, targetLabel)}
            >
              <ArrowIcon direction="swap" />
            </button>

            <div className="pane result-pane">
              <div className="pane-head">
                {mode === "auto" ? (
                  <select
                    aria-label={copy.translator.autoTarget}
                    value={autoTarget}
                    onChange={(event) =>
                      setAutoTarget(event.target.value as "zh-TW" | "en")
                    }
                  >
                    <option value="zh-TW">{copy.languageLabels["zh-TW"]}</option>
                    <option value="en">{copy.languageLabels.en}</option>
                  </select>
                ) : mode === "script" ? (
                  <select
                    aria-label={copy.translator.targetText}
                    value={scriptTo}
                    onChange={(event) =>
                      setScriptTo(event.target.value as ScriptLocale)
                    }
                  >
                    {Object.entries(copy.scriptLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                ) : mode === "encoding" ? (
                  <select
                    aria-label={copy.translator.encodingFormat}
                    value={encoding}
                    onChange={(event) =>
                      setEncoding(event.target.value as Encoding)
                    }
                  >
                    {Object.entries(copy.encodingLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    aria-label={copy.translator.targetLanguage}
                    value={languageTo}
                    onChange={(event) =>
                      setLanguageTo(event.target.value as TranslationLanguage)
                    }
                  >
                    {Object.entries(copy.languageLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                )}
                <span
                  className={`status ${notice === copy.notices.done ? "success" : ""}`}
                  role="status"
                  aria-live="polite"
                >
                  <i />
                  {notice}
                </span>
              </div>
              <textarea
                aria-label={`${targetLabel} ${copy.translator.outputPlaceholder}`}
                value={output}
                readOnly
                placeholder={copy.translator.outputPlaceholder}
              />
              <div className="pane-foot">
                <span>
                  {copy.translator.outputCount(output.length.toLocaleString())}
                </span>
                <button
                  className="copy-button"
                  type="button"
                  onClick={copyOutput}
                  disabled={!output}
                  aria-label={copy.translator.copyResult}
                >
                  <CopyIcon />
                  {copied ? copy.translator.copied : copy.translator.copy}
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
              {busy ? copy.translator.processing : copy.translator.start}
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
                {decode ? copy.translator.decodeMode : copy.translator.encodeMode}
              </label>
            ) : usesTranslationQuota ? (
              <div className="quota">
                <div>
                  <strong>
                    {apiSettings.provider === "builtin"
                      ? copy.translator.dailyQuota(20 - remaining)
                      : copy.translator.ownKeyQuota}
                  </strong>
                  <button type="button" onClick={() => setSettingsOpen(true)}>
                    {apiSettings.provider === "builtin"
                      ? copy.translator.setOwnKey
                      : copy.translator.manageApi}
                  </button>
                </div>
                <progress
                  value={apiSettings.provider === "builtin" ? 20 - remaining : 0}
                  max={20}
                  aria-label={copy.translator.quotaAria}
                />
              </div>
            ) : (
              <p className="local-note">
                <span>✓</span> {copy.translator.localNote}
              </p>
            )}
          </div>
        </section>

        <AdSlot
          label={copy.ad.top}
          copy={copy}
          slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP}
        />

        <section className="content-section" id="features">
          <div className="section-heading">
            <p className="eyebrow">{copy.features.eyebrow}</p>
            <h2>{copy.features.title}</h2>
            <p>{copy.features.description}</p>
          </div>
          <div className="feature-grid">
            <article>
              <span className="feature-icon">繁</span>
              <h3>{copy.features.scriptTitle}</h3>
              <p>{copy.features.scriptDescription}</p>
              <a href="#translator" onClick={() => chooseMode("script")}>
                {copy.features.scriptAction} <ArrowIcon />
              </a>
            </article>
            <article>
              <span className="feature-icon">{"</>"}</span>
              <h3>{copy.features.encodingTitle}</h3>
              <p>{copy.features.encodingDescription}</p>
              <a href="#translator" onClick={() => chooseMode("encoding")}>
                {copy.features.encodingAction} <ArrowIcon />
              </a>
            </article>
            <article>
              <span className="feature-icon">EN</span>
              <h3>{copy.features.translationTitle}</h3>
              <p>{copy.features.translationDescription}</p>
              <a href="#translator" onClick={() => chooseMode("translate")}>
                {copy.features.translationAction} <ArrowIcon />
              </a>
            </article>
          </div>
        </section>

        <section className="steps-section" id="guide">
          <div className="section-heading">
            <p className="eyebrow">{copy.guide.eyebrow}</p>
            <h2>{copy.guide.title}</h2>
          </div>
          <ol className="steps">
            {copy.guide.steps.map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <AdSlot
          label={copy.ad.content}
          copy={copy}
          slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CONTENT}
        />

        <section className="faq-section" id="faq">
          <div className="section-heading">
            <p className="eyebrow">{copy.faq.eyebrow}</p>
            <h2>{copy.faq.title}</h2>
          </div>
          <div className="faq-list">
            {copy.faq.items.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-brand">
          <a className="brand" href="#">
            <BrandMark />
            <strong>譯匠</strong>
          </a>
          <p>{copy.footer.tagline}</p>
        </div>
        <div className="footer-links">
          <a href="#features">{copy.footer.features}</a>
          <a href="#guide">{copy.footer.guide}</a>
          <a href="#faq">{copy.footer.faq}</a>
          <a href={`/privacy${uiLanguage === "en" ? "?lang=en" : ""}`}>
            {copy.footer.privacy}
          </a>
          <a href={`/terms${uiLanguage === "en" ? "?lang=en" : ""}`}>
            {copy.footer.terms}
          </a>
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
              aria-label={copy.settings.close}
            >
              ×
            </button>
            <p className="eyebrow">{copy.settings.eyebrow}</p>
            <h2 id="api-settings-title">{copy.settings.title}</h2>
            <p className="modal-copy">{copy.settings.description}</p>

            <label>
              {copy.settings.provider}
              <select
                ref={settingsProviderRef}
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
                <option value="builtin">{copy.settings.builtin}</option>
                <option value="openai">OpenAI</option>
                <option value="openrouter">OpenRouter</option>
                <option value="gemini">Google Gemini</option>
                <option value="xai">xAI</option>
              </select>
            </label>

            {apiSettings.provider !== "builtin" && (
              <>
                <label>
                  {copy.settings.apiKey}
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
                    placeholder={copy.settings.apiKeyPlaceholder}
                  />
                </label>
                <label>
                  {copy.settings.model}
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
              {copy.settings.privacy}
            </div>
            <div className="modal-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={clearSettings}
              >
                {copy.settings.clear}
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={saveSettings}
              >
                {copy.settings.save}
              </button>
            </div>
          </section>
        </div>
      )}

      {consent === null && (
        <aside className="consent-banner" aria-label={copy.consent.aria}>
          <div>
            <strong>{copy.consent.title}</strong>
            <p>{copy.consent.description}</p>
          </div>
          <a href={`/privacy${uiLanguage === "en" ? "?lang=en" : ""}`}>
            {copy.consent.learnMore}
          </a>
          <button type="button" className="secondary-button" onClick={() => updateConsent("rejected")}>
            {copy.consent.reject}
          </button>
          <button type="button" className="primary-button" onClick={() => updateConsent("accepted")}>
            {copy.consent.accept}
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
