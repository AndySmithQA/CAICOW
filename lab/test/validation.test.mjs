import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { startServiceFlow } from "./helpers.mjs";

let app;
before(async () => {
  app = await startServiceFlow();
});
after(() => app.close());

const create = (body) => app.call("POST", "/requests", { user: "amira", body });
const update = (id, body) => app.call("PATCH", `/requests/${id}`, { user: "amira", body });

test("a title is required and must be 3 to 120 characters", async () => {
  assert.ok((await create({ owner: "ben" })).body.details.title);
  assert.equal((await create({ title: "ab" })).status, 400);
  assert.equal((await create({ title: "x".repeat(121) })).status, 400);
});

test("the owner must be a member of staff", async () => {
  assert.ok((await create({ title: "Desk phone is dead", owner: "dev" })).body.details.owner);
});

test("priority must be Low, Medium, or High", async () => {
  assert.ok((await create({ title: "Desk phone is dead", priority: "Urgent" })).body.details.priority);
  assert.ok((await update("REQ-2004", { priority: "high" })).body.details.priority);
});

test("the update route is not a status transition", async () => {
  const response = await update("REQ-2004", { status: "Resolved" });
  assert.equal(response.status, 400);
  assert.match(response.body.details.status, /transition routes/);
  assert.equal(app.db.find("requests", "REQ-2004").status, "Open");
});

test("fields the API owns cannot be set", async () => {
  const response = await create({ title: "Desk phone is dead", reporter: "erin", createdAt: "2020-01-01" });
  assert.ok(response.body.details.reporter);
  assert.ok(response.body.details.createdAt);
});

test("an unknown status or priority filter is rejected", async () => {
  assert.equal((await app.call("GET", "/requests?status=Closed", { user: "amira" })).status, 400);
  assert.equal((await app.call("GET", "/requests?priority=Urgent", { user: "amira" })).status, 400);
});

test("a body that is not JSON is rejected", async () => {
  assert.equal((await app.call("POST", "/requests", { user: "amira", body: "{title:" })).status, 400);
});

test("a rejected request is not written to the database", async () => {
  const before = app.db.all("requests").length;
  await create({ title: "" });
  await update("REQ-2005", { priority: "Critical" });
  assert.equal(app.db.all("requests").length, before);
  assert.equal(app.db.find("requests", "REQ-2005").priority, "High");
});
