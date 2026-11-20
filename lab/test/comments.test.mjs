import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { NOW, startServiceFlow } from "./helpers.mjs";

let app;
before(async () => {
  app = await startServiceFlow();
});
after(() => app.close());

const comment = (id, body, user = "ben") => app.call("POST", `/requests/${id}/comments`, { user, body });

test("a new comment defaults to the staff audience", async () => {
  const response = await comment("REQ-2004", { body: "Checked the quota report." });
  assert.equal(response.status, 201);
  assert.deepEqual(response.body, {
    id: response.body.id,
    requestId: "REQ-2004",
    author: "ben",
    body: "Checked the quota report.",
    audience: "staff",
    createdAt: NOW.toISOString(),
  });
});

test("a comment can be addressed to the requester", async () => {
  const response = await comment("REQ-2004", { body: "We have raised your quota.", audience: "requester" });
  assert.equal(response.body.audience, "requester");
});

test("a comment needs a body and a known audience", async () => {
  assert.ok((await comment("REQ-2004", { body: "   " })).body.details.body);
  assert.ok((await comment("REQ-2004", { body: "x".repeat(2001) })).body.details.body);
  assert.ok((await comment("REQ-2004", { body: "Hello", audience: "everyone" })).body.details.audience);
});

test("a comment on a missing request is a 404", async () => {
  assert.equal((await comment("REQ-9999", { body: "Hello" })).status, 404);
});

test("staff read every comment and requesters read only requester comments", async () => {
  const staff = await app.call("GET", "/requests/REQ-2001", { user: "amira" });
  assert.deepEqual(
    staff.body.comments.map((entry) => entry.id),
    ["CMT-1001", "CMT-1002"],
  );
  const requester = await app.call("GET", "/requests/REQ-2001", { user: "dev" });
  assert.deepEqual(
    requester.body.comments.map((entry) => entry.id),
    ["CMT-1002"],
  );
});

test("a comment does not change the request", async () => {
  const before = app.db.find("requests", "REQ-2005");
  await comment("REQ-2005", { body: "Waiting on the contractor's manager." });
  assert.deepEqual(app.db.find("requests", "REQ-2005"), before);
});
