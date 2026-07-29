import assert from "node:assert/strict";
import test from "node:test";

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

function request(path, init) {
  return worker.fetch(new Request(`https://example.test${path}`, init), env, context);
}

test("renders production metadata and core content", async () => {
  const response = await request("/", {
    headers: {
      accept: "text/html",
      host: "example.test",
      "x-forwarded-host": "example.test",
      "x-forwarded-proto": "https",
    },
  });
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.match(html, /文字，換一種方式抵達/);
  assert.match(html, /property="og:image" content="https:\/\/example\.test\/og\.png"/);
  assert.doesNotMatch(html, /codex-preview/);
});

for (const [path, expected] of [
  ["/privacy", "隱私權政策"],
  ["/terms", "服務條款"],
  ["/robots.txt", "User-Agent"],
  ["/sitemap.xml", "<urlset"],
  ["/ads.txt", "AdSense publisher ID"],
]) {
  test(`serves ${path}`, async () => {
    const response = await request(path);
    assert.equal(response.status, 200);
    assert.match(await response.text(), new RegExp(expected, "i"));
  });
}

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
