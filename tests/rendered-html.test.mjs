import assert from "node:assert/strict";
import test from "node:test";

process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

const env = {
  ASSETS: {
    fetch: async () => new Response("Not found", { status: 404 }),
  },
};
const context = {
  waitUntil() {},
  passThroughOnException() {},
};

function request(path, init, host = "example.test") {
  const requestHeaders = new Headers(init?.headers);
  requestHeaders.set("host", host);
  requestHeaders.set("x-forwarded-host", host);
  requestHeaders.set("x-forwarded-proto", "https");
  return worker.fetch(
    new Request(`https://${host}${path}`, {
      ...init,
      headers: requestHeaders,
    }),
    env,
    context,
  );
}

test("renders the AquaMoon root landing page on the apex host", async () => {
  const response = await request("/", { headers: { accept: "text/html" } }, "aquamoon.app");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /讓好工具，先被理解，再被使用/);
  assert.match(html, /AquaMoon/);
  assert.match(html, /translate\.aquamoon\.app/);
  assert.match(html, /rel="canonical" href="https:\/\/aquamoon\.app\//);
  assert.match(html, /property="og:url" content="https:\/\/aquamoon\.app\//);
});

test("keeps the Yijiang translator on the translation subdomain", async () => {
  const response = await request("/", { headers: { accept: "text/html" } }, "translate.aquamoon.app");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /文字，換一種方式抵達/);
  assert.doesNotMatch(html, /讓好工具，先被理解，再被使用/);
  assert.match(html, /rel="canonical" href="https:\/\/translate\.aquamoon\.app\//);
});

test("renders production metadata and core content", async () => {
  const response = await request("/", {
    headers: {
      accept: "text/html",
    },
  });
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.match(html, /文字，換一種方式抵達/);
  assert.match(html, /property="og:image" content="https:\/\/example\.test\/og\.png"/);
  assert.match(html, /rel="canonical" href="https:\/\/example\.test\/"/);
  assert.match(html, /"@type":"WebSite"/);
  assert.doesNotMatch(html, /codex-preview/);
});

for (const [path, expected, canonical, ogTitle] of [
  [
    "/privacy",
    "隱私權政策",
    "https://example.test/privacy",
    "隱私權政策｜譯匠",
  ],
  ["/terms", "服務條款", "https://example.test/terms", "服務條款｜譯匠"],
  ["/robots.txt", "User-Agent"],
  ["/sitemap.xml", "<urlset"],
  ["/ads.txt", "(?:AdSense publisher ID|google\\.com,\\s+pub-)"],
]) {
  test(`serves ${path}`, async () => {
    const response = await request(path);
    assert.equal(response.status, 200);
    const body = await response.text();
    assert.match(body, new RegExp(expected, "i"));
    if (canonical) {
      assert.match(
        body,
        new RegExp(`rel="canonical" href="${canonical}"`),
      );
      assert.match(body, new RegExp(`property="og:url" content="${canonical}"`));
      assert.match(body, new RegExp(`property="og:title" content="${ogTitle}"`));
    }
  });
}

test("publishes the configured origin in robots and sitemap", async () => {
  const robots = await (await request("/robots.txt")).text();
  const sitemap = await (await request("/sitemap.xml")).text();

  assert.match(robots, /Sitemap: https:\/\/example\.test\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/example\.test\/<\/loc>/);
  assert.doesNotMatch(sitemap, /chatgpt\.site/);
});

test("includes the configured AdSense script in the shared head", async () => {
  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT) return;

  const response = await request("/", {
    headers: { accept: "text/html" },
  });
  const html = await response.text();

  assert.match(html, /id="google-adsense-script"/);
  assert.match(
    html,
    /https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-/,
  );
  assert.match(html, /crossorigin="anonymous"/);
});

test("publishes the AquaMoon origin for apex robots and sitemap", async () => {
  const robots = await (await request("/robots.txt", undefined, "aquamoon.app")).text();
  const sitemap = await (await request("/sitemap.xml", undefined, "aquamoon.app")).text();

  assert.match(robots, /Sitemap: https:\/\/aquamoon\.app\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/aquamoon\.app\/<\/loc>/);
});

test("renders English legal copy when requested", async () => {
  for (const [path, expected] of [
    ["/privacy?lang=en", "Privacy policy"],
    ["/terms?lang=en", "Terms of service"],
  ]) {
    const response = await request(path);
    const body = await response.text();
    assert.equal(response.status, 200);
    assert.match(body, new RegExp(expected));
    assert.match(body, /Back to Yijiang/);
  }
});

test("reports translation quota without exposing an identifier", async () => {
  const response = await request("/api/translate");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(Object.keys(body).sort(), [
    "dailyLimit",
    "minuteLimit",
    "remaining",
  ]);
  assert.equal(body.dailyLimit, 20);
});

test("validates translation input", async () => {
  const response = await request("/api/translate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      text: "hello",
      source: "en",
      target: "en",
      provider: "builtin",
    }),
  });

  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /不同的來源與目標語言/);
});

test("runs the local preview translation path", async () => {
  const response = await worker.fetch(
    new Request("https://terminal.local/api/translate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        text: "讓文字跨越語言的距離。",
        source: "zh-TW",
        target: "en",
        provider: "builtin",
      }),
    }),
    env,
    context,
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(
    body.translation,
    "Let words cross the distance between languages.",
  );
});
