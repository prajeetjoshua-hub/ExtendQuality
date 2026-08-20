import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the EXtendQuality inspector dashboard", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>EXtendQuality \| Intelligent Bearing Inspection<\/title>/i);
  assert.match(html, /Inspection intelligence/);
  assert.match(html, /Camera Feed/);
  assert.match(html, /VLM Analysis/);
  assert.match(html, /VLM Recommendation/);
  assert.match(html, /Previous Defects/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("keeps unfinished inspection modules explicitly locked", async () => {
  const response = await render();
  const html = await response.text();
  const visibleHtml = html.split('<script id="_R_">', 1)[0];

  assert.equal((visibleHtml.match(/MODULE LOCKED/g) ?? []).length, 3);
  assert.equal((visibleHtml.match(/data-locked="true"/g) ?? []).length, 3);
  assert.match(html, /Secure local processing/);
  assert.match(html, /Human-in-the-loop ready/);
});
