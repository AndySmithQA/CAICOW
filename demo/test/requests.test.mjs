import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { NOW, startServiceFlow } from "./helpers.mjs";

let app;
before(async () => {
  app = await startServiceFlow();
});
after(() => app.close());

test("lists requests newest first", async () => {
  const response = await app.call("GET", "/requests", { user: "amira" });
  assert.equal(response.status, 200);
  assert.equal(response.body[0].id, "REQ-1006");
  assert.equal(response.body.at(-1).id, "REQ-1001");
});

test("filters requests by status", async () => {
  const response = await app.call("GET", "/requests?status=In%20progress", { user: "amira" });
  assert.deepEqual(
    response.body.map((request) => request.id),
    ["REQ-1005", "REQ-1002"],
  );
});

test("reads one request, and a missing one is a 404", async () => {
  const found = await app.call("GET", "/requests/REQ-1003", { user: "dev" });
  assert.equal(found.body.title, "Printer on floor 3 jams on duplex");
  const missing = await app.call("GET", "/requests/REQ-9999", { user: "dev" });
  assert.equal(missing.status, 404);
});

test("creates an Open request and stores it", async () => {
  const response = await app.call("POST", "/requests", {
    user: "dev",
    body: { title: "  Second monitor flickers  ", owner: "chloe" },
  });
  assert.equal(response.status, 201);
  assert.equal(response.body.status, "Open");
  assert.equal(response.body.title, "Second monitor flickers");
  assert.equal(response.body.createdAt, NOW.toISOString());
  const stored = await app.call("GET", `/requests/${response.body.id}`, { user: "dev" });
  assert.equal(stored.body.owner, "chloe");
});

test("a new request without an owner is unassigned", async () => {
  const response = await app.call("POST", "/requests", { user: "dev", body: { title: "Kitchen tap leaks" } });
  assert.equal(response.body.owner, null);
});

test("updates title, owner, and status and leaves the rest", async () => {
  const response = await app.call("PATCH", "/requests/REQ-1004", {
    user: "ben",
    body: { title: "Shared drive is full", owner: "amira", status: "In progress" },
  });
  assert.equal(response.status, 200);
  assert.equal(response.body.title, "Shared drive is full");
  assert.equal(response.body.owner, "amira");
  assert.equal(response.body.status, "In progress");
  assert.equal(response.body.createdAt, "2026-10-21T08:30:00.000Z");
});

test("updating a missing request is a 404", async () => {
  const response = await app.call("PATCH", "/requests/REQ-9999", { user: "ben", body: { status: "Resolved" } });
  assert.equal(response.status, 404);
});
