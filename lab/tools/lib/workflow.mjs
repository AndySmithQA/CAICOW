import { readFileSync } from "node:fs";
import path from "node:path";
import { estimateText } from "./estimate.mjs";
import { CREDIT_USD, RATES_AS_OF, RATES_SOURCE, modelById, priceTokens } from "./rates.mjs";

const ROLES = new Set(["always-on", "path-scoped", "on-demand", "prompt", "requirements"]);
const TOTAL_KEYS = [
  "input",
  "cached",
  "cacheWrite",
  "output",
  "retryInput",
  "retryOutput",
  "contextTokens",
  "tokens",
  "credits",
  "usd",
];

export const DECISION_QUESTIONS = [
  "What am I asking Copilot to do?",
  "What context, skills, or agents will be loaded?",
  "Is the existing skill appropriate for this task?",
  "What can I leave out of this call?",
  "Does the estimated saving justify the change, once retries and quality are counted?",
];

export function contentHash(text) {
  let hash = 2166136261;
  for (const char of text) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

export function changePct(baseline, revised) {
  if (!baseline) return null;
  return ((baseline - revised) / baseline) * 100;
}

export function qualityOf(effectiveness) {
  if (!effectiveness) {
    return { status: "not-recorded", label: "Quality not recorded" };
  }
  const checks = effectiveness.necessaryChecksRetained ?? "unknown";
  const criteria = effectiveness.acceptanceCriteriaMet ?? "unknown";
  const completed = effectiveness.completedCorrectly ?? "unknown";
  if (checks === "no") {
    return {
      status: "rejected",
      label: "Not a saving: necessary tests or security checks were removed",
    };
  }
  if (criteria === "no") {
    return { status: "rejected", label: "Not a saving: acceptance criteria were missed" };
  }
  if (completed === "no") {
    return { status: "rejected", label: "Not a saving: the task was not completed correctly" };
  }
  if (checks === "yes" && criteria === "yes" && completed === "yes") {
    return { status: "accepted", label: "Quality bar met" };
  }
  return { status: "not-evidenced", label: "Token delta only; quality not evidenced yet" };
}

function fail(message) {
  throw new Error(`Workflow: ${message}`);
}

function asObject(value, label) {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} must be an object`);
  }
  return value;
}

function asNonNegativeInt(value, label) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    fail(`${label} must be a non-negative integer`);
  }
  return value;
}

function displayPath(relative) {
  return relative.split(path.sep).join("/");
}

function readTextFile(workflowFile, relative, label) {
  if (typeof relative !== "string" || relative.trim() === "") {
    fail(`${label} needs a path`);
  }
  const absolute = path.resolve(path.dirname(workflowFile), relative);
  let text;
  try {
    text = readFileSync(absolute, "utf8");
  } catch {
    fail(`cannot read ${relative} (${absolute})`);
  }
  return { relative: displayPath(relative), absolute, text };
}

function blankTotals() {
  return {
    input: 0,
    cached: 0,
    cacheWrite: 0,
    output: 0,
    retryInput: 0,
    retryOutput: 0,
    contextTokens: 0,
    tokens: 0,
    credits: 0,
    usd: 0,
  };
}

function addInto(total, side) {
  for (const key of TOTAL_KEYS) total[key] += side[key] || 0;
  return total;
}

function parseEffectiveness(raw, label) {
  if (raw == null) return null;
  const value = asObject(raw, label);
  const choice = (name) => {
    const picked = value[name] ?? "unknown";
    if (!["yes", "no", "unknown"].includes(picked)) {
      fail(`${label}.${name} must be "yes", "no", or "unknown"`);
    }
    return picked;
  };
  let interactions = 0;
  if (value.correctiveInteractions != null) {
    interactions = asNonNegativeInt(value.correctiveInteractions, `${label}.correctiveInteractions`);
  }
  return {
    completedCorrectly: choice("completedCorrectly"),
    correctiveInteractions: interactions,
    acceptanceCriteriaMet: choice("acceptanceCriteriaMet"),
    necessaryChecksRetained: choice("necessaryChecksRetained"),
    notes: typeof value.notes === "string" ? value.notes : "",
  };
}

function parseRetries(raw, label) {
  if (raw == null) return [];
  if (!Array.isArray(raw)) fail(`${label} must be an array`);
  return raw.map((entry, index) => {
    const retry = asObject(entry, `${label}[${index}]`);
    return {
      reason: typeof retry.reason === "string" ? retry.reason : "",
      inputTokens: asNonNegativeInt(retry.inputTokens ?? 0, `${label}[${index}].inputTokens`),
      outputTokens: asNonNegativeInt(retry.outputTokens ?? 0, `${label}[${index}].outputTokens`),
      illustrative: Boolean(retry.illustrative),
    };
  });
}

function parseObserved(raw, label) {
  if (raw == null) return null;
  const value = asObject(raw, label);
  return {
    inputTokens: asNonNegativeInt(value.inputTokens, `${label}.inputTokens`),
    cachedInputTokens: asNonNegativeInt(value.cachedInputTokens, `${label}.cachedInputTokens`),
    cacheWriteTokens: asNonNegativeInt(value.cacheWriteTokens, `${label}.cacheWriteTokens`),
    outputTokens: asNonNegativeInt(value.outputTokens, `${label}.outputTokens`),
    source: typeof value.source === "string" ? value.source : "",
  };
}

export function readWorkflow(workflowFile) {
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(workflowFile, "utf8"));
  } catch (error) {
    fail(`cannot parse ${workflowFile}: ${error.message}`);
  }
  const data = asObject(parsed, "root");
  if (typeof data.feature !== "string" || data.feature.trim() === "") {
    fail("feature must be a non-empty string");
  }
  if (typeof data.model !== "string" || data.model.trim() === "") {
    fail("model must be a model id");
  }
  if (!Array.isArray(data.stages) || data.stages.length === 0) {
    fail("stages must be a non-empty array");
  }
  const ids = new Set();
  const stages = data.stages.map((raw, index) => {
    const stage = asObject(raw, `stages[${index}]`);
    if (typeof stage.id !== "string" || stage.id.trim() === "") fail(`stages[${index}].id is required`);
    if (ids.has(stage.id)) fail(`duplicate stage id "${stage.id}"`);
    ids.add(stage.id);
    if (typeof stage.name !== "string" || stage.name.trim() === "") {
      fail(`stage "${stage.id}" needs a name`);
    }
    if (!Array.isArray(stage.files)) fail(`stage "${stage.id}" files must be an array`);
    const files = stage.files.map((entry, fileIndex) => {
      const item = typeof entry === "string" ? { path: entry } : asObject(entry, `stage "${stage.id}" files[${fileIndex}]`);
      const cache = item.cache ?? "fresh";
      if (cache !== "stable" && cache !== "fresh") {
        fail(`stage "${stage.id}" file cache must be "stable" or "fresh"`);
      }
      const role = item.role ?? "unspecified";
      return { path: item.path, role, cache };
    });
    let outputTokens = null;
    if (stage.outputTokens != null) outputTokens = asNonNegativeInt(stage.outputTokens, `stage "${stage.id}" outputTokens`);
    if (stage.outputFile != null && outputTokens != null) {
      fail(`stage "${stage.id}" sets both outputFile and outputTokens`);
    }
    const outputKind = stage.outputKind ?? (stage.outputFile ? "file" : outputTokens != null ? "entered" : null);
    if (outputKind != null && !["file", "entered", "example-reply"].includes(outputKind)) {
      fail(`stage "${stage.id}" outputKind must be "file", "entered", or "example-reply"`);
    }
    return {
      id: stage.id,
      name: stage.name,
      files,
      outputFile: stage.outputFile ?? null,
      outputTokens,
      outputKind,
      retries: parseRetries(stage.retries, `stage "${stage.id}" retries`),
      observed: parseObserved(stage.observed, `stage "${stage.id}" observed`),
      effectiveness: parseEffectiveness(stage.effectiveness, `stage "${stage.id}" effectiveness`),
    };
  });
  return {
    file: workflowFile,
    feature: data.feature.trim(),
    label: typeof data.label === "string" && data.label.trim() ? data.label.trim() : "Workflow",
    note: typeof data.note === "string" ? data.note : "",
    model: data.model.trim(),
    stages,
  };
}

function priceObserved(model, observed) {
  if (!observed) return null;
  const priced = priceTokens(model, {
    input: observed.inputTokens,
    cached: observed.cachedInputTokens,
    cacheWrite: observed.cacheWriteTokens,
    output: observed.outputTokens,
  });
  const tokens =
    observed.inputTokens +
    observed.cachedInputTokens +
    observed.cacheWriteTokens +
    observed.outputTokens;
  return {
    input: observed.inputTokens,
    cached: observed.cachedInputTokens,
    cacheWrite: observed.cacheWriteTokens,
    output: observed.outputTokens,
    tokens,
    credits: priced.credits,
    usd: priced.usd,
    tier: priced.tier,
    source: observed.source,
  };
}

export function analyseWorkflow(workflow, model) {
  const writesCache = model.tiers.some((tier) => tier.cacheWrite != null);
  const seen = new Set();
  const warnings = [];
  let illustrativeRetries = false;
  const stages = workflow.stages.map((stage) => {
    const stageWarnings = [];
    if (stage.files.length === 0) {
      stageWarnings.push(`${stage.name}: no context files listed.`);
    }
    const files = [];
    let input = 0;
    let cached = 0;
    let cacheWrite = 0;
    const seenInStage = new Set();
    for (const entry of stage.files) {
      if (!ROLES.has(entry.role)) {
        stageWarnings.push(
          `${stage.name}: role "${entry.role}" is not always-on, path-scoped, on-demand, prompt, or requirements. It was still counted.`,
        );
      }
      const loaded = readTextFile(workflow.file, entry.path, `stage "${stage.id}" file`);
      const key = `${loaded.relative}\0${contentHash(loaded.text)}`;
      if (seenInStage.has(key)) {
        stageWarnings.push(`${stage.name}: skipped duplicate ${loaded.relative}.`);
        continue;
      }
      seenInStage.add(key);
      const estimate = estimateText(loaded.text);
      let billing = "input";
      if (entry.cache === "stable" && seen.has(key)) {
        billing = "cached";
      } else if (entry.cache === "stable") {
        billing = writesCache ? "cache-write" : "input";
        seen.add(key);
      }
      if (billing === "cached") cached += estimate.tokens;
      else if (billing === "cache-write") cacheWrite += estimate.tokens;
      else input += estimate.tokens;
      files.push({
        path: loaded.relative,
        role: entry.role,
        cache: entry.cache,
        billing,
        tokens: estimate.tokens,
        chars: estimate.chars,
        words: estimate.words,
      });
    }

    let output = 0;
    let outputKind = stage.outputKind;
    if (stage.outputFile) {
      const loaded = readTextFile(workflow.file, stage.outputFile, `stage "${stage.id}" outputFile`);
      output = estimateText(loaded.text).tokens;
      if (!outputKind) outputKind = "file";
    } else if (stage.outputTokens != null) {
      output = stage.outputTokens;
      if (!outputKind) outputKind = "entered";
    } else {
      outputKind = null;
      stageWarnings.push(
        `${stage.name}: no output estimate. File-context tokens do not include the reply. Add outputFile, outputTokens, or an observed /usage row.`,
      );
    }

    const retries = stage.retries.map((retry) => {
      if (retry.illustrative) illustrativeRetries = true;
      const priced = priceTokens(model, { input: retry.inputTokens, output: retry.outputTokens });
      return { ...retry, credits: priced.credits, usd: priced.usd, tier: priced.tier };
    });
    const retryInput = retries.reduce((sum, retry) => sum + retry.inputTokens, 0);
    const retryOutput = retries.reduce((sum, retry) => sum + retry.outputTokens, 0);
    const request = priceTokens(model, { input, cached, cacheWrite, output });
    const credits = request.credits + retries.reduce((sum, retry) => sum + retry.credits, 0);
    const usd = request.usd + retries.reduce((sum, retry) => sum + retry.usd, 0);
    const contextTokens = input + cached + cacheWrite;
    const tokens = contextTokens + output + retryInput + retryOutput;
    warnings.push(...stageWarnings);
    return {
      id: stage.id,
      name: stage.name,
      files,
      retries,
      input,
      cached,
      cacheWrite,
      output,
      retryInput,
      retryOutput,
      contextTokens,
      tokens,
      credits,
      usd,
      tier: request.tier,
      outputKind,
      effectiveness: stage.effectiveness,
      observed: priceObserved(model, stage.observed),
    };
  });

  const totals = blankTotals();
  for (const stage of stages) addInto(totals, stage);
  return {
    kind: "workflow-analysis",
    feature: workflow.feature,
    label: workflow.label,
    note: workflow.note,
    model: { id: model.id, name: model.name, category: model.category },
    ratesAsOf: RATES_AS_OF,
    ratesSource: RATES_SOURCE,
    creditUsd: CREDIT_USD,
    estimate: "About 4 characters per token.",
    illustrativeRetries,
    stages,
    totals,
    warnings,
  };
}

export function analyseFile(workflowFile, modelOverride) {
  const workflow = readWorkflow(workflowFile);
  const model = modelById(modelOverride || workflow.model);
  return analyseWorkflow(workflow, model);
}

export function compareAnalyses(baseline, optimised) {
  if (baseline.model.id !== optimised.model.id) {
    fail(
      `both workflows must use the same model. Baseline is ${baseline.model.id}; the other is ${optimised.model.id}. Pass --model to price both the same way.`,
    );
  }
  const warnings = [...baseline.warnings, ...optimised.warnings];
  if (baseline.feature !== optimised.feature) {
    warnings.push("Feature names differ. Price the same feature on both sides.");
  }
  const order = [];
  for (const stage of baseline.stages) order.push(stage.id);
  for (const stage of optimised.stages) {
    if (!order.includes(stage.id)) order.push(stage.id);
  }
  const stages = order.map((id) => {
    const base = baseline.stages.find((stage) => stage.id === id) ?? null;
    const revised = optimised.stages.find((stage) => stage.id === id) ?? null;
    const name = (revised ?? base).name;
    if (!base || !revised) {
      warnings.push(`${name} is present on only one side, so it is left out of the totals.`);
      return {
        id,
        name,
        baseline: base,
        optimised: revised,
        gap: base ? "optimised" : "baseline",
        contextReductionPct: null,
        tokenReductionPct: null,
        creditReductionPct: null,
        quality: qualityOf(revised?.effectiveness ?? null),
      };
    }
    return {
      id,
      name,
      baseline: base,
      optimised: revised,
      gap: null,
      contextReductionPct: changePct(base.contextTokens, revised.contextTokens),
      tokenReductionPct: changePct(base.tokens, revised.tokens),
      creditReductionPct: changePct(base.credits, revised.credits),
      quality: qualityOf(revised.effectiveness),
    };
  });
  const paired = stages.filter((stage) => stage.gap == null);
  const baseTotals = blankTotals();
  const revisedTotals = blankTotals();
  for (const stage of paired) {
    addInto(baseTotals, stage.baseline);
    addInto(revisedTotals, stage.optimised);
  }
  return {
    kind: "workflow-comparison",
    feature: baseline.feature,
    labels: { baseline: baseline.label, optimised: optimised.label },
    notes: { baseline: baseline.note, optimised: optimised.note },
    model: baseline.model,
    ratesAsOf: RATES_AS_OF,
    ratesSource: RATES_SOURCE,
    creditUsd: CREDIT_USD,
    estimate: "About 4 characters per token.",
    illustrativeRetries: baseline.illustrativeRetries || optimised.illustrativeRetries,
    stages,
    totals: {
      baseline: baseTotals,
      optimised: revisedTotals,
      contextReductionPct: changePct(baseTotals.contextTokens, revisedTotals.contextTokens),
      tokenReductionPct: changePct(baseTotals.tokens, revisedTotals.tokens),
      creditReductionPct: changePct(baseTotals.credits, revisedTotals.credits),
    },
    warnings,
  };
}

export function compareFiles(baselineFile, optimisedFile, modelOverride) {
  return compareAnalyses(analyseFile(baselineFile, modelOverride), analyseFile(optimisedFile, modelOverride));
}

export function rejectedStages(report) {
  if (report.kind === "workflow-analysis") {
    return report.stages
      .map((stage) => ({ name: stage.name, quality: qualityOf(stage.effectiveness) }))
      .filter((stage) => stage.quality.status === "rejected");
  }
  return report.stages
    .filter((stage) => stage.gap == null && stage.quality.status === "rejected")
    .map((stage) => ({ name: stage.name, quality: stage.quality }));
}
