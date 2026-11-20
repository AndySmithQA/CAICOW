import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { estimateText } from "./lib/estimate.mjs";
import { modelById, priceTokens } from "./lib/rates.mjs";
import { analyseFile, compareFiles, qualityOf } from "./lib/workflow.mjs";

const root = path.resolve(import.meta.dirname, "..");
const cli = path.join(root, "tools", "workflow-usage.mjs");
const estimator = path.join(root, "tools", "estimate-tokens.mjs");

function run(args) {
  return spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });
}

test("estimates about 4 characters per token", () => {
  assert.deepEqual(estimateText("abcd"), { chars: 4, words: 1, tokens: 1 });
  assert.equal(estimateText("abcde").tokens, 2);
  assert.equal(estimateText("").tokens, 1);
  assert.equal(estimateText("one two").words, 2);
});

test("prices a million tokens of GPT-5.3-Codex in separate buckets", () => {
  const model = modelById("gpt-5.3-codex");
  const input = priceTokens(model, { input: 1_000_000 });
  const cached = priceTokens(model, { cached: 1_000_000 });
  const output = priceTokens(model, { output: 1_000_000 });
  const rewritten = priceTokens(model, { cacheWrite: 1_000_000 });
  assert.ok(Math.abs(input.credits - 175) < 1e-9);
  assert.ok(Math.abs(cached.credits - 17.5) < 1e-9);
  assert.ok(Math.abs(output.credits - 1400) < 1e-9);
  assert.equal(rewritten.tier, "Default");
  assert.ok(Math.abs(rewritten.credits - 175) < 1e-9);
});

test("uses the long-context tier only above the published threshold", () => {
  const model = modelById("gpt-5.6-luna");
  const atCap = priceTokens(model, { input: 200_000 });
  const over = priceTokens(model, { input: 200_001 });
  assert.equal(atCap.tier, "Default");
  assert.equal(over.tier, "Long context");
  assert.ok(over.credits > atCap.credits * 1.5);
});

test("bills a stable file once, then as cached input", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "token-usage-"));
  try {
    writeFileSync(path.join(dir, "stable.md"), "abcd");
    writeFileSync(path.join(dir, "fresh.md"), "abcdefgh");
    writeFileSync(
      path.join(dir, "workflow.json"),
      JSON.stringify({
        feature: "Cache check",
        label: "Lab",
        model: "gpt-5.3-codex",
        stages: [
          {
            id: "one",
            name: "One",
            files: [
              { path: "stable.md", role: "always-on", cache: "stable" },
              { path: "fresh.md", role: "prompt", cache: "fresh" },
            ],
            outputTokens: 4,
          },
          {
            id: "two",
            name: "Two",
            files: [{ path: "stable.md", role: "always-on", cache: "stable" }],
            outputTokens: 0,
          },
        ],
      }),
    );
    const report = analyseFile(path.join(dir, "workflow.json"));
    assert.equal(report.stages[0].input, 3);
    assert.equal(report.stages[0].cached, 0);
    assert.equal(report.stages[1].input, 0);
    assert.equal(report.stages[1].cached, 1);
    assert.equal(report.stages[1].files[0].billing, "cached");
    const model = modelById("gpt-5.3-codex");
    const expected =
      priceTokens(model, { input: 3, output: 4 }).credits + priceTokens(model, { cached: 1, output: 0 }).credits;
    assert.ok(Math.abs(report.totals.credits - expected) < 1e-9);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("writes a stable file to cache when the model has a cache-write price", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "token-usage-"));
  try {
    writeFileSync(path.join(dir, "stable.md"), "abcd");
    writeFileSync(
      path.join(dir, "workflow.json"),
      JSON.stringify({
        feature: "Write check",
        model: "claude-sonnet-5",
        stages: [{ id: "one", name: "One", files: [{ path: "stable.md", cache: "stable" }], outputTokens: 0 }],
      }),
    );
    const report = analyseFile(path.join(dir, "workflow.json"));
    assert.equal(report.stages[0].cacheWrite, 1);
    assert.equal(report.stages[0].input, 0);
    assert.equal(report.stages[0].files[0].billing, "cache-write");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("rejects a workflow that drops necessary checks", () => {
  const effectiveness = {
    completedCorrectly: "yes",
    acceptanceCriteriaMet: "yes",
    necessaryChecksRetained: "no",
    correctiveInteractions: 0,
    notes: "",
  };
  assert.equal(qualityOf(effectiveness).status, "rejected");
  const dir = mkdtempSync(path.join(tmpdir(), "token-usage-"));
  try {
    writeFileSync(path.join(dir, "note.md"), "abcd");
    writeFileSync(
      path.join(dir, "workflow.json"),
      JSON.stringify({
        feature: "Quality",
        model: "gpt-5.3-codex",
        stages: [
          {
            id: "test",
            name: "Testing and review",
            files: ["note.md"],
            outputTokens: 1,
            effectiveness,
          },
        ],
      }),
    );
    const loose = run([cli, path.join(dir, "workflow.json")]);
    const strict = run([cli, path.join(dir, "workflow.json"), "--strict"]);
    assert.equal(loose.status, 0);
    assert.match(loose.stdout, /Not a saving/);
    assert.equal(strict.status, 1);
    assert.match(strict.stdout, /Not a saving/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("estimate-tokens.mjs keeps the lab table and the two-file ratio", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "token-usage-"));
  try {
    writeFileSync(path.join(dir, "short.txt"), "a".repeat(40));
    writeFileSync(path.join(dir, "long.txt"), "a".repeat(80));
    const result = run([estimator, path.join(dir, "short.txt"), path.join(dir, "long.txt")]);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Est\. tokens/);
    assert.match(result.stdout, /long\.txt is about 2\.0x the estimated tokens of short\.txt/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("SR-263 reference sends less context at every stage and keeps the status rules", () => {
  const report = compareFiles(
    path.join(root, "course", "baseline", "workflow.json"),
    path.join(root, "course", "reference", "workflow.json"),
  );
  assert.equal(report.feature, "SR-263: Reopen a resolved request with a reason");
  for (const stage of report.stages) {
    assert.equal(stage.gap, null);
    assert.ok(stage.optimised.contextTokens < stage.baseline.contextTokens, stage.name);
  }
  const implementation = report.stages.find((stage) => stage.id === "implementation");
  assert.ok(implementation.optimised.files.some((file) => file.path.includes("status-rules")));
  assert.ok(implementation.optimised.files.some((file) => file.path.includes("reopen.instructions")));
  assert.equal(implementation.baseline.retryInput, 1800);
  assert.equal(implementation.optimised.retryInput, 0);
});

test("the inherited workflow loads this app's .github files, and the reopen instructions are not already in the app", () => {
  const report = analyseFile(path.join(root, "course", "baseline", "workflow.json"));
  for (const stage of report.stages) {
    for (const file of stage.files.filter((entry) => !["prompt", "requirements"].includes(entry.role))) {
      assert.ok(file.path.startsWith("../../.github/"), `${stage.name}: ${file.path}`);
    }
  }
  assert.throws(() => readFileSync(path.join(root, ".github", "instructions", "reopen.instructions.md")));
});

test("a missing file fails before a report is printed", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "token-usage-"));
  try {
    writeFileSync(
      path.join(dir, "workflow.json"),
      JSON.stringify({
        feature: "Missing",
        model: "gpt-5.3-codex",
        stages: [{ id: "one", name: "One", files: ["absent.md"] }],
      }),
    );
    const result = run([cli, path.join(dir, "workflow.json")]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /cannot read absent\.md/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
