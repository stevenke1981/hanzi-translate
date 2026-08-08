import assert from "node:assert/strict";
import test from "node:test";
import {
  convertEncoding,
  convertScript,
  detectTextKind,
} from "../lib/text-tools.ts";

test("detects simplified and traditional Chinese scripts", async () => {
  assert.equal(await detectTextKind("簡體中文轉換測試"), "traditional");
  assert.equal(await detectTextKind("简体中文转换测试"), "simplified");
  assert.equal(await detectTextKind("Let words cross languages."), "english");
});

test("keeps shared Chinese characters usable in automatic mode", async () => {
  assert.equal(await detectTextKind("你好世界"), "traditional");
  assert.equal(await detectTextKind("123 !?"), "unknown");
});

test("converts Taiwan vocabulary back to Simplified Chinese phrases", async () => {
  assert.equal(
    await convertScript("滑鼠、硬碟與軟體", "twp", "cn"),
    "鼠标、硬盘与软件",
  );
});

test("round-trips UTF-8 hexadecimal encoding", () => {
  const source = "譯匠：A→B";
  const encoded = convertEncoding(source, "hex", false);
  assert.equal(convertEncoding(encoded, "hex", true), source);
  assert.equal(
    convertEncoding(
      encoded
        .split(" ")
        .map((byte) => `0x${byte}`)
        .join(" "),
      "hex",
      true,
    ),
    source,
  );
});

test("rejects invalid hexadecimal text instead of silently dropping it", () => {
  assert.throws(
    () => convertEncoding("e8 zz", "hex", true),
    /含有無效字元/,
  );
});
