import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { startServiceFlow } from "./helpers.mjs";

let app;
before(async () => {
  app = await startServiceFlow();
});
after(() => app.close());

test("the health check is public", async () => {
  const response = await app.call("GET", "/health");
  assert.equal(response.status, 200);
});

test("an API call without a user is rejected", async () => {
  const response = await app.call("GET", "/requests");
  assert.equal(response.status, 401);
});

test("an unknown user is rejected", async () => {
  const response = await app.call("GET", "/requests", { user: "mallory" });
  assert.equal(response.status, 401);
});

test("a requester can raise a request", async () => {
  const response = await app.call("POST", "/requests", { user: "dev", body: { title: "Badge reader is offline" } });
  assert.equal(response.status, 201);
});

test("a requester cannot change a request", async () => {
  const response = await app.call("PATCH", "/requests/REQ-1001", { user: "dev", body: { status: "Resolved" } });
  assert.equal(response.status, 403);
  assert.equal(app.db.find("requests", "REQ-1001").status, "Open");
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
  assert.equal(dashboard.status, 200);
  assert.match(dashboard.body, /Signed in as Amira Khan/);
});

test("a requester cannot open the edit form", async () => {
  const response = await app.call("GET", "/ui/requests/REQ-1001/edit", { user: "dev" });
  assert.equal(response.status, 403);
});
