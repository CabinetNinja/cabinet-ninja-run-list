import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const rowParserStart = appSource.indexOf("function extractMozaikPartRows(lines) {");
const rowParserEnd = appSource.indexOf("function extractDrawingShortLabels(");
const bandParserStart = appSource.indexOf("function parseBandValues(band) {");
const bandParserEnd = appSource.indexOf("function edgesFromBandValues(");

function parserContext() {
  assert.notEqual(rowParserStart, -1, "Mozaik row parser is present");
  assert.notEqual(rowParserEnd, -1, "Mozaik row parser has a boundary");
  assert.notEqual(bandParserStart, -1, "band parser is present");
  assert.notEqual(bandParserEnd, -1, "band parser has a boundary");
  const context = vm.createContext({});
  vm.runInContext(`${appSource.slice(rowParserStart, rowParserEnd)}\n${appSource.slice(bandParserStart, bandParserEnd)}`, context);
  return context;
}

test("parses the Reece Tewhaiti Mozaik rows with numeric and N cabinet IDs", () => {
  const context = parserContext();
  const rows = context.extractMozaikPartRows([
    "Part# Name Width Length Band Cab# Comment",
    "26 Bottom 563 1,108 F-1,0,0,0 8",
    "31 FEnd (R) 599 2,298 F-3,3,0,3 N5 Finished End",
    "61 Filler 78 730 Custom* N9 Oversized Filler for CNC",
    "99 Panel 500 600 F-1,0,0,0 R1C12 Legacy format",
    "101 Panel 500 600 F-1,0,0,0 R2 Room-only reference",
    "Page 1 of 20",
  ]);

  assert.equal(rows.length, 5);
  assert.equal(rows[0].cab, "8");
  assert.equal(rows[1].cab, "N5");
  assert.equal(rows[2].band, "Custom*");
  assert.equal(rows[2].comment, "Oversized Filler for CNC");
  assert.equal(rows[3].cab, "R1C12");
  assert.equal(rows[4].cab, "R2");
});

test("treats custom banding as no directional edge data", () => {
  const context = parserContext();
  assert.deepEqual(Array.from(context.parseBandValues("Custom*")), [0, 0, 0, 0]);
  assert.deepEqual(Array.from(context.parseBandValues("F-3,3,0,3")), [3, 3, 0, 3]);
});