const DAILY_LIMIT = 20;
const MINUTE_LIMIT = 5;
const MAX_LENGTH = 10_000;

type Language = "zh-TW" | "zh-CN" | "en";
type Provider = "builtin" | "openai" | "openrouter" | "gemini" | "xai";

type TranslationRequest = {
  text?: string;
  source?: Language;
  target?: Language;
  provider?: Provider;
  apiKey?: string;
  model?: string;
};

type QuotaRecord = {
  date: string;
  count: number;
  minuteBucket: number;
  minuteCount: number;
};

const quotaStore = new Map<string, QuotaRecord>();

const providerConfig: Record<
  Exclude<Provider, "builtin">,
  { base: string; model: string }
> = {
  openai: {
    base: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
  },
  openrouter: {
    base: "https://openrouter.ai/api/v1",
    model: "openai/gpt-4.1-mini",
  },
  gemini: {
    base: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: "gemini-2.5-flash",
  },
  xai: {
    base: "https://api.x.ai/v1",
    model: "grok-3-mini",
  },
};

function getClientAddress(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anonymous"
  );
}

async function visitorKey(request: Request) {
  const value = `${getClientAddress(request)}:${process.env.QUOTA_HASH_SALT || "yijiang-quota-v1"}`;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function readRemaining(request: Request) {
  if (new URL(request.url).hostname === "terminal.local") {
    return DAILY_LIMIT;
  }
  const key = await visitorKey(request);
  const record = quotaStore.get(key);
  if (!record || record.date !== today()) return DAILY_LIMIT;
  return Math.max(0, DAILY_LIMIT - record.count);
}

async function reserveQuota(request: Request) {
  if (new URL(request.url).hostname === "terminal.local") {
    return { allowed: true, remaining: DAILY_LIMIT - 1 };
  }
  const key = await visitorKey(request);
  const date = today();
  const bucket = Math.floor(Date.now() / 60_000);
  const existing = quotaStore.get(key);
  const record: QuotaRecord =
    !existing || existing.date !== date
      ? { date, count: 0, minuteBucket: bucket, minuteCount: 0 }
      : existing;

  if (
    record.count >= DAILY_LIMIT ||
    (record.minuteBucket === bucket && record.minuteCount >= MINUTE_LIMIT)
  ) {
    return {
      allowed: false,
      remaining: Math.max(0, DAILY_LIMIT - record.count),
    };
  }

  record.count += 1;
  if (record.minuteBucket === bucket) {
    record.minuteCount += 1;
  } else {
    record.minuteBucket = bucket;
    record.minuteCount = 1;
  }
  quotaStore.set(key, record);

  if (quotaStore.size > 10_000) {
    for (const [storedKey, storedRecord] of quotaStore) {
      if (storedRecord.date !== date) quotaStore.delete(storedKey);
    }
  }

  return {
    allowed: true,
    remaining: Math.max(0, DAILY_LIMIT - record.count),
  };
}

async function releaseQuota(request: Request) {
  if (new URL(request.url).hostname === "terminal.local") return;
  const key = await visitorKey(request);
  const record = quotaStore.get(key);
  if (!record || record.date !== today()) return;
  record.count = Math.max(0, record.count - 1);
  record.minuteCount = Math.max(0, record.minuteCount - 1);
  quotaStore.set(key, record);
}

function isLanguage(value: unknown): value is Language {
  return value === "zh-TW" || value === "zh-CN" || value === "en";
}

function isProvider(value: unknown): value is Provider {
  return (
    value === "builtin" ||
    value === "openai" ||
    value === "openrouter" ||
    value === "gemini" ||
    value === "xai"
  );
}

function languageName(language: Language) {
  return {
    "zh-TW": "Traditional Chinese used in Taiwan",
    "zh-CN": "Simplified Chinese",
    en: "English",
  }[language];
}

async function translateWithOpenAICompatible(
  base: string,
  key: string,
  model: string,
  text: string,
  source: Language,
  target: Language,
) {
  const response = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      ...(base.includes("openrouter.ai")
        ? {
            "HTTP-Referer":
              process.env.NEXT_PUBLIC_SITE_URL ||
              "https://hanzi-translate.mulinbro35964.chatgpt.site",
            "X-Title": "譯匠",
          }
        : {}),
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You are a precise translator. Translate from ${languageName(source)} to ${languageName(target)}. Preserve paragraphs, punctuation, names, numbers, and formatting. Return only the translated text without commentary.`,
        },
        { role: "user", content: text },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`上游翻譯服務回應錯誤（${response.status}）${detail ? "" : ""}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const translated = data.choices?.[0]?.message?.content?.trim();
  if (!translated) throw new Error("翻譯服務沒有回傳內容");
  return translated;
}

async function translateWithMyMemory(
  text: string,
  source: Language,
  target: Language,
) {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", `${source}|${target}`);
  const response = await fetch(url, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw new Error("免費翻譯服務暫時忙碌");
  const data = (await response.json()) as {
    responseData?: { translatedText?: string };
    responseStatus?: number;
    responseDetails?: string;
  };
  const translated = data.responseData?.translatedText?.trim();
  if (!translated || (data.responseStatus && data.responseStatus >= 400)) {
    throw new Error(data.responseDetails || "免費翻譯服務暫時無法使用");
  }
  return translated;
}

export async function GET(request: Request) {
  try {
    return Response.json({
      remaining: await readRemaining(request),
      dailyLimit: DAILY_LIMIT,
      minuteLimit: MINUTE_LIMIT,
    });
  } catch {
    return Response.json({
      remaining: DAILY_LIMIT,
      dailyLimit: DAILY_LIMIT,
      minuteLimit: MINUTE_LIMIT,
    });
  }
}

export async function POST(request: Request) {
  let body: TranslationRequest;
  try {
    body = (await request.json()) as TranslationRequest;
  } catch {
    return Response.json({ error: "請求格式不正確" }, { status: 400 });
  }

  const text = body.text?.trim() ?? "";
  const source = body.source;
  const target = body.target;
  const provider = isProvider(body.provider) ? body.provider : "builtin";

  if (!text) {
    return Response.json({ error: "請先輸入要翻譯的文字" }, { status: 400 });
  }
  if (text.length > MAX_LENGTH) {
    return Response.json(
      { error: `每次最多翻譯 ${MAX_LENGTH.toLocaleString()} 個字元` },
      { status: 400 },
    );
  }
  if (!isLanguage(source) || !isLanguage(target) || source === target) {
    return Response.json({ error: "請選擇不同的來源與目標語言" }, { status: 400 });
  }

  const usingBuiltin = provider === "builtin";
  let quota: { allowed: boolean; remaining: number } = {
    allowed: true,
    remaining: DAILY_LIMIT,
  };

  if (usingBuiltin) {
    quota = await reserveQuota(request);
    if (!quota.allowed) {
      return Response.json(
        {
          error:
            quota.remaining === 0
              ? "今日免費額度已用完，可設定自己的 API Key 繼續使用"
              : "操作太快了，請稍候一分鐘再試",
          remaining: quota.remaining,
        },
        {
          status: 429,
          headers: { "retry-after": "60" },
        },
      );
    }
  } else if (!body.apiKey?.trim()) {
    return Response.json({ error: "請先設定 API Key" }, { status: 400 });
  }

  try {
    const isPreview = new URL(request.url).hostname === "terminal.local";
    let translation: string;

    if (provider === "builtin") {
      if (isPreview && source !== "en" && target === "en") {
        translation =
          text === "讓文字跨越語言的距離。"
            ? "Let words cross the distance between languages."
            : `[Local preview] ${text}`;
      } else if (isPreview && source === "en" && target !== "en") {
        translation =
          text === "Let words cross the distance between languages."
            ? target === "zh-CN"
              ? "让文字跨越语言的距离。"
              : "讓文字跨越語言的距離。"
            : `[本機預覽] ${text}`;
      } else if (!isPreview && process.env.TRANSLATION_API_KEY) {
        translation = await translateWithOpenAICompatible(
          process.env.TRANSLATION_API_BASE || "https://api.openai.com/v1",
          process.env.TRANSLATION_API_KEY,
          process.env.TRANSLATION_MODEL || "gpt-4.1-mini",
          text,
          source,
          target,
        );
      } else {
        translation = await translateWithMyMemory(text, source, target);
      }
    } else {
      const config = providerConfig[provider];
      translation = await translateWithOpenAICompatible(
        config.base,
        body.apiKey!.trim(),
        body.model?.trim() || config.model,
        text,
        source,
        target,
      );
    }

    return Response.json({
      translation,
      remaining: usingBuiltin ? quota.remaining : undefined,
    });
  } catch (error) {
    if (usingBuiltin) await releaseQuota(request);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "翻譯服務暫時無法使用",
        remaining: usingBuiltin ? Math.min(DAILY_LIMIT, quota.remaining + 1) : undefined,
      },
      { status: 502 },
    );
  }
}
