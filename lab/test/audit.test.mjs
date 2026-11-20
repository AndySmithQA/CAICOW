import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { startServiceFlow } from "./helpers.mjs";

let app;
before(async () => {
  app = await startServiceFlow();
});
after(() => app.close());

test("staff read the audit rows for one request, oldest first", async () => {
  const response = await app.call("GET", "/requests/REQ-2001/audit", { user: "amira" });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, [
    {
      id: "AUD-1001",
      requestId: "REQ-2001",
      action: "resolve",
      actor: "ben",
      timestamp: "2026-10-04T16:20:00.000Z",
      subjectId: "REQ-2001",
    },
  ]);
});

test("every audit row has an actor, a timestamp, and a subject id", () => {
  for (const row of app.db.all("audit")) {
    assert.ok(row.actor && row.timestamp && row.subjectId, row.id);
  }
});

test("the audit for a missing request is a 404", async () => {
  assert.equal((await app.call("GET", "/requests/REQ-9999/audit", { user: "amira" })).status, 404);
});
