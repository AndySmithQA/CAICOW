import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { startServiceFlow } from "./helpers.mjs";

let app;
before(async () => {
  app = await startServiceFlow();
});
after(() => app.close());

test("the health check is public", async () => {
  assert.equal((await app.call("GET", "/health")).status, 200);
});

test("an API call without a user is rejected", async () => {
  assert.equal((await app.call("GET", "/requests")).status, 401);
});

test("an unknown user is rejected", async () => {
  assert.equal((await app.call("GET", "/requests", { user: "mallory" })).status, 401);
});

test("a requester can raise a request", async () => {
  const response = await app.call("POST", "/requests", { user: "dev", body: { title: "Badge reader is offline" } });
  assert.equal(response.status, 201);
  assert.equal(response.body.reporter, "dev");
});

test("a requester cannot edit, comment, approve, or read the audit", async () => {
  assert.equal((await app.call("PATCH", "/requests/REQ-2004", { user: "dev", body: { priority: "High" } })).status, 403);
  assert.equal((await app.call("POST", "/requests/REQ-2004/comments", { user: "dev", body: { body: "Any news?" } })).status, 403);
  assert.equal((await app.call("POST", "/requests/REQ-2006/approve", { user: "erin" })).status, 403);
  assert.equal((await app.call("GET", "/requests/REQ-2001/audit", { user: "dev" })).status, 403);
  assert.equal(app.db.find("requests", "REQ-2004").priority, "Low");
});

test("the dashboard asks a signed-out visitor to sign in", async () => {
  const response = await app.call("GET", "/");
  assert.equal(response.status, 401);
  assert.match(response.body, /Choose who you are/);
});

test("signing in sets the session cookie and returns to the dashboard", async () => {
  const response = await app.call("GET", "/sign-in?user=amira");
  assert.equal(response.status, 303);
  assert.match(response.headers.get("set-cookie"), /sf_user=amira/);
  const dashboard = await app.call("GET", "/", { cookie: "sf_user=amira" });
  assert.match(dashboard.body, /Signed in as Amira Khan/);
});
