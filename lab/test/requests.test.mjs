import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { NOW, startServiceFlow } from "./helpers.mjs";

let app;
before(async () => {
  app = await startServiceFlow();
});
after(() => app.close());

const ids = (response) => response.body.map((request) => request.id);

test("lists requests newest first", async () => {
  const response = await app.call("GET", "/requests", { user: "amira" });
  assert.equal(response.body[0].id, "REQ-2007");
  assert.equal(response.body.at(-1).id, "REQ-2001");
});

test("filters by status, priority, owner, and free text", async () => {
  assert.deepEqual(ids(await app.call("GET", "/requests?status=Pending%20approval", { user: "amira" })), ["REQ-2006", "REQ-2002"]);
  assert.deepEqual(ids(await app.call("GET", "/requests?priority=High", { user: "amira" })), ["REQ-2005", "REQ-2001"]);
  assert.deepEqual(ids(await app.call("GET", "/requests?owner=chloe", { user: "amira" })), ["REQ-2007", "REQ-2003"]);
  assert.deepEqual(ids(await app.call("GET", "/requests?q=vpn", { user: "amira" })), ["REQ-2001"]);
});

test("a stored request with no priority reads as Medium", async () => {
  const response = await app.call("GET", "/requests/REQ-2003", { user: "amira" });
  assert.equal(response.body.priority, "Medium");
  const medium = ids(await app.call("GET", "/requests?priority=Medium", { user: "amira" }));
  assert.ok(medium.includes("REQ-2003"));
});

test("reads one request with its history and comments, and a missing one is a 404", async () => {
  const response = await app.call("GET", "/requests/REQ-2001", { user: "ben" });
  assert.deepEqual(
    response.body.history.map((entry) => entry.status),
    ["Open", "Resolved"],
  );
  assert.equal(response.body.comments.length, 2);
  assert.equal((await app.call("GET", "/requests/REQ-9999", { user: "ben" })).status, 404);
});

test("creates an Open request with the reporter, the Medium default, and a history entry", async () => {
  const response = await app.call("POST", "/requests", { user: "erin", body: { title: "  Second monitor flickers " } });
  assert.equal(response.status, 201);
  assert.equal(response.body.title, "Second monitor flickers");
  assert.equal(response.body.status, "Open");
  assert.equal(response.body.priority, "Medium");
  assert.equal(response.body.reporter, "erin");
  assert.deepEqual(response.body.history, [{ status: "Open", at: NOW.toISOString(), by: "erin" }]);
});

test("a priority can be chosen on create and changed on update", async () => {
  const created = await app.call("POST", "/requests", { user: "dev", body: { title: "Server room is hot", priority: "High" } });
  assert.equal(created.body.priority, "High");
  const updated = await app.call("PATCH", `/requests/${created.body.id}`, { user: "ben", body: { priority: "Low", owner: "ben" } });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.priority, "Low");
  assert.equal(updated.body.owner, "ben");
  assert.equal(updated.body.status, "Open");
});
