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
  assert.match(html, /Processing Analysis/);
  assert.match(html, /VLM Recommendation/);
  assert.match(html, /Previous defects/i);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("renders the connected inspection controls and safety messaging", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /Run inspection/);
  assert.match(html, /Start camera/);
  assert.match(html, /OpenCV preprocessing/);
  assert.match(html, /Inspector decision recorded/);
  assert.doesNotMatch(html, /MODULE LOCKED/);
});
