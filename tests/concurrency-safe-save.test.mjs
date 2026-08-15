import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const helperStart = appSource.indexOf("function changedRecordRows");
const helperEnd = appSource.indexOf("function createDataStore", helperStart);
const helperContext = {};
vm.runInNewContext(`${appSource.slice(helperStart, helperEnd)}; this.changedRecordRows = changedRecordRows;`, helperContext);

test("remote saves use record-level optimistic updates instead of whole-state upserts", () => {
  assert.doesNotMatch(appSource, /\.upsert\s*\(/);
  assert.match(appSource, /\.insert\(cleaned\)/);
  assert.match(appSource, /\.eq\("updated_at", previous\.updated_at\)/);
  assert.match(appSource, /Concurrent update detected/);
});

test("changedRecordRows sends only records changed from the last synced snapshot", () => {
  const cleaner = ({ id, value }) => ({ id, value });
  const changed = helperContext.changedRecordRows(
    [{ id: "one", value: "old" }, { id: "two", value: "same" }],
    [{ id: "one", value: "new" }, { id: "two", value: "same" }, { id: "three", value: "new" }],
    cleaner,
  );
  assert.deepEqual(changed.map(({ row, previous }) => [row.id, previous?.value || null]), [["one", "old"], ["three", null]]);
});
