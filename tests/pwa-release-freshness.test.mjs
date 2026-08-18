import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const serviceWorkerSource = readFileSync(new URL("../service-worker.js", import.meta.url), "utf8");

test("PWA cache version advances with the merged application release", () => {
  assert.match(serviceWorkerSource, /const CACHE_NAME = "cabinet-ninja-run-list-v31";/);
  assert.doesNotMatch(serviceWorkerSource, /cabinet-ninja-run-list-v30/);
  assert.match(serviceWorkerSource, /self\.skipWaiting\(\)/);
  assert.match(serviceWorkerSource, /self\.clients\.claim\(\)/);
  assert.match(serviceWorkerSource, /keys\.filter\(\(key\) => key !== CACHE_NAME\)/);

  for (const asset of [
    "./index.html",
    "./styles.css",
    "./app.js",
    "./manifest.webmanifest",
    "./vendor/pdfjs/pdf.min.mjs",
    "./vendor/pdfjs/pdf.worker.min.mjs",
  ]) {
    assert.match(serviceWorkerSource, new RegExp(`"${asset.replaceAll(".", "\\.")}"`));
  }
});

test("app-shell matching follows the service-worker scope", async () => {
  const listeners = new Map();
  const fetchedUrls = [];
  const context = {
    URL,
    Promise,
    console,
    fetch: async (request) => {
      fetchedUrls.push(request.url);
      return { source: "network", clone: () => ({}) };
    },
    caches: {
      open: async () => ({ put: async () => {} }),
      keys: async () => [],
      match: async () => ({ fromCache: true }),
    },
    self: {
      registration: { scope: "https://pages.example.test/custom-app/" },
      addEventListener: (type, handler) => listeners.set(type, handler),
      skipWaiting: () => {},
      clients: { claim: () => {} },
    },
  };

  vm.runInNewContext(serviceWorkerSource, context);
  const event = {
    request: { method: "GET", url: "https://pages.example.test/custom-app/app.js" },
    respondWith: (response) => {
      event.response = response;
    },
  };

  listeners.get("fetch")(event);
  const response = await event.response;
  assert.equal(response.source, "network");
  assert.deepEqual(fetchedUrls, ["https://pages.example.test/custom-app/app.js"]);
});
