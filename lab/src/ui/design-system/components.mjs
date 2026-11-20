import { colours, font, space, tones } from "./tokens.mjs";

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function badge({ label, tone }) {
  if (!(tone in tones)) throw new Error(`Unknown tone ${tone}. Use one of ${Object.keys(tones).join(", ")}.`);
  return `<span class="badge badge--${tone}">${escapeHtml(label)}</span>`;
}

export function select({ name, label, options, value, error }) {
  const choices = options
    .map((option) => {
      const selected = option.value === (value ?? "") ? " selected" : "";
      return `<option value="${escapeHtml(option.value)}"${selected}>${escapeHtml(option.label)}</option>`;
    })
    .join("");
  return `<label class="field">${escapeHtml(label)}<select name="${escapeHtml(name)}">${choices}</select>${fieldError(error)}</label>`;
}

export function textField({ name, label, value, error }) {
  return `<label class="field">${escapeHtml(label)}<input type="text" name="${escapeHtml(name)}" value="${escapeHtml(value)}">${fieldError(error)}</label>`;
}

export function filter({ action, fields }) {
  return `<form class="filter" method="get" action="${escapeHtml(action)}">${fields.map(select).join("")}<button type="submit">Filter</button></form>`;
}

function fieldError(error) {
  return error ? `<span class="field__error">${escapeHtml(error)}</span>` : "";
}

export function stylesheet() {
  const toneRules = Object.entries(tones)
    .map(([tone, { text, background }]) => `.badge--${tone}{color:${text};background:${background}}`)
    .join("");
  return [
    `body{margin:0;font-family:${font.body};font-size:${font.size};color:${colours.ink};background:${colours.page}}`,
    `header{display:flex;justify-content:space-between;align-items:center;padding:${space.l} ${space.xl};background:${colours.surface};border-bottom:1px solid ${colours.line}}`,
    `header a,main a{color:${colours.action}}`,
    `main{padding:${space.xl}}`,
    `.toolbar{display:flex;justify-content:space-between;align-items:end;margin-bottom:${space.l}}`,
    `.filter,form.request{display:flex;gap:${space.l};align-items:end}`,
    `form.request{flex-direction:column;align-items:start;max-width:420px}`,
    `.field{display:flex;flex-direction:column;gap:${space.s};font-size:${font.small};color:${colours.muted}}`,
    `.field__error{color:${tones.urgent.text}}`,
    `input,select,button{font:inherit;padding:${space.s} ${space.m}}`,
    `table{width:100%;border-collapse:collapse;background:${colours.surface}}`,
    `th,td{text-align:left;padding:${space.m} ${space.l};border-bottom:1px solid ${colours.line}}`,
    `.badge{display:inline-block;padding:2px ${space.m};border-radius:999px;font-size:${font.small}}`,
    toneRules,
  ].join("\n");
}
