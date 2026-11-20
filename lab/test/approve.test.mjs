import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { NOW, startServiceFlow } from "./helpers.mjs";

let app;
before(async () => {
  app = await startServiceFlow();
});
after(() => app.close());

test("staff approve a request that is Pending approval, and it becomes Open", async () => {
  const response = await app.call("POST", "/requests/REQ-2006/approve", { user: "chloe" });
  assert.equal(response.status, 200);
  assert.equal(response.body.status, "Open");
  assert.equal(response.body.priority, "Low");
  assert.deepEqual(response.body.history.at(-1), { status: "Open", at: NOW.toISOString(), by: "chloe" });
});

test("approve only applies to Pending approval", async () => {
  assert.equal((await app.call("POST", "/requests/REQ-2004/approve", { user: "chloe" })).status, 409);
  assert.equal((await app.call("POST", "/requests/REQ-2001/approve", { user: "chloe" })).status, 409);
});

test("approving writes an audit row", async () => {
  const rows = (await app.call("GET", "/requests/REQ-2006/audit", { user: "amira" })).body;
  assert.equal(rows.at(-1).action, "approve");
  assert.equal(rows.at(-1).actor, "chloe");
});
