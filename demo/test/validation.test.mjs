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

test("a title is required", async () => {
  const response = await create({ owner: "ben" });
  assert.equal(response.status, 400);
  assert.ok(response.body.details.title);
});

test("a title must be between 3 and 120 characters", async () => {
  assert.equal((await create({ title: "  ab " })).status, 400);
  assert.equal((await create({ title: "x".repeat(121) })).status, 400);
});

test("the owner must be a member of staff", async () => {
  assert.ok((await create({ title: "Desk phone is dead", owner: "dev" })).body.details.owner);
  assert.ok((await create({ title: "Desk phone is dead", owner: "zed" })).body.details.owner);
});

test("a new request cannot choose its own status or created date", async () => {
  const response = await create({ title: "Desk phone is dead", status: "Resolved", createdAt: "2020-01-01" });
  assert.equal(response.status, 400);
  assert.ok(response.body.details.status);
  assert.ok(response.body.details.createdAt);
});

test("an update rejects a status outside the status model", async () => {
  const response = await update("REQ-1001", { status: "Closed" });
  assert.equal(response.status, 400);
  assert.ok(response.body.details.status);
});

test("an update needs at least one field", async () => {
  assert.equal((await update("REQ-1001", {})).status, 400);
});

test("a body that is not JSON is rejected", async () => {
  const response = await app.call("POST", "/requests", { user: "amira", body: "{title:" });
  assert.equal(response.status, 400);
});

test("an unknown status filter is rejected", async () => {
  const response = await app.call("GET", "/requests?status=Closed", { user: "amira" });
  assert.equal(response.status, 400);
});

test("a rejected request is not written to the database", async () => {
  const before = app.db.all("requests").length;
  await create({ title: "" });
  await update("REQ-1002", { status: "Done" });
  assert.equal(app.db.all("requests").length, before);
  assert.equal(app.db.find("requests", "REQ-1002").status, "In progress");
});
