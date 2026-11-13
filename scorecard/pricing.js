(function () {
  const bundle = JSON.parse(document.getElementById("rates").textContent);

  function modelById(id) {
    return bundle.models.find((model) => model.id === id) || null;
  }

  function tierFor(model, contextTokens) {
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

  function priceTokens(model, parts) {
    const input = parts.input || 0;
    const cached = parts.cached || 0;
    const cacheWrite = parts.cacheWrite || 0;
    const output = parts.output || 0;
    const tier = tierFor(model, input + cached + cacheWrite);
    let billedInput = input;
    let billedWrite = cacheWrite;
    if (tier.cacheWrite == null && cacheWrite > 0) {
      billedInput += cacheWrite;
      billedWrite = 0;
    }
    const usd =
      usdFor(billedInput, tier.input) +
      usdFor(cached, tier.cached) +
      usdFor(billedWrite, tier.cacheWrite) +
      usdFor(output, tier.output);
    return { tier: tier.name, usd, credits: usd / bundle.creditUsd };
  }

  function sideCredits(model, parts) {
    const request = priceTokens(model, parts);
    const retry = priceTokens(model, { input: parts.retryInput || 0, output: parts.retryOutput || 0 });
    return { credits: request.credits + retry.credits, tier: request.tier };
  }

  window.LabPricing = { bundle, modelById, priceTokens, sideCredits };
})();
