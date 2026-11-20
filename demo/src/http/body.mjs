import { ValidationError } from "../api/requests/validation.mjs";

export async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text) return {};
  const type = req.headers["content-type"] ?? "";
  if (type.startsWith("application/x-www-form-urlencoded")) return Object.fromEntries(new URLSearchParams(text));
  try {
    return JSON.parse(text);
  } catch {
    throw new ValidationError({ body: "The body is not valid JSON." });
  }
}
