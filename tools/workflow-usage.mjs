#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { DECISION_QUESTIONS, analyseFile, compareFiles, qualityOf, rejectedStages } from "./lib/workflow.mjs";
import { MODELS } from "./lib/rates.mjs";

const BILLING_LABEL = {
  input: "input",
  cached: "cached",
  "cache-write": "cache write",
};

function parseArgs(argv) {
  const positional = [];
  const flags = { model: null, json: null, markdown: null, strict: false, jsonStdout: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--strict") flags.strict = true;
    else if (arg === "--model") flags.model = requiredValue(argv, (index += 1), "--model");
    else if (arg === "--json") {
      const next = argv[index + 1];
      if (!next || next.startsWith("--")) flags.jsonStdout = true;
      else flags.json = argv[(index += 1)];
    } else if (arg === "--markdown") flags.markdown = requiredValue(argv, (index += 1), "--markdown");
    else if (arg === "--help" || arg === "-h") flags.help = true;
    else if (arg.startsWith("--")) {
      throw new Error(`Unknown option ${arg}`);
    } else positional.push(arg);
  }
  return { positional, flags };
}

function requiredValue(argv, index, flag) {
  const value = argv[index];
  if (!value || value.startsWith("--")) throw new Error(`${flag} needs a value`);
  return value;
}

function formatInt(value) {
  return Math.round(value).toLocaleString("en-GB");
}

function formatCredits(value) {
  if (!value) return "0";
  if (Math.abs(value) < 0.01) return value.toFixed(4);
  return value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatChange(pct, noun) {
  if (pct == null || Number.isNaN(pct)) return "n/a";
  const magnitude = (Math.round(Math.abs(pct) * 10) / 10).toFixed(1);
  if (Math.abs(pct) < 0.05) return "No change";
  if (pct > 0) return noun ? `${magnitude}% fewer ${noun}` : `Potential reduction: ${magnitude}%`;
  return noun ? `${magnitude}% more ${noun}` : `Increase: ${magnitude}%`;
}

function pad(value, width) {
  return String(value).padStart(width);
}

function footerLines() {
  return [
    "Estimate only: about 4 characters per token.",
    "AI credits use GitHub's published per-token rates (1 credit = $0.01).",
    "Rates copied 2026-11-10 from https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing",
    "A stable file is billed as fresh input, or cache write, on its first stage. Later stages bill it as cached input.",
    "Copilot's own cache is prefix-based. Switching model, tools, or reasoning, or leaving a long pause, can invalidate it.",
    "Read real consumption in Copilot CLI with /context and /usage.",
    "Before each Copilot call:",
    ...DECISION_QUESTIONS.map((question, index) => `  ${index + 1}. ${question}`),
  ];
}

function fileRows(files) {
  const pathWidth = Math.max(4, ...files.map((file) => file.path.length));
  const roleWidth = Math.max(4, ...files.map((file) => file.role.length));
  return files.map((file) => {
    const billing = (BILLING_LABEL[file.billing] ?? file.billing).padEnd(11);
    return `  ${file.path.padEnd(pathWidth)}  ${file.role.padEnd(roleWidth)}  ${file.cache.padEnd(6)}  ${billing}  ${pad(formatInt(file.tokens), 8)}`;
  });
}

function stageMath(stage, labels = {}) {
  const contextLabel = labels.context ?? "Estimated file context";
  const tokenLabel = labels.tokens ?? "Stage tokens";
  const width = 24;
  return [
    `${contextLabel.padEnd(width)} ${pad(formatInt(stage.contextTokens), 10)}`,
    `${"fresh input".padEnd(width)} ${pad(formatInt(stage.input), 10)}`,
    `${"cache write".padEnd(width)} ${pad(formatInt(stage.cacheWrite), 10)}`,
    `${"cached input".padEnd(width)} ${pad(formatInt(stage.cached), 10)}`,
    `${"Estimated output".padEnd(width)} ${pad(formatInt(stage.output), 10)}${outputNote(stage)}`,
    `${"Recorded retries".padEnd(width)} ${pad(formatInt(stage.retryInput + stage.retryOutput), 10)}`,
    `${tokenLabel.padEnd(width)} ${pad(formatInt(stage.tokens), 10)}`,
    `${"Estimated AI credits".padEnd(width)} ${pad(formatCredits(stage.credits), 10)}  (${stage.tier})`,
  ];
}

function outputNote(stage) {
  if (stage.outputKind === "example-reply") return "   example reply, not a live Copilot response";
  if (stage.outputKind == null) return "   none recorded";
  return "";
}

function formatStage(stage) {
  const lines = [`STAGE: ${stage.name}`, "", "Files assessed:"];
  if (stage.files.length === 0) lines.push("  (none)");
  else lines.push(...fileRows(stage.files));
  lines.push("");
  lines.push(...stageMath(stage));
  if (stage.retries.length > 0) {
    lines.push("Retries:");
    for (const retry of stage.retries) {
      const tag = retry.illustrative ? "illustrative" : "recorded";
      lines.push(
        `  ${tag}: ${formatInt(retry.inputTokens)} input, ${formatInt(retry.outputTokens)} output. ${retry.reason}`.trimEnd(),
      );
    }
  }
  if (stage.observed) {
    lines.push(
      `Observed /usage: ${formatInt(stage.observed.tokens)} tokens, ${formatCredits(stage.observed.credits)} credits. ${stage.observed.source}`.trimEnd(),
    );
  }
  return lines;
}

function summaryTable(labels, baseline, optimised, pct) {
  const retryLabel = pct.retriesIllustrative ? "Retries (illustrative)" : "Retries";
  const rows = [
    ["File context", baseline.contextTokens, optimised.contextTokens, pct.context],
    ["Output", baseline.output, optimised.output, null],
    [retryLabel, baseline.retryInput + baseline.retryOutput, optimised.retryInput + optimised.retryOutput, null],
    ["Stage tokens", baseline.tokens, optimised.tokens, pct.tokens],
    ["AI credits", baseline.credits, optimised.credits, pct.credits],
  ];
  const left = labels.baseline;
  const right = labels.optimised;
  const nameWidth = Math.max(12, ...rows.map((row) => row[0].length));
  const widths = [left, right].map((label, index) =>
    Math.max(label.length, ...rows.map((row) => (index === 0 ? formatCell(row[1]) : formatCell(row[2])).length)),
  );
  const lines = [
    `${"".padEnd(nameWidth)}  ${left.padStart(widths[0])}  ${right.padStart(widths[1])}  Change`,
  ];
  for (const row of rows) {
    const change =
      row[0] === "AI credits"
        ? formatChange(row[3] ?? changeOf(row[1], row[2]), "credits")
        : formatChange(row[3] ?? changeOf(row[1], row[2]));
    lines.push(
      `${row[0].padEnd(nameWidth)}  ${pad(formatCell(row[1]), widths[0])}  ${pad(formatCell(row[2]), widths[1])}  ${change}`,
    );
  }
  return lines;
}

function formatCell(value) {
  return Number.isInteger(value) ? formatInt(value) : formatCredits(value);
}

function changeOf(baseline, revised) {
  if (!baseline) return null;
  return ((baseline - revised) / baseline) * 100;
}

function formatAnalysis(report) {
  const lines = [
    `FEATURE: ${report.feature}`,
    `WORKFLOW: ${report.label}`,
    `MODEL: ${report.model.name}`,
    "",
  ];
  if (report.note) lines.push(report.note, "");
  if (report.illustrativeRetries) {
    lines.push("Recorded retries marked illustrative are teaching figures, not /usage readings.", "");
  }
  for (const stage of report.stages) {
    lines.push(...formatStage(stage), "");
    lines.push(`Quality: ${qualityOf(stage.effectiveness).label}`, "");
  }
  lines.push(
    "ALL STAGES",
    `File context: ${formatInt(report.totals.contextTokens)}`,
    `Stage tokens: ${formatInt(report.totals.tokens)}`,
    `AI credits:   ${formatCredits(report.totals.credits)}`,
    "",
  );
  lines.push(...warningLines(report), ...footerLines());
  return lines.join("\n");
}

function formatComparison(report) {
  const lines = [
    `FEATURE: ${report.feature}`,
    `MODEL: ${report.model.name}`,
    `COMPARE: ${report.labels.baseline} -> ${report.labels.optimised}`,
    "",
  ];
  if (report.notes.baseline) lines.push(`${report.labels.baseline}: ${report.notes.baseline}`);
  if (report.notes.optimised) lines.push(`${report.labels.optimised}: ${report.notes.optimised}`);
  if (report.notes.baseline || report.notes.optimised) lines.push("");
  if (report.illustrativeRetries) {
    lines.push("This comparison includes illustrative retry counts. They are not /usage readings.", "");
  }
  for (const stage of report.stages) {
    lines.push(`STAGE: ${stage.name}`, "");
    if (stage.gap) {
      lines.push(`Present only on the ${stage.gap === "optimised" ? report.labels.baseline : report.labels.optimised} side. Left out of the totals.`, "");
      continue;
    }
    lines.push(`${report.labels.optimised} files assessed:`);
    lines.push(...(stage.optimised.files.length ? fileRows(stage.optimised.files) : ["  (none)"]));
    lines.push("");
    lines.push(...stageMath(stage.optimised, { context: "Revised file context", tokens: "Revised stage tokens" }));
    lines.push("");
    lines.push(`Baseline file context: ${pad(formatInt(stage.baseline.contextTokens), 10)}`);
    lines.push(`Revised file context:  ${pad(formatInt(stage.optimised.contextTokens), 10)}`);
    lines.push(formatChange(stage.contextReductionPct));
    lines.push(`Baseline stage tokens: ${pad(formatInt(stage.baseline.tokens), 10)}`);
    lines.push(`Revised stage tokens:  ${pad(formatInt(stage.optimised.tokens), 10)}`);
    lines.push(formatChange(stage.tokenReductionPct));
    lines.push(`Quality: ${stage.quality.label}`, "");
  }
  lines.push("ALL STAGES", "");
  lines.push(
    ...summaryTable(report.labels, report.totals.baseline, report.totals.optimised, {
      context: report.totals.contextReductionPct,
      tokens: report.totals.tokenReductionPct,
      credits: report.totals.creditReductionPct,
      retriesIllustrative: report.illustrativeRetries,
    }),
    "",
  );
  const counts = countQuality(report);
  lines.push(
    `Quality: ${counts.accepted} met, ${counts.evidenced} awaiting evidence, ${counts.rejected} rejected, ${counts.blank} not recorded.`,
    "",
  );
  const observed = report.stages.some((stage) => stage.baseline?.observed || stage.optimised?.observed);
  if (!observed) {
    lines.push("Observed usage: not recorded. Add an observed block from /usage when you have one.", "");
  }
  lines.push(...warningLines(report), ...footerLines());
  return lines.join("\n");
}

function countQuality(report) {
  const counts = { accepted: 0, evidenced: 0, rejected: 0, blank: 0 };
  for (const stage of report.stages) {
    if (stage.gap) continue;
    if (stage.quality.status === "accepted") counts.accepted += 1;
    else if (stage.quality.status === "rejected") counts.rejected += 1;
    else if (stage.quality.status === "not-evidenced") counts.evidenced += 1;
    else counts.blank += 1;
  }
  return counts;
}

function warningLines(report) {
  if (report.warnings.length === 0) return [];
  return ["Notes:", ...report.warnings.map((warning) => `  - ${warning}`), ""];
}

function qualityLabelFromEffectiveness(effectiveness) {
  if (!effectiveness) return "not recorded";
  return `completed ${effectiveness.completedCorrectly}; criteria ${effectiveness.acceptanceCriteriaMet}; checks ${effectiveness.necessaryChecksRetained}; corrective interactions ${effectiveness.correctiveInteractions}; ${effectiveness.notes}`.trim();
}

function markdownTable(headers, rows) {
  const head = `| ${headers.join(" | ")} |`;
  const rule = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.map((cell) => String(cell).replace(/\|/g, "\\|").replace(/\n/g, " ")).join(" | ")} |`);
  return [head, rule, ...body].join("\n");
}

function toMarkdown(report) {
  if (report.kind === "workflow-comparison") return comparisonMarkdown(report);
  const rows = report.stages.map((stage) => [
    stage.name,
    formatInt(stage.contextTokens),
    formatInt(stage.output),
    formatInt(stage.tokens),
    formatCredits(stage.credits),
    qualityLabelFromEffectiveness(stage.effectiveness),
  ]);
  return [
    "# Token efficiency scorecard",
    "",
    `Feature: ${report.feature}`,
    `Workflow: ${report.label}`,
    `Model: ${report.model.name}`,
    "",
    markdownTable(["Stage", "File context", "Output", "Stage tokens", "AI credits", "Quality"], rows),
    "",
    `Stage tokens: ${formatInt(report.totals.tokens)}`,
    `AI credits: ${formatCredits(report.totals.credits)}`,
    "",
    ...footerLines(),
    "",
  ].join("\n");
}

function comparisonMarkdown(report) {
  const rows = report.stages
    .filter((stage) => stage.gap == null)
    .map((stage) => [
      stage.name,
      formatInt(stage.baseline.tokens),
      formatInt(stage.optimised.tokens),
      formatChange(stage.tokenReductionPct),
      formatCredits(stage.baseline.credits),
      formatCredits(stage.optimised.credits),
      stage.quality.label,
    ]);
  return [
    "# Token efficiency scorecard",
    "",
    `Feature: ${report.feature}`,
    `Model: ${report.model.name}`,
    "",
    markdownTable(
      ["Stage", `${report.labels.baseline} tokens`, `${report.labels.optimised} tokens`, "Token change", `${report.labels.baseline} credits`, `${report.labels.optimised} credits`, "Quality"],
      rows,
    ),
    "",
    `Token change: ${formatChange(report.totals.tokenReductionPct)}`,
    `Credit change: ${formatChange(report.totals.creditReductionPct, "credits")}`,
    "",
    ...footerLines(),
    "",
  ].join("\n");
}

function help() {
  return `Usage:
  node tools/workflow-usage.mjs <workflow.json> [--model id] [--json file|-] [--markdown file] [--strict]
  node tools/workflow-usage.mjs compare <baseline.json> <revised.json> [--model id] [--json file] [--markdown file] [--strict]
  node tools/workflow-usage.mjs models

--json with no file writes JSON to stdout.
--strict exits 1 when a stage removes necessary checks, misses acceptance criteria, or was not completed correctly.
Open scorecard/index.html to edit the delegate scorecard and import a JSON report.`;
}

function printModels() {
  for (const model of MODELS) {
    const prices = model.tiers
      .map((tier) => {
        const write = tier.cacheWrite == null ? "n/a" : `$${tier.cacheWrite}`;
        const band = tier.above == null ? tier.name : `${tier.name} > ${formatInt(tier.above)}`;
        return `${band}: in $${tier.input} / cached $${tier.cached} / write ${write} / out $${tier.output}`;
      })
      .join("; ");
    console.log(`${model.id.padEnd(22)} ${model.name.padEnd(22)} ${prices}${model.note ? ` (${model.note})` : ""}`);
  }
  console.log("");
  console.log("Prices are USD per 1 million tokens. 1 AI credit = $0.01.");
}

function writeJson(report, flags) {
  const json = `${JSON.stringify(report, null, 2)}\n`;
  if (flags.jsonStdout) {
    process.stdout.write(json);
    return;
  }
  if (flags.json) {
    writeFileSync(flags.json, json);
    console.log(`Wrote ${flags.json}`);
  }
}

function main() {
  let parsed;
  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
  const { positional, flags } = parsed;
  if (flags.help || positional.length === 0) {
    console.log(help());
    process.exit(flags.help ? 0 : 1);
  }
  if (positional[0] === "models") {
    printModels();
    return;
  }
  let report;
  try {
    if (positional[0] === "compare") {
      if (positional.length !== 3) throw new Error("compare needs two workflow files");
      report = compareFiles(positional[1], positional[2], flags.model);
    } else if (positional.length === 1) {
      report = analyseFile(positional[0], flags.model);
    } else {
      throw new Error("Pass one workflow file, or compare <baseline> <revised>.");
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
  if (!flags.jsonStdout) {
    const text = report.kind === "workflow-comparison" ? formatComparison(report) : formatAnalysis(report);
    console.log(text);
  }
  writeJson(report, flags);
  if (flags.markdown) writeFileSync(flags.markdown, toMarkdown(report));
  const rejected = rejectedStages(report);
  if (flags.strict && rejected.length > 0) process.exitCode = 1;
}

main();
