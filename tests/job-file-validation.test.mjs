import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const helperStart = appSource.indexOf("function assertJobFileAllowed(file) {");
const helperEnd = appSource.indexOf("function formatDateTime(value) {");

function validator() {
  assert.notEqual(helperStart, -1, "job-file validation helper is present");
  assert.notEqual(helperEnd, -1, "job-file validation helper has a boundary");
  const context = vm.createContext({
    JOB_FILE_MAX_BYTES: 50 * 1024 * 1024,
    JOB_FILE_ALLOWED_EXTENSIONS: new Set(["jpg", "jpeg", "png", "webp", "heic", "pdf", "txt", "csv", "doc", "docx", "xls", "xlsx", "dxf", "dwg"]),
    JOB_FILE_BLOCKED_EXTENSIONS: new Set(["exe", "com", "bat", "cmd", "msi", "ps1", "js", "mjs", "vbs", "jar", "sh", "zip", "rar", "7z", "html", "htm", "svg"]),
    fileExtension: (name) => name.split(".").pop() || "",
  });
  vm.runInContext(appSource.slice(helperStart, helperEnd), context);
  return context.assertJobFileAllowed;
}

test("allows approved files inside the 50 MiB limit", () => {
  assert.doesNotThrow(() => validator()({ name: "cut-sheet.pdf", size: 50 * 1024 * 1024 }));
});

test("blocks executable, archive, and unknown job-file extensions", () => {
  const assertJobFileAllowed = validator();
  assert.throws(() => assertJobFileAllowed({ name: "installer.exe", size: 1 }), /not allowed/);
  assert.throws(() => assertJobFileAllowed({ name: "archive.zip", size: 1 }), /not allowed/);
  assert.throws(() => assertJobFileAllowed({ name: "unknown.bin", size: 1 }), /not approved/);
});

test("blocks a file over the configured 50 MiB limit", () => {
  assert.throws(() => validator()({ name: "large.pdf", size: 50 * 1024 * 1024 + 1 }), /50 MiB/);
});

test("blocks common executable headers even when an executable is renamed", async () => {
  const helperStart = appSource.indexOf("async function assertJobFileContentAllowed(file) {");
  const helperEnd = appSource.indexOf("function formatDateTime(value) {");
  const context = vm.createContext({});
  vm.runInContext(appSource.slice(helperStart, helperEnd), context);
  const renamedExecutable = { slice: () => ({ arrayBuffer: async () => Uint8Array.from([0x4d, 0x5a, 0x90, 0x00]).buffer }) };
  const renamedScript = { slice: () => ({ arrayBuffer: async () => new TextEncoder().encode("#!/bin/sh").buffer }) };
  await assert.rejects(() => context.assertJobFileContentAllowed(renamedExecutable), /executable or script/);
  await assert.rejects(() => context.assertJobFileContentAllowed(renamedScript), /executable or script/);
});

test("browser source contains no service-role secret and the Edge Function fixes expiry", () => {
  const edgeSource = readFileSync(new URL("../supabase/functions/job-file-url/index.ts", import.meta.url), "utf8");
  assert.doesNotMatch(appSource, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(edgeSource, /const expiresIn = 15 \* 60/);
  assert.doesNotMatch(edgeSource, /body\?\.expiresIn/);
});
