import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { matchSafeguardingKeywords, SAFEGUARDING_KEYWORDS } from "./index.ts";

// --- Negative cases: \b boundaries must NOT match substrings ---

Deno.test("safeguarding: 'hurtle' must not trigger 'hurt'", () => {
  assertEquals(matchSafeguardingKeywords("The wagon began to hurtle down the hill."), []);
});

Deno.test("safeguarding: 'hurtling' must not trigger 'hurt'/'hurting'", () => {
  assertEquals(matchSafeguardingKeywords("Cars hurtling past the window."), []);
});

Deno.test("safeguarding: 'hitch' must not trigger 'hit'", () => {
  assertEquals(matchSafeguardingKeywords("There was a small hitch in the plan."), []);
});

Deno.test("safeguarding: 'hitchhike' / 'pitch' must not trigger 'hit'", () => {
  assertEquals(matchSafeguardingKeywords("We pitched a tent and hitchhiked home."), []);
});

Deno.test("safeguarding: 'studied' must not trigger 'die'/'died'", () => {
  assertEquals(matchSafeguardingKeywords("She studied biology last night."), []);
});

Deno.test("safeguarding: 'diet' must not trigger 'die'", () => {
  assertEquals(matchSafeguardingKeywords("I started a new diet this week."), []);
});

Deno.test("safeguarding: 'killer whale documentary' contains 'killer' (no match for kill*)", () => {
  // "killer" is not in the keyword list and \bkill\b should not match inside "killer"
  assertEquals(matchSafeguardingKeywords("We watched a killer whale documentary."), []);
});

Deno.test("safeguarding: 'killing' substrings like 'skilling' do not match", () => {
  assertEquals(matchSafeguardingKeywords("Upskilling staff this quarter."), []);
});

Deno.test("safeguarding: 'scarred' must not trigger 'scared'", () => {
  assertEquals(matchSafeguardingKeywords("He was scarred from the accident."), []);
});

Deno.test("safeguarding: 'abused' inside 'unabused' style words — boundary holds", () => {
  // No standard word, but verify 'abuser' / 'disabused' don't false-trigger 'abuse'/'abused'
  assertEquals(matchSafeguardingKeywords("She quickly disabused him of the idea."), []);
});

// --- Positive cases: real matches still fire ---

Deno.test("safeguarding: bare 'hurt' triggers", () => {
  assertEquals(matchSafeguardingKeywords("My arm hurt yesterday."), ["hurt"]);
});

Deno.test("safeguarding: 'hurting' triggers (variant)", () => {
  assertEquals(matchSafeguardingKeywords("It's hurting me."), ["hurting"]);
});

Deno.test("safeguarding: 'killed' triggers (variant)", () => {
  assertEquals(matchSafeguardingKeywords("He killed the spider."), ["killed"]);
});

Deno.test("safeguarding: 'dieing' (misspelling) triggers", () => {
  assertEquals(matchSafeguardingKeywords("The plant is dieing."), ["dieing"]);
});

Deno.test("safeguarding: 'dying' triggers", () => {
  assertEquals(matchSafeguardingKeywords("I'm dying inside."), ["dying"]);
});

Deno.test("safeguarding: multi-word 'help me' triggers with surrounding punctuation", () => {
  const hits = matchSafeguardingKeywords("Please, help me!");
  assert(hits.includes("help me"));
});

Deno.test("safeguarding: case-insensitive matching", () => {
  assertEquals(matchSafeguardingKeywords("HURT"), ["hurt"]);
});

Deno.test("safeguarding: punctuation adjacent to keyword still matches", () => {
  assertEquals(matchSafeguardingKeywords("I hurt!"), ["hurt"]);
  assertEquals(matchSafeguardingKeywords("(hurt)"), ["hurt"]);
});

Deno.test("safeguarding: keyword list is non-empty and unique", () => {
  assert(SAFEGUARDING_KEYWORDS.length > 0);
  assertEquals(new Set(SAFEGUARDING_KEYWORDS).size, SAFEGUARDING_KEYWORDS.length);
});
