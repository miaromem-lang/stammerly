import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { sanitiseAcousticEvents } from "./index.ts";

Deno.test("sanitiseAcousticEvents: returns [] for non-array input", () => {
  assertEquals(sanitiseAcousticEvents(null), []);
  assertEquals(sanitiseAcousticEvents(undefined), []);
  assertEquals(sanitiseAcousticEvents("not an array"), []);
  assertEquals(sanitiseAcousticEvents({ foo: 1 }), []);
  assertEquals(sanitiseAcousticEvents(42), []);
});

Deno.test("sanitiseAcousticEvents: passes through a valid event unchanged", () => {
  const input = [{
    id: "evt-1",
    type: "BLOCK",
    confidence: 0.8,
    durationMs: 750,
    timestamp: "2026-05-15T10:00:00.000Z",
    detail: "silent block on /p/",
  }];
  const out = sanitiseAcousticEvents(input);
  assertEquals(out.length, 1);
  assertEquals(out[0].id, "evt-1");
  assertEquals(out[0].type, "BLOCK");
  assertEquals(out[0].confidence, 0.8);
  assertEquals(out[0].durationMs, 750);
  assertEquals(out[0].detail, "silent block on /p/");
});

Deno.test("sanitiseAcousticEvents: clamps durationMs to [0, 60000]", () => {
  const out = sanitiseAcousticEvents([
    { type: "BLOCK", durationMs: -500, confidence: 0.5 },
    { type: "PROLONGATION", durationMs: 999_999, confidence: 0.5 },
    { type: "REPETITION", durationMs: 1234, confidence: 0.5 },
  ]);
  assertEquals(out.length, 3);
  assertEquals(out[0].durationMs, 0);
  assertEquals(out[1].durationMs, 60_000);
  assertEquals(out[2].durationMs, 1234);
});

Deno.test("sanitiseAcousticEvents: clamps confidence to [0, 1] and defaults invalid to 0.5", () => {
  const out = sanitiseAcousticEvents([
    { type: "BLOCK", durationMs: 100, confidence: -2 },
    { type: "BLOCK", durationMs: 100, confidence: 5 },
    { type: "BLOCK", durationMs: 100, confidence: "high" },
    { type: "BLOCK", durationMs: 100 }, // missing confidence
    { type: "BLOCK", durationMs: 100, confidence: NaN },
    { type: "BLOCK", durationMs: 100, confidence: Infinity },
  ]);
  assertEquals(out.length, 6);
  assertEquals(out[0].confidence, 0);
  assertEquals(out[1].confidence, 1);
  assertEquals(out[2].confidence, 0.5);
  assertEquals(out[3].confidence, 0.5);
  assertEquals(out[4].confidence, 0.5);
  assertEquals(out[5].confidence, 0.5);
});

Deno.test("sanitiseAcousticEvents: defaults non-finite/missing duration to 0", () => {
  const out = sanitiseAcousticEvents([
    { type: "BLOCK", confidence: 0.5 }, // missing durationMs
    { type: "BLOCK", durationMs: NaN, confidence: 0.5 },
    { type: "BLOCK", durationMs: Infinity, confidence: 0.5 },
    { type: "BLOCK", durationMs: "500", confidence: 0.5 },
  ]);
  assertEquals(out.length, 4);
  for (const e of out) assertEquals(e.durationMs, 0);
});

Deno.test("sanitiseAcousticEvents: drops malformed events", () => {
  const out = sanitiseAcousticEvents([
    null,
    undefined,
    "string entry",
    42,
    {},                                    // missing type
    { type: "UNKNOWN", durationMs: 100 },  // bad type
    { type: 123, durationMs: 100 },        // non-string type
    { type: "block", durationMs: 100 },    // wrong case
    { type: "BLOCK", durationMs: 100, confidence: 0.5 }, // valid — keep
  ]);
  assertEquals(out.length, 1);
  assertEquals(out[0].type, "BLOCK");
});

Deno.test("sanitiseAcousticEvents: caps array length at 500", () => {
  const huge = Array.from({ length: 5_000 }, () => ({
    type: "BLOCK",
    durationMs: 100,
    confidence: 0.5,
  }));
  const out = sanitiseAcousticEvents(huge);
  assertEquals(out.length, 500);
});

Deno.test("sanitiseAcousticEvents: assigns id when missing and truncates detail to 240 chars", () => {
  const longDetail = "x".repeat(1000);
  const out = sanitiseAcousticEvents([
    { type: "INTERJECTION", durationMs: 50, confidence: 0.4, detail: longDetail },
    { type: "BLOCK", durationMs: 100, confidence: 0.5, id: 123 }, // non-string id
  ]);
  assertEquals(out.length, 2);
  assertEquals(out[0].detail.length, 240);
  assert(typeof out[0].id === "string" && out[0].id.length > 0);
  assert(typeof out[1].id === "string" && out[1].id !== "123");
});

Deno.test("sanitiseAcousticEvents: accepts all four allowed types", () => {
  const out = sanitiseAcousticEvents([
    { type: "BLOCK", durationMs: 100, confidence: 0.5 },
    { type: "PROLONGATION", durationMs: 100, confidence: 0.5 },
    { type: "REPETITION", durationMs: 100, confidence: 0.5 },
    { type: "INTERJECTION", durationMs: 100, confidence: 0.5 },
  ]);
  assertEquals(out.map((e) => e.type), ["BLOCK", "PROLONGATION", "REPETITION", "INTERJECTION"]);
});

Deno.test("sanitiseAcousticEvents: defaults missing detail to empty string and missing timestamp to ISO now", () => {
  const before = Date.now();
  const out = sanitiseAcousticEvents([
    { type: "BLOCK", durationMs: 100, confidence: 0.5 },
  ]);
  assertEquals(out[0].detail, "");
  assert(typeof out[0].timestamp === "string");
  const t = Date.parse(out[0].timestamp as string);
  assert(t >= before - 1000 && t <= Date.now() + 1000);
});
