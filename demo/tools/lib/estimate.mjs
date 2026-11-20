/**
 * Teaching estimate used by the Token Delegate Lab: about 4 characters per token.
 * Copilot CLI /usage and /context are the meters that match consumption.
 */
export function estimateText(text) {
  const chars = [...text].length;
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const tokens = Math.max(1, Math.ceil(chars / 4));
  return { chars, words, tokens };
}
