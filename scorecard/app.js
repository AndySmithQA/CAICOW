const ILLUSTRATIVE = [
  { id: "planning", name: "Planning", baseline: 18000, optimised: 9000 },
  { id: "skill-refinement", name: "Skill refinement", baseline: 12000, optimised: 9000 },
  { id: "implementation", name: "Implementation", baseline: 52000, optimised: 34000 },
  { id: "testing-review", name: "Testing and review", baseline: 34000, optimised: 22000 },
  { id: "release", name: "Release", baseline: 14000, optimised: 10000 },
];

const PART_FIELDS = ["input", "cached", "cacheWrite", "output", "retryInput", "retryOutput"];
const OBSERVED_FIELDS = [
  ["input", "Input"],
  ["cached", "Cached input"],
  ["cacheWrite", "Cache write"],
  ["output", "Output"],
];

let state = createState();

function createState() {
  return {
    delegate: "",
    feature: "SR-142: Add request priority management",
    modelId: "gpt-5.3-codex",
    source: "illustrative",
    illustrativeRetries: false,
    modelWarning: "",
    labels: { baseline: "Baseline", optimised: "Optimised" },
    stages: ILLUSTRATIVE.map((stage) => ({
      id: stage.id,
      name: stage.name,
      baseline: partsFromTotal(stage.baseline),
      optimised: partsFromTotal(stage.optimised),
      observedBaseline: blankObserved(),
      observedOptimised: blankObserved(),
      effectiveness: blankEffect(),
      files: { baseline: [], optimised: [] },
    })),
  };
}

function partsFromTotal(total) {
  return { input: total, cached: 0, cacheWrite: 0, output: 0, retryInput: 0, retryOutput: 0, split: false };
}

function partsFromSide(side) {
  return {
    input: side.input || 0,
    cached: side.cached || 0,
    cacheWrite: side.cacheWrite || 0,
    output: side.output || 0,
    retryInput: side.retryInput || 0,
    retryOutput: side.retryOutput || 0,
    split: true,
  };
}

function blankObserved() {
  return { input: "", cached: "", cacheWrite: "", output: "" };
}

function blankEffect() {
  return { completed: "", criteria: "", checks: "", interactions: "", notes: "" };
}

function observedFromSide(observed) {
  if (!observed) return blankObserved();
  return {
    input: String(observed.input),
    cached: String(observed.cached),
    cacheWrite: String(observed.cacheWrite),
    output: String(observed.output),
  };
}

function effectFromSide(effect) {
  if (!effect) return blankEffect();
  const known = (value) => (value === "yes" || value === "no" ? value : "");
  return {
    completed: known(effect.completedCorrectly),
    criteria: known(effect.acceptanceCriteriaMet),
    checks: known(effect.necessaryChecksRetained),
    interactions: effect.correctiveInteractions ? String(effect.correctiveInteractions) : "",
    notes: effect.notes || "",
  };
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null) continue;
    if (key === "text") node.textContent = value;
    else if (key === "className") node.className = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) node.append(child);
  return node;
}

function formatInt(value) {
  return Math.round(value).toLocaleString("en-GB");
}

function formatCredits(value) {
  if (!value) return "0";
  if (Math.abs(value) < 0.01) return value.toFixed(4);
  return value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPct(baseline, revised) {
  if (!baseline) return "n/a";
  const pct = ((baseline - revised) / baseline) * 100;
  if (Math.abs(pct) < 0.05) return "No change";
  const magnitude = (Math.round(Math.abs(pct) * 10) / 10).toFixed(1);
  return pct > 0 ? `${magnitude}% fewer` : `${magnitude}% more`;
}

function pctClass(baseline, revised) {
  if (!baseline || Math.abs(baseline - revised) < 0.0001) return "";
  return revised < baseline ? "fewer" : "more";
}

function num(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function partsTotal(parts) {
  return PART_FIELDS.reduce((sum, field) => sum + num(parts[field]), 0);
}

function currentModel() {
  return LabPricing.modelById(state.modelId) || LabPricing.bundle.models[0];
}

function numberInput(stageId, bucket, field, value, readOnly) {
  const input = el("input", { type: "number", min: "0", step: "1", inputmode: "numeric" });
  input.dataset.stage = stageId;
  input.dataset.bucket = bucket;
  input.dataset.field = field;
  input.value = value === "" || value == null ? "" : String(value);
  input.readOnly = Boolean(readOnly);
  return input;
}

function render() {
  document.querySelector("#delegate").value = state.delegate;
  document.querySelector("#feature").value = state.feature;
  const select = document.querySelector("#model");
  select.replaceChildren();
  for (const model of LabPricing.bundle.models) {
    const option = el("option", { value: model.id, text: model.name });
    if (model.note) option.textContent = `${model.name} (${model.note})`;
    select.append(option);
  }
  select.value = currentModel().id;
  document.querySelector("#rates-as-of").textContent = LabPricing.bundle.asOf;
  renderPredicted();
  renderObserved();
  renderEffectiveness();
  updateCalculated();
}

function renderPredicted() {
  const body = document.querySelector("#predicted-body");
  body.replaceChildren();
  for (const stage of state.stages) {
    body.append(predictedRow(stage));
    body.append(splitRow(stage));
  }
}

function predictedRow(stage) {
  const row = el("tr");
  row.append(el("th", { scope: "row", text: stage.name }));
  row.append(totalCell(stage, "baseline", state.labels.baseline));
  row.append(totalCell(stage, "optimised", state.labels.optimised));
  const change = el("td", { "data-label": "Change" });
  change.append(el("strong", { "data-change": stage.id, text: "" }));
  row.append(change);
  return row;
}

function totalCell(stage, bucket, label) {
  const cell = el("td", { "data-label": label });
  cell.append(numberInput(stage.id, bucket, "total", partsTotal(stage[bucket]), stage[bucket].split));
  return cell;
}

function splitRow(stage) {
  const row = el("tr", { className: "split" });
  const cell = el("td", { colspan: "4", "data-label": "Categories" });
  const details = el("details");
  details.append(el("summary", { text: "Token categories and files" }));
  details.append(el("p", { className: "hint", text: "Fresh input, cached input, cache write, output, and recorded retries. The stage total is their sum." }));
  const grid = el("div", { className: "buckets" });
  for (const bucket of ["baseline", "optimised"]) {
    const title = bucket === "baseline" ? state.labels.baseline : state.labels.optimised;
    const group = el("div");
    group.append(el("strong", { text: title }));
    const fields = el("div", { className: "buckets" });
    for (const [field, label] of [
      ["input", "Fresh input"],
      ["cached", "Cached input"],
      ["cacheWrite", "Cache write"],
      ["output", "Output"],
      ["retryInput", "Retry input"],
      ["retryOutput", "Retry output"],
    ]) {
      const wrap = el("label", { text: label });
      wrap.append(numberInput(stage.id, bucket, field, stage[bucket][field], false));
      fields.append(wrap);
    }
    const collapse = el("button", { type: "button", className: "secondary", text: "Count as one total" });
    collapse.dataset.action = "collapse";
    collapse.dataset.stage = stage.id;
    collapse.dataset.bucket = bucket;
    group.append(fields, collapse);
    grid.append(group);
  }
  details.append(grid);
  if (stage.files.baseline.length || stage.files.optimised.length) {
    details.append(el("h3", { text: "Files assessed" }));
    details.append(fileList(state.labels.baseline, stage.files.baseline));
    details.append(fileList(state.labels.optimised, stage.files.optimised));
  }
  cell.append(details);
  row.append(cell);
  return row;
}

function fileList(title, files) {
  const block = el("div");
  block.append(el("strong", { text: title }));
  if (!files.length) {
    block.append(el("p", { className: "hint", text: "No files on this side." }));
    return block;
  }
  const list = el("ul", { className: "files" });
  for (const file of files) {
    list.append(el("li", { text: `${file.path} · ${file.role} · ${file.billing} · ${formatInt(file.tokens)}` }));
  }
  block.append(list);
  return block;
}

function renderObserved() {
  const root = document.querySelector("#observed");
  root.replaceChildren();
  for (const stage of state.stages) {
    const card = el("article", { className: "card" });
    card.append(el("h3", { text: stage.name }));
    card.append(observedRow(stage, "observedBaseline", state.labels.baseline));
    card.append(observedRow(stage, "observedOptimised", state.labels.optimised));
    root.append(card);
  }
}

function observedRow(stage, bucket, label) {
  const wrap = el("div");
  wrap.append(el("strong", { text: label }));
  const grid = el("div", { className: "observed-grid" });
  for (const [field, name] of OBSERVED_FIELDS) {
    const fieldLabel = el("label", { text: name });
    fieldLabel.append(numberInput(stage.id, bucket, field, stage[bucket][field], false));
    grid.append(fieldLabel);
  }
  wrap.append(grid);
  return wrap;
}

function renderEffectiveness() {
  const root = document.querySelector("#effectiveness");
  root.replaceChildren();
  for (const stage of state.stages) {
    const card = el("article", { className: "card" });
    card.append(el("h3", { text: stage.name }));
    const grid = el("div", { className: "effect-grid" });
    grid.append(choice(stage, "completed", "Completed correctly"));
    grid.append(choice(stage, "criteria", "Acceptance criteria met"));
    grid.append(choice(stage, "checks", "Necessary checks retained"));
    const interactions = el("label", { text: "Corrective interactions" });
    interactions.append(numberInput(stage.id, "effect", "interactions", stage.effectiveness.interactions, false));
    grid.append(interactions);
    card.append(grid);
    const notes = el("label", { text: "Notes" });
    const area = el("textarea");
    area.dataset.stage = stage.id;
    area.dataset.bucket = "effect";
    area.dataset.field = "notes";
    area.value = stage.effectiveness.notes;
    notes.append(area);
    card.append(notes);
    root.append(card);
  }
}

function choice(stage, field, label) {
  const wrap = el("label", { text: label });
  const select = el("select");
  select.dataset.stage = stage.id;
  select.dataset.bucket = "effect";
  select.dataset.field = field;
  for (const [value, text] of [
    ["", "Not recorded"],
    ["yes", "Yes"],
    ["no", "No"],
  ]) {
    const option = el("option", { value, text });
    select.append(option);
  }
  select.value = stage.effectiveness[field];
  wrap.append(select);
  return wrap;
}

function updateCalculated() {
  const model = currentModel();
  let baselineTokens = 0;
  let optimisedTokens = 0;
  let baselineCredits = 0;
  let optimisedCredits = 0;
  let treatedAsFresh = true;
  for (const stage of state.stages) {
    const base = partsTotal(stage.baseline);
    const revised = partsTotal(stage.optimised);
    baselineTokens += base;
    optimisedTokens += revised;
    baselineCredits += LabPricing.sideCredits(model, stage.baseline).credits;
    optimisedCredits += LabPricing.sideCredits(model, stage.optimised).credits;
    if (stage.baseline.split || stage.optimised.split) treatedAsFresh = false;
    const change = document.querySelector(`[data-change="${CSS.escape(stage.id)}"]`);
    if (change) {
      change.textContent = formatPct(base, revised);
      change.className = pctClass(base, revised);
    }
  }
  text("#baseline-token-label", `${state.labels.baseline} tokens`);
  text("#optimised-token-label", `${state.labels.optimised} tokens`);
  text("#baseline-credit-label", `${state.labels.baseline} credits`);
  text("#optimised-credit-label", `${state.labels.optimised} credits`);
  text("#col-baseline", state.labels.baseline);
  text("#col-optimised", state.labels.optimised);
  text("#baseline-tokens", formatInt(baselineTokens));
  text("#optimised-tokens", formatInt(optimisedTokens));
  const tokenChange = document.querySelector("#token-change");
  tokenChange.textContent = formatPct(baselineTokens, optimisedTokens);
  tokenChange.className = pctClass(baselineTokens, optimisedTokens);
  text("#baseline-credits", formatCredits(baselineCredits));
  text("#optimised-credits", formatCredits(optimisedCredits));
  const creditChange = document.querySelector("#credit-change");
  creditChange.textContent = formatPct(baselineCredits, optimisedCredits);
  creditChange.className = pctClass(baselineCredits, optimisedCredits);

  const creditNote = document.querySelector("#credit-note");
  const modelNote = model.note ? ` ${model.note}` : "";
  creditNote.textContent = treatedAsFresh
    ? `Every token is currently counted as fresh input on ${model.name}.${modelNote} Split a stage, or import a workflow report, to separate cached input and output. Output costs more than input, and cached input costs less.`
    : `Credits use ${model.name} and the published per-token rates.${modelNote} ${state.modelWarning}`;

  const source = document.querySelector("#source-note");
  if (state.source === "illustrative") {
    source.textContent = "Illustrative course-design figures: 130,000 baseline tokens and 84,000 optimised tokens. Replace them with a workflow report or with your own readings.";
  } else if (state.source === "report") {
    source.textContent = state.illustrativeRetries
      ? "Imported from a workflow report. Retry rows marked illustrative in that report are teaching figures, not /usage readings."
      : "Imported from a workflow report.";
  } else {
    source.textContent = "These figures include edits made on this sheet.";
  }

  const failed = state.stages.some((stage) =>
    ["completed", "criteria", "checks"].some((field) => stage.effectiveness[field] === "no"),
  );
  const warning = document.querySelector("#quality-warning");
  warning.hidden = !failed;
  warning.textContent = failed
    ? "A reduction is not a result to keep while a stage removes necessary tests or security checks, misses the acceptance criteria, or does not complete the task."
    : "";
  const heavyRetries = state.stages.some((stage) => num(stage.effectiveness.interactions) >= 3);
  const retry = document.querySelector("#retry-note");
  retry.hidden = !heavyRetries;
  retry.textContent = heavyRetries
    ? "A stage has three or more corrective interactions. Add the /usage cost of those follow-up calls before you treat the estimate as a saving."
    : "";
  updateObservedSummary(model);
}

function updateObservedSummary(model) {
  const bits = [];
  for (const [bucket, label] of [
    ["observedBaseline", state.labels.baseline],
    ["observedOptimised", state.labels.optimised],
  ]) {
    let tokens = 0;
    let credits = 0;
    let complete = 0;
    let partial = 0;
    for (const stage of state.stages) {
      const parsed = completeObserved(stage[bucket]);
      if (parsed === "partial") partial += 1;
      if (!parsed || parsed === "partial") continue;
      complete += 1;
      tokens += parsed.input + parsed.cached + parsed.cacheWrite + parsed.output;
      credits += LabPricing.priceTokens(model, parsed).credits;
    }
    if (complete || partial) {
      bits.push(
        `${label}: ${formatInt(tokens)} tokens, ${formatCredits(credits)} credits, from ${complete} of ${state.stages.length} complete stages` +
          (partial ? ` (${partial} still incomplete)` : "") +
          ".",
      );
    }
  }
  document.querySelector("#observed-summary").textContent = bits.join(" ") || "No observed usage recorded yet.";
}

function completeObserved(fields) {
  const values = OBSERVED_FIELDS.map(([field]) => fields[field]);
  if (values.every((value) => value === "")) return null;
  if (values.some((value) => value === "")) return "partial";
  return {
    input: num(fields.input),
    cached: num(fields.cached),
    cacheWrite: num(fields.cacheWrite),
    output: num(fields.output),
  };
}

function text(selector, value) {
  document.querySelector(selector).textContent = value;
}

function stageById(id) {
  return state.stages.find((stage) => stage.id === id);
}

function onField(target) {
  const stage = stageById(target.dataset.stage);
  if (!stage) return;
  const { bucket, field } = target.dataset;
  if (bucket === "effect") {
    stage.effectiveness[field] = target.value;
    if (state.source === "illustrative") state.source = "edited";
    return;
  }
  if (bucket === "observedBaseline" || bucket === "observedOptimised") {
    stage[bucket][field] = target.value;
    return;
  }
  const parts = stage[bucket];
  if (field === "total") {
    const total = num(target.value);
    parts.input = total;
    parts.cached = 0;
    parts.cacheWrite = 0;
    parts.output = 0;
    parts.retryInput = 0;
    parts.retryOutput = 0;
    parts.split = false;
    state.source = "edited";
    syncBucket(stage, bucket);
    return;
  }
  parts[field] = num(target.value);
  parts.split = true;
  state.source = "edited";
  const totalInput = document.querySelector(
    `[data-stage="${CSS.escape(stage.id)}"][data-bucket="${bucket}"][data-field="total"]`,
  );
  if (totalInput) {
    totalInput.value = String(partsTotal(parts));
    totalInput.readOnly = true;
  }
}

function syncBucket(stage, bucket) {
  const parts = stage[bucket];
  for (const field of PART_FIELDS) {
    const input = document.querySelector(
      `[data-stage="${CSS.escape(stage.id)}"][data-bucket="${bucket}"][data-field="${field}"]`,
    );
    if (input) input.value = String(parts[field]);
  }
  const totalInput = document.querySelector(
    `[data-stage="${CSS.escape(stage.id)}"][data-bucket="${bucket}"][data-field="total"]`,
  );
  if (totalInput) {
    totalInput.value = String(partsTotal(parts));
    totalInput.readOnly = parts.split;
  }
}

function collapse(stageId, bucket) {
  const stage = stageById(stageId);
  const parts = stage[bucket];
  const total = partsTotal(parts);
  parts.input = total;
  parts.cached = 0;
  parts.cacheWrite = 0;
  parts.output = 0;
  parts.retryInput = 0;
  parts.retryOutput = 0;
  parts.split = false;
  state.source = "edited";
  syncBucket(stage, bucket);
  updateCalculated();
}

function csvCell(value) {
  const textValue = String(value ?? "");
  return /[",\n]/.test(textValue) ? `"${textValue.replaceAll('"', '""')}"` : textValue;
}

function resultsCsv() {
  const header = [
    "Stage",
    `${state.labels.baseline} tokens`,
    `${state.labels.optimised} tokens`,
    "Token change",
    `${state.labels.baseline} credits`,
    `${state.labels.optimised} credits`,
    "Completed",
    "Acceptance criteria",
    "Necessary checks",
    "Corrective interactions",
    "Notes",
  ];
  const model = currentModel();
  const rows = state.stages.map((stage) => {
    const base = partsTotal(stage.baseline);
    const revised = partsTotal(stage.optimised);
    return [
      stage.name,
      base,
      revised,
      formatPct(base, revised),
      formatCredits(LabPricing.sideCredits(model, stage.baseline).credits),
      formatCredits(LabPricing.sideCredits(model, stage.optimised).credits),
      stage.effectiveness.completed,
      stage.effectiveness.criteria,
      stage.effectiveness.checks,
      stage.effectiveness.interactions,
      stage.effectiveness.notes,
    ];
  });
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

function resultsMarkdown() {
  const model = currentModel();
  const lines = [
    "# Token efficiency scorecard",
    "",
    `Delegate: ${state.delegate}`,
    `Feature: ${state.feature}`,
    `Model: ${model.name}`,
    "",
    `| Stage | ${state.labels.baseline} tokens | ${state.labels.optimised} tokens | Change |`,
    "| --- | --- | --- | --- |",
  ];
  for (const stage of state.stages) {
    const base = partsTotal(stage.baseline);
    const revised = partsTotal(stage.optimised);
    lines.push(`| ${stage.name} | ${formatInt(base)} | ${formatInt(revised)} | ${formatPct(base, revised)} |`);
  }
  lines.push("", document.querySelector("#source-note").textContent, "");
  return lines.join("\n");
}

async function copyCsv() {
  const textValue = resultsCsv();
  document.querySelector("#csv-output").value = textValue;
  try {
    await navigator.clipboard.writeText(textValue);
    document.querySelector("#copy-status").textContent = "Copied the CSV. It is also in the box below.";
  } catch {
    document.querySelector("#copy-status").textContent = "The CSV is in the box below.";
  }
}

function downloadMarkdown() {
  const blob = new Blob([resultsMarkdown()], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = el("a", { href: url, download: "token-scorecard.md" });
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function applyReport(report) {
  if (!report || report.kind !== "workflow-comparison" || !Array.isArray(report.stages)) {
    throw new Error("Choose a report from workflow-usage.mjs compare ... --json report.json");
  }
  const paired = report.stages.filter((stage) => !stage.gap);
  if (paired.length === 0) throw new Error("The report has no paired stages.");
  state.feature = report.feature || state.feature;
  state.labels = report.labels || { baseline: "Baseline", optimised: "Optimised" };
  state.illustrativeRetries = Boolean(report.illustrativeRetries);
  state.source = "report";
  const known = LabPricing.modelById(report.model?.id);
  state.modelWarning = known ? "" : ` ${report.model?.id || "The report model"} is not in this scorecard. Credits use ${LabPricing.bundle.models[0].name}.`;
  state.modelId = known ? known.id : LabPricing.bundle.models[0].id;
  state.stages = paired.map((stage) => ({
    id: stage.id,
    name: stage.name,
    baseline: partsFromSide(stage.baseline),
    optimised: partsFromSide(stage.optimised),
    observedBaseline: observedFromSide(stage.baseline.observed),
    observedOptimised: observedFromSide(stage.optimised.observed),
    effectiveness: effectFromSide(stage.optimised.effectiveness),
    files: {
      baseline: stage.baseline.files || [],
      optimised: stage.optimised.files || [],
    },
  }));
  document.querySelector("#import-error").hidden = true;
  render();
}

function showImportError(message) {
  const node = document.querySelector("#import-error");
  node.hidden = false;
  node.textContent = message;
}

document.body.addEventListener("input", (event) => {
  const target = event.target;
  if (target.id === "delegate") {
    state.delegate = target.value;
    return;
  }
  if (target.id === "feature") {
    state.feature = target.value;
    return;
  }
  if (target.dataset.stage) {
    onField(target);
    updateCalculated();
  }
});

document.body.addEventListener("change", (event) => {
  const target = event.target;
  if (target.id === "model") {
    state.modelId = target.value;
    state.modelWarning = "";
    updateCalculated();
    return;
  }
  if (target.dataset.bucket === "effect") {
    onField(target);
    updateCalculated();
  }
});

document.body.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action='collapse']");
  if (button) collapse(button.dataset.stage, button.dataset.bucket);
});

document.querySelector("#copy-csv").addEventListener("click", () => {
  copyCsv();
});

document.querySelector("#download-md").addEventListener("click", downloadMarkdown);

document.querySelector("#reset").addEventListener("click", () => {
  const delegate = state.delegate;
  state = createState();
  state.delegate = delegate;
  document.querySelector("#import-error").hidden = true;
  render();
});

document.querySelector("#import-file").addEventListener("change", async (event) => {
  const file = event.target.files && event.target.files[0];
  event.target.value = "";
  if (!file) return;
  try {
    applyReport(JSON.parse(await file.text()));
  } catch (error) {
    showImportError(error.message);
  }
});

window.scorecard = { applyReport, resultsCsv, getState: () => state };

render();
