import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { NOW, startServiceFlow } from "./helpers.mjs";

let app;
before(async () => {
  app = await startServiceFlow();
});
after(() => app.close());

const resolve = (id, user) => app.call("POST", `/requests/${id}/resolve`, { user });

test("the assignee resolves an Open request", async () => {
  const response = await resolve("REQ-2004", "ben");
  assert.equal(response.status, 200);
  assert.equal(response.body.status, "Resolved");
  assert.deepEqual(response.body.history.at(-1), { status: "Resolved", at: NOW.toISOString(), by: "ben" });
});

test("resolving keeps the priority", async () => {
  const response = await resolve("REQ-2005", "amira");
  assert.equal(response.body.priority, "High");
});

test("only the assignee can resolve", async () => {
  const response = await app.call("POST", "/requests", { user: "dev", body: { title: "Locker key is lost", owner: "chloe" } });
  assert.equal((await resolve(response.body.id, "ben")).status, 403);
  assert.equal((await resolve(response.body.id, "dev")).status, 403);
  assert.equal(app.db.find("requests", response.body.id).status, "Open");
});

test("an unassigned request cannot be resolved", async () => {
  const response = await app.call("POST", "/requests", { user: "dev", body: { title: "Coffee machine is empty" } });
  assert.equal((await resolve(response.body.id, "amira")).status, 403);
});

test("a request that is Pending approval or already Resolved cannot be resolved", async () => {
  assert.equal((await resolve("REQ-2002", "amira")).status, 409);
  assert.equal((await resolve("REQ-2007", "chloe")).status, 409);
});

test("resolving writes an audit row", async () => {
  const rows = (await app.call("GET", "/requests/REQ-2004/audit", { user: "amira" })).body;
  assert.deepEqual(rows.at(-1), {
    id: rows.at(-1).id,
    requestId: "REQ-2004",
    action: "resolve",
    actor: "ben",
    timestamp: NOW.toISOString(),
    subjectId: "REQ-2004",
  });
});
