export type ScriptLocale = "tw" | "twp" | "cn" | "hk";
export type DetectedTextKind =
  | "simplified"
  | "traditional"
  | "mixed"
  | "english"
  | "unknown";
export type Encoding = "base64" | "url" | "html" | "unicode" | "hex";

type OpenCCModule = typeof import("opencc-js");

async function loadOpenCC(
  from: ScriptLocale,
  to: ScriptLocale,
): Promise<OpenCCModule> {
  if (from === "cn") return import("opencc-js/cn2t");
  if (to === "cn") return import("opencc-js/t2cn");
  return import("opencc-js");
}

export async function convertScript(
  value: string,
  from: ScriptLocale,
  to: ScriptLocale,
) {
  if (from === to) return value;
  const { default: OpenCC } = await loadOpenCC(from, to);
  return OpenCC.Converter({ from, to })(value);
}

function countDifferences(source: string, converted: string) {
  const sourceCharacters = Array.from(source);
  const convertedCharacters = Array.from(converted);
  const lengthDifference = Math.abs(
    sourceCharacters.length - convertedCharacters.length,
  );
  const sharedLength = Math.min(
    sourceCharacters.length,
    convertedCharacters.length,
  );
  let differences = lengthDifference;
  for (let index = 0; index < sharedLength; index += 1) {
    if (sourceCharacters[index] !== convertedCharacters[index]) {
      differences += 1;
    }
  }
  return differences;
}

export async function detectTextKind(value: string): Promise<DetectedTextKind> {
  const text = value.trim();
  if (!text) return "unknown";

  if (!/\p{Script=Han}/u.test(text)) {
    return /[A-Za-z]/.test(text) ? "english" : "unknown";
  }

  const [simplifiedToTraditional, traditionalToSimplified] = await Promise.all([
    convertScript(text, "cn", "tw"),
    convertScript(text, "tw", "cn"),
  ]);
  const simplifiedChanges = countDifferences(text, simplifiedToTraditional);
  const traditionalChanges = countDifferences(text, traditionalToSimplified);

  if (simplifiedChanges > 0 && traditionalChanges === 0) return "simplified";
  if (traditionalChanges > 0 && simplifiedChanges === 0) return "traditional";
  if (simplifiedChanges > 0 && traditionalChanges > 0) return "mixed";
  return "traditional";
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
    .replace(/\\u\{([0-9a-fA-F]{1,6})\}/g, (_, hex: string) => {
      const codePoint = Number.parseInt(hex, 16);
      if (codePoint > 0x10ffff) throw new Error("Unicode 碼位超出有效範圍");
      return String.fromCodePoint(codePoint);
    })
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    );
}

function encodeHex(value: string) {
  return Array.from(new TextEncoder().encode(value))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join(" ");
}

function decodeHex(value: string) {
  const normalized = value
    .replace(/(^|[\s,;:_-])0x/gi, "$1")
    .replace(/[\s,;:_-]/g, "");
  if (/[^0-9a-fA-F]/.test(normalized)) {
    throw new Error("十六進位內容含有無效字元");
  }
  if (normalized.length % 2 !== 0) {
    throw new Error("十六進位內容長度不正確");
  }
  const bytes = new Uint8Array(
    normalized.match(/.{2}/g)?.map((hex) => Number.parseInt(hex, 16)) ?? [],
  );
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export function convertEncoding(
  value: string,
  encoding: Encoding,
  decode: boolean,
) {
  if (decode) {
    return {
      base64: base64ToUtf8,
      url: decodeURIComponent,
      html: decodeHtml,
      unicode: decodeUnicode,
      hex: decodeHex,
    }[encoding](value);
  }

  return {
    base64: utf8ToBase64,
    url: encodeURIComponent,
    html: encodeHtml,
    unicode: encodeUnicode,
    hex: encodeHex,
  }[encoding](value);
}
