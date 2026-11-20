import { createServer } from "node:http";
import { createApp } from "../src/app.mjs";
import { openDatabase } from "../src/db/database.mjs";

export const NOW = new Date("2026-11-20T09:00:00.000Z");

export async function startServiceFlow() {
  const db = openDatabase();
  const server = createServer(createApp({ db, now: () => NOW }));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  async function call(method, path, { user, body, form, cookie } = {}) {
    const headers = {};
    if (user) headers["x-user"] = user;
    if (cookie) headers.cookie = cookie;
    let payload;
    if (form) {
      headers["content-type"] = "application/x-www-form-urlencoded";
      payload = new URLSearchParams(form).toString();
    } else if (body !== undefined) {
      headers["content-type"] = "application/json";
      payload = typeof body === "string" ? body : JSON.stringify(body);
    }
    const response = await fetch(base + path, { method, headers, body: payload, redirect: "manual" });
    const type = response.headers.get("content-type") ?? "";
    const data = type.includes("json") ? await response.json() : await response.text();
    return { status: response.status, headers: response.headers, body: data };
  }

  async function close() {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }

  return { call, db, close };
}
