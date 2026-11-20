/**
 * Per-million-token USD rates copied from GitHub Docs on 2026-11-10:
 * https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing
 * 1 AI credit = $0.01 USD.
 * Check the page before a live course. Model prices change.
 */

export const CREDIT_USD = 0.01;
export const RATES_SOURCE =
  "https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing";
export const RATES_AS_OF = "2026-11-10";

export const MODELS = [
  {
    id: "gpt-5.3-codex",
    name: "GPT-5.3-Codex",
    vendor: "OpenAI",
    category: "Powerful",
    note: "",
    tiers: [
      { name: "Default", above: null, input: 1.75, cached: 0.175, cacheWrite: null, output: 14 },
    ],
  },
  {
    id: "gpt-5.4-nano",
    name: "GPT-5.4 nano",
    vendor: "OpenAI",
    category: "Lightweight",
    note: "",
    tiers: [
      { name: "Default", above: null, input: 0.2, cached: 0.02, cacheWrite: null, output: 1.25 },
    ],
  },
  {
    id: "gpt-5.6-luna",
    name: "GPT-5.6 Luna",
    vendor: "OpenAI",
    category: "Lightweight",
    note: "",
    tiers: [
      { name: "Default", above: null, input: 0.2, cached: 0.02, cacheWrite: 0.25, output: 1.2 },
      { name: "Long context", above: 200000, input: 0.4, cached: 0.04, cacheWrite: 0.5, output: 1.8 },
    ],
  },
  {
    id: "gpt-5.6-terra",
    name: "GPT-5.6 Terra",
    vendor: "OpenAI",
    category: "Versatile",
    note: "",
    tiers: [
      { name: "Default", above: null, input: 2, cached: 0.2, cacheWrite: 2.5, output: 12 },
      { name: "Long context", above: 272000, input: 4, cached: 0.4, cacheWrite: 5, output: 18 },
    ],
  },
  {
    id: "claude-haiku-4.5",
    name: "Claude Haiku 4.5",
    vendor: "Anthropic",
    category: "Versatile",
    note: "",
    tiers: [
      { name: "Default", above: null, input: 1, cached: 0.1, cacheWrite: 1.25, output: 5 },
    ],
  },
  {
    id: "claude-sonnet-4.6",
    name: "Claude Sonnet 4.6",
    vendor: "Anthropic",
    category: "Versatile",
    note: "",
    tiers: [
      { name: "Default", above: null, input: 3, cached: 0.3, cacheWrite: 3.75, output: 15 },
    ],
  },
  {
    id: "claude-sonnet-5",
    name: "Claude Sonnet 5",
    vendor: "Anthropic",
    category: "Versatile",
    note: "",
    tiers: [
      { name: "Default", above: null, input: 2, cached: 0.2, cacheWrite: 2.5, output: 10 },
    ],
  },
  {
    id: "claude-opus-4.8",
    name: "Claude Opus 4.8",
    vendor: "Anthropic",
    category: "Powerful",
    note: "",
    tiers: [
      { name: "Default", above: null, input: 5, cached: 0.5, cacheWrite: 6.25, output: 25 },
    ],
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    vendor: "Google",
    category: "Versatile",
    note: "Promotional price through 31 December 2026.",
    tiers: [
      { name: "Default", above: null, input: 0.75, cached: 0.075, cacheWrite: null, output: 3.75 },
    ],
  },
  {
    id: "grok-4.7",
    name: "Grok 4.7",
    vendor: "xAI",
    category: "Versatile",
    note: "",
    tiers: [
      { name: "Default", above: null, input: 2, cached: 0.5, cacheWrite: null, output: 6 },
      { name: "Long context", above: 200000, input: 4, cached: 1, cacheWrite: null, output: 12 },
    ],
  },
  {
    id: "mai-code-1.1-flash",
    name: "MAI-Code-1.1-Flash",
    vendor: "Microsoft",
    category: "Lightweight",
    note: "",
    tiers: [
      { name: "Default", above: null, input: 0.2, cached: 0.02, cacheWrite: null, output: 1.2 },
    ],
  },
];

export function rateBundle() {
  return {
    creditUsd: CREDIT_USD,
    asOf: RATES_AS_OF,
    source: RATES_SOURCE,
    models: MODELS,
  };
}

export function modelById(id) {
  const model = MODELS.find((item) => item.id === id);
  if (!model) {
    const known = MODELS.map((item) => item.id).join(", ");
    throw new Error(`Unknown model "${id}". Known models: ${known}`);
  }
  return model;
}

export function tierFor(model, contextTokens) {
  const ordered = [...model.tiers].sort((a, b) => (a.above ?? -1) - (b.above ?? -1));
  let chosen = ordered[0];
  for (const tier of ordered) {
    if (tier.above != null && contextTokens > tier.above) chosen = tier;
  }
  return chosen;
}

function usdFor(tokens, pricePerMillion) {
  if (!tokens || pricePerMillion == null) return 0;
  return (tokens / 1_000_000) * pricePerMillion;
}

/**
 * Price one request. Each token sits in one bucket: fresh input, cache write, cached input, or output.
 * A model with no cache-write price bills those tokens as fresh input.
 * contextTokens selects the long-context tier and includes every input bucket, not output.
 */
export function priceTokens(model, parts) {
  const input = parts.input || 0;
  const cached = parts.cached || 0;
  const cacheWrite = parts.cacheWrite || 0;
  const output = parts.output || 0;
  const contextTokens = input + cached + cacheWrite;
  const tier = tierFor(model, contextTokens);
  let billedInput = input;
  let billedWrite = cacheWrite;
  if (tier.cacheWrite == null && cacheWrite > 0) {
    billedInput += cacheWrite;
    billedWrite = 0;
  }
  const inputUsd = usdFor(billedInput, tier.input);
  const cachedUsd = usdFor(cached, tier.cached);
  const writeUsd = usdFor(billedWrite, tier.cacheWrite);
  const outputUsd = usdFor(output, tier.output);
  const usd = inputUsd + cachedUsd + writeUsd + outputUsd;
  return {
    tier: tier.name,
    usd,
    credits: usd / CREDIT_USD,
    breakdownUsd: {
      input: inputUsd,
      cached: cachedUsd,
      cacheWrite: writeUsd,
      output: outputUsd,
    },
  };
}
