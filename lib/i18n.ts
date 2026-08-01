import type { Encoding, ScriptLocale } from "./text-tools";

export type UiLocale = "zh-Hant" | "en";
export type TranslationLanguage = "zh-TW" | "zh-CN" | "en";

export type AppCopy = {
  scriptLabels: Record<ScriptLocale, string>;
  languageLabels: Record<TranslationLanguage, string>;
  encodingLabels: Record<Encoding, string>;
  notices: {
    ready: string;
    processing: string;
    done: string;
    inputRequired: string;
    emptyResponse: string;
    serviceUnavailable: string;
    conversionFailed: string;
    copied: string;
    clipboardWriteFailed: string;
    pasted: string;
    clipboardReadFailed: string;
    freeQuotaSaved: string;
    apiSettingsSaved: string;
    settingsCleared: string;
  };
  ad: {
    top: string;
    content: string;
    placeholderAria: (label: string) => string;
    placeholderText: (label: string) => string;
    liveAria: (label: string) => string;
  };
  header: {
    homeAria: string;
    navAria: string;
    features: string;
    guide: string;
    privacy: string;
    apiSettings: string;
    useNow: string;
    languageToggleAria: string;
    languageToggle: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
  };
  translator: {
    aria: string;
    tabsAria: string;
    script: string;
    encoding: string;
    translate: string;
    unlimited: string;
    sourceText: string;
    targetText: string;
    plainText: string;
    sourceLanguage: string;
    targetLanguage: string;
    encodingFormat: string;
    paste: string;
    inputPlaceholder: string;
    clear: string;
    inputCount: (count: string) => string;
    outputCount: (count: string) => string;
    outputPlaceholder: string;
    swap: (source: string, target: string) => string;
    copy: string;
    copied: string;
    copyResult: string;
    start: string;
    processing: string;
    encodeMode: string;
    decodeMode: string;
    dailyQuota: (used: number) => string;
    ownKeyQuota: string;
    setOwnKey: string;
    manageApi: string;
    quotaAria: string;
    localNote: string;
  };
  features: {
    eyebrow: string;
    title: string;
    description: string;
    scriptTitle: string;
    scriptDescription: string;
    scriptAction: string;
    encodingTitle: string;
    encodingDescription: string;
    encodingAction: string;
    translationTitle: string;
    translationDescription: string;
    translationAction: string;
  };
  guide: {
    eyebrow: string;
    title: string;
    steps: Array<{ title: string; description: string }>;
  };
  faq: {
    eyebrow: string;
    title: string;
    items: Array<{ question: string; answer: string }>;
  };
  footer: {
    tagline: string;
    features: string;
    guide: string;
    faq: string;
    privacy: string;
    terms: string;
  };
  settings: {
    eyebrow: string;
    title: string;
    close: string;
    description: string;
    provider: string;
    builtin: string;
    apiKey: string;
    apiKeyPlaceholder: string;
    model: string;
    privacy: string;
    clear: string;
    save: string;
  };
  consent: {
    aria: string;
    title: string;
    description: string;
    learnMore: string;
    reject: string;
    accept: string;
  };
};

const ZH_HANT: AppCopy = {
  scriptLabels: {
    tw: "繁體中文（台灣）",
    twp: "繁體中文（台灣詞彙）",
    cn: "簡體中文",
    hk: "繁體中文（香港）",
  },
  languageLabels: {
    "zh-TW": "繁體中文",
    "zh-CN": "簡體中文",
    en: "English",
  },
  encodingLabels: {
    base64: "Base64",
    url: "URL Encode",
    html: "HTML Entities",
    unicode: "Unicode Escape",
    hex: "UTF-8 Hex",
  },
  notices: {
    ready: "準備就緒",
    processing: "處理中…",
    done: "已完成",
    inputRequired: "請先輸入要處理的文字",
    emptyResponse: "翻譯服務沒有回應，請稍後再試",
    serviceUnavailable: "翻譯服務暫時無法使用",
    conversionFailed: "轉換失敗，請再試一次",
    copied: "已複製到剪貼簿",
    clipboardWriteFailed: "無法寫入剪貼簿，請手動選取結果",
    pasted: "已貼上",
    clipboardReadFailed: "請允許瀏覽器讀取剪貼簿",
    freeQuotaSaved: "已使用免費翻譯額度",
    apiSettingsSaved: "API 設定已儲存在這台裝置",
    settingsCleared: "已清除這台裝置上的 API 設定",
  },
  ad: {
    top: "工具下方",
    content: "內容中段",
    placeholderAria: (label) => `${label}廣告位置`,
    placeholderText: (label) => `${label}廣告版位`,
    liveAria: (label) => `${label}廣告`,
  },
  header: {
    homeAria: "譯匠首頁",
    navAria: "主要導覽",
    features: "功能",
    guide: "使用說明",
    privacy: "隱私",
    apiSettings: "API 設定",
    useNow: "立即使用",
    languageToggleAria: "切換介面語言",
    languageToggle: "English",
  },
  hero: {
    eyebrow: "免費、快速、免安裝",
    title: "文字，換一種方式抵達",
    description: "簡繁、編碼與中英翻譯，一個工作區快速完成。",
  },
  translator: {
    aria: "文字轉換工具",
    tabsAria: "選擇轉換功能",
    script: "簡繁轉換",
    encoding: "文字編碼",
    translate: "中英翻譯",
    unlimited: "不限次數",
    sourceText: "來源文字",
    targetText: "目標文字",
    plainText: "純文字",
    sourceLanguage: "來源語言",
    targetLanguage: "目標語言",
    encodingFormat: "編碼格式",
    paste: "貼上",
    inputPlaceholder: "在這裡輸入或貼上文字…",
    clear: "清除",
    inputCount: (count) => `${count} / 10,000`,
    outputCount: (count) => `${count} 個字元`,
    outputPlaceholder: "轉換結果會顯示在這裡",
    swap: (source, target) => `交換${source}與${target}`,
    copy: "複製",
    copied: "已複製",
    copyResult: "複製轉換結果",
    start: "開始轉換",
    processing: "正在處理…",
    encodeMode: "編碼模式",
    decodeMode: "解碼模式",
    dailyQuota: (used) => `今日免費額度 ${used}/20`,
    ownKeyQuota: "自備金鑰不計免費額度",
    setOwnKey: "設定自己的 API Key",
    manageApi: "管理 API",
    quotaAria: "今日免費翻譯使用量",
    localNote: "在瀏覽器內完成，不上傳文字、不限次數",
  },
  features: {
    eyebrow: "一站完成",
    title: "三種文字工作，一個乾淨介面",
    description: "常用工具不必分散在不同網站，也不必安裝額外程式。",
    scriptTitle: "準確的簡繁轉換",
    scriptDescription:
      "使用 OpenCC 詞庫支援簡體、台灣繁體與香港繁體，包含常見地區詞彙轉換。",
    scriptAction: "開始轉換",
    encodingTitle: "完整的編碼工具",
    encodingDescription:
      "支援 Base64、URL、HTML Entities、Unicode Escape 與 UTF-8 Hex 雙向轉換。",
    encodingAction: "開始編碼",
    translationTitle: "自然的中英互翻",
    translationDescription:
      "提供每日免費額度，也能使用 OpenAI、OpenRouter、Gemini 或 xAI 的自有金鑰。",
    translationAction: "開始翻譯",
  },
  guide: {
    eyebrow: "使用說明",
    title: "三步完成文字轉換",
    steps: [
      { title: "選擇功能", description: "切換簡繁、編碼或中英翻譯。" },
      { title: "貼上文字", description: "每次最多可處理 10,000 個字元。" },
      { title: "轉換並複製", description: "取得結果後一鍵複製，立即使用。" },
    ],
  },
  faq: {
    eyebrow: "常見問題",
    title: "關於額度、隱私與 API",
    items: [
      {
        question: "簡繁與編碼轉換會消耗額度嗎？",
        answer:
          "不會。這兩項功能完全在瀏覽器中執行，不會呼叫翻譯 API，也沒有每日次數限制。",
      },
      {
        question: "免費中英翻譯有什麼限制？",
        answer:
          "每位訪客每天最多使用 20 次、每分鐘最多 5 次。限制能保護免費金鑰，讓更多人都能使用服務。",
      },
      {
        question: "我的 API Key 安全嗎？",
        answer:
          "自備金鑰只儲存在目前裝置的瀏覽器，送出翻譯請求時才短暫傳送，不會寫入本站資料庫。共用裝置使用後請清除設定。",
      },
      {
        question: "可以處理哪些中文地區用語？",
        answer:
          "支援簡體中文、台灣繁體與香港繁體。選擇「台灣詞彙」時，還會轉換常見地區用語。",
      },
    ],
  },
  footer: {
    tagline: "讓文字跨越語言與編碼的距離。",
    features: "功能",
    guide: "使用說明",
    faq: "常見問題",
    privacy: "隱私權政策",
    terms: "服務條款",
  },
  settings: {
    eyebrow: "翻譯服務",
    title: "API 設定",
    close: "關閉 API 設定",
    description:
      "免費方案每天 20 次；使用自己的金鑰則不計本站額度。設定只儲存在目前瀏覽器。",
    provider: "服務供應商",
    builtin: "譯匠免費額度（每日 20 次）",
    apiKey: "API Key",
    apiKeyPlaceholder: "貼上 API Key",
    model: "模型",
    privacy: "不會將 API Key 寫入伺服器資料庫",
    clear: "清除裝置設定",
    save: "儲存設定",
  },
  consent: {
    aria: "廣告與隱私設定",
    title: "廣告與隱私",
    description:
      "我們使用廣告維持免費服務。接受後 Google 可能使用 Cookie 顯示與衡量廣告；拒絕不影響轉換功能。",
    learnMore: "瞭解更多",
    reject: "拒絕",
    accept: "接受",
  },
};

const EN: AppCopy = {
  scriptLabels: {
    tw: "Traditional Chinese (Taiwan)",
    twp: "Traditional Chinese (Taiwan vocabulary)",
    cn: "Simplified Chinese",
    hk: "Traditional Chinese (Hong Kong)",
  },
  languageLabels: {
    "zh-TW": "Traditional Chinese",
    "zh-CN": "Simplified Chinese",
    en: "English",
  },
  encodingLabels: {
    base64: "Base64",
    url: "URL encoding",
    html: "HTML entities",
    unicode: "Unicode escape",
    hex: "UTF-8 hex",
  },
  notices: {
    ready: "Ready",
    processing: "Processing…",
    done: "Done",
    inputRequired: "Enter text to process first",
    emptyResponse: "The translation service did not respond. Try again later.",
    serviceUnavailable: "The translation service is temporarily unavailable",
    conversionFailed: "Conversion failed. Please try again.",
    copied: "Copied to clipboard",
    clipboardWriteFailed: "Unable to write to clipboard. Select the result manually.",
    pasted: "Pasted",
    clipboardReadFailed: "Allow the browser to read the clipboard",
    freeQuotaSaved: "Using the free translation quota",
    apiSettingsSaved: "API settings saved on this device",
    settingsCleared: "API settings cleared from this device",
  },
  ad: {
    top: "Below the tool",
    content: "In the content",
    placeholderAria: (label) => `${label} ad placement`,
    placeholderText: (label) => `${label} ad slot`,
    liveAria: (label) => `${label} ad`,
  },
  header: {
    homeAria: "Yijiang home",
    navAria: "Primary navigation",
    features: "Features",
    guide: "How it works",
    privacy: "Privacy",
    apiSettings: "API settings",
    useNow: "Try it now",
    languageToggleAria: "Switch interface language",
    languageToggle: "繁中",
  },
  hero: {
    eyebrow: "Free, fast, no installation",
    title: "Let your words arrive differently",
    description: "Script conversion, encoding, and Chinese-English translation in one workspace.",
  },
  translator: {
    aria: "Text conversion tool",
    tabsAria: "Choose a conversion tool",
    script: "Script conversion",
    encoding: "Text encoding",
    translate: "Chinese-English translation",
    unlimited: "Unlimited",
    sourceText: "Source text",
    targetText: "Target text",
    plainText: "Plain text",
    sourceLanguage: "Source language",
    targetLanguage: "Target language",
    encodingFormat: "Encoding format",
    paste: "Paste",
    inputPlaceholder: "Type or paste text here…",
    clear: "Clear",
    inputCount: (count) => `${count} / 10,000`,
    outputCount: (count) => `${count} characters`,
    outputPlaceholder: "Your converted result will appear here",
    swap: (source, target) => `Swap ${source} and ${target}`,
    copy: "Copy",
    copied: "Copied",
    copyResult: "Copy conversion result",
    start: "Convert",
    processing: "Processing…",
    encodeMode: "Encode mode",
    decodeMode: "Decode mode",
    dailyQuota: (used) => `Free quota today: ${used}/20`,
    ownKeyQuota: "Your API key is not counted against the free quota",
    setOwnKey: "Set your own API key",
    manageApi: "Manage API",
    quotaAria: "Free translation usage today",
    localNote: "Runs in your browser. Text is not uploaded and usage is unlimited.",
  },
  features: {
    eyebrow: "Everything in one place",
    title: "Three text tools, one clean interface",
    description: "Keep everyday tools together without installing another app.",
    scriptTitle: "Accurate script conversion",
    scriptDescription:
      "OpenCC supports Simplified Chinese, Taiwan Traditional Chinese, and Hong Kong Traditional Chinese, including regional vocabulary.",
    scriptAction: "Convert scripts",
    encodingTitle: "Complete encoding tools",
    encodingDescription:
      "Convert Base64, URL, HTML entities, Unicode escapes, and UTF-8 hex in both directions.",
    encodingAction: "Encode text",
    translationTitle: "Natural Chinese-English translation",
    translationDescription:
      "Use a daily free quota or bring your own OpenAI, OpenRouter, Gemini, or xAI key.",
    translationAction: "Translate text",
  },
  guide: {
    eyebrow: "How it works",
    title: "Convert text in three steps",
    steps: [
      { title: "Choose a tool", description: "Switch between scripts, encoding, or translation." },
      { title: "Paste your text", description: "Process up to 10,000 characters at a time." },
      { title: "Convert and copy", description: "Copy the result with one click and keep going." },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "About quota, privacy, and APIs",
    items: [
      {
        question: "Do script and encoding conversions use my quota?",
        answer:
          "No. Both run entirely in your browser, never call the translation API, and have no daily limit.",
      },
      {
        question: "What are the limits for free Chinese-English translation?",
        answer:
          "Each visitor can make up to 20 requests per day and 5 requests per minute. This protects the shared free key so more people can use the service.",
      },
      {
        question: "Is my API key safe?",
        answer:
          "Your key is stored only in this browser and sent briefly with a translation request. It is never written to the site database. Clear it after using a shared device.",
      },
      {
        question: "Which Chinese regional variants are supported?",
        answer:
          "Simplified Chinese, Taiwan Traditional Chinese, and Hong Kong Traditional Chinese are supported. Taiwan vocabulary mode also converts common regional terms.",
      },
    ],
  },
  footer: {
    tagline: "Helping words cross the distance between languages and encodings.",
    features: "Features",
    guide: "How it works",
    faq: "FAQ",
    privacy: "Privacy policy",
    terms: "Terms of service",
  },
  settings: {
    eyebrow: "Translation service",
    title: "API settings",
    close: "Close API settings",
    description:
      "The free plan includes 20 requests per day. Your own key does not use this quota. Settings stay in this browser.",
    provider: "Provider",
    builtin: "Yijiang free quota (20/day)",
    apiKey: "API key",
    apiKeyPlaceholder: "Paste an API key",
    model: "Model",
    privacy: "Your API key is never written to the server database",
    clear: "Clear device settings",
    save: "Save settings",
  },
  consent: {
    aria: "Advertising and privacy settings",
    title: "Advertising and privacy",
    description:
      "Ads help keep this service free. If you accept, Google may use cookies to show and measure ads. Declining does not affect conversion tools.",
    learnMore: "Learn more",
    reject: "Decline",
    accept: "Accept",
  },
};

export const APP_COPY: Record<UiLocale, AppCopy> = {
  "zh-Hant": ZH_HANT,
  en: EN,
};

export function isUiLocale(value: string | null): value is UiLocale {
  return value === "zh-Hant" || value === "en";
}
