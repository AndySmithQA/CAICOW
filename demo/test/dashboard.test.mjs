import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { badge } from "../src/ui/design-system/components.mjs";
import { startServiceFlow } from "./helpers.mjs";

let app;
before(async () => {
  app = await startServiceFlow();
});
after(() => app.close());

const rowFor = (html, id) => html.match(new RegExp(`<tr data-id="${id}">[\\s\\S]*?</tr>`))?.[0] ?? "";

test("shows every request with a status badge in the design-system tone", async () => {
  const { status, body } = await app.call("GET", "/", { user: "amira" });
  assert.equal(status, 200);
  assert.match(rowFor(body, "REQ-1001"), /badge--urgent">Open/);
  assert.match(rowFor(body, "REQ-1002"), /badge--attention">In progress/);
  assert.match(rowFor(body, "REQ-1003"), /badge--neutral">Resolved/);
  assert.match(rowFor(body, "REQ-1006"), /Unassigned/);
});

test("the status filter narrows the table and keeps the choice", async () => {
  const { body } = await app.call("GET", "/?status=Resolved", { user: "amira" });
  assert.ok(rowFor(body, "REQ-1003"));
  assert.equal(rowFor(body, "REQ-1001"), "");
  assert.match(body, /<option value="Resolved" selected>/);
});

test("the form fields use the API field names", async () => {
  const create = await app.call("GET", "/ui/requests/new", { user: "dev" });
  assert.match(create.body, /name="title"/);
  assert.match(create.body, /name="owner"/);
  assert.doesNotMatch(create.body, /name="status"/);
  const edit = await app.call("GET", "/ui/requests/REQ-1002/edit", { user: "amira" });
  assert.match(edit.body, /name="status"/);
  assert.match(edit.body, /<option value="In progress" selected>/);
});

test("creating from the form returns to the dashboard with the new row", async () => {
  const response = await app.call("POST", "/ui/requests", { user: "dev", form: { title: "Lift alarm keeps ringing", owner: "" } });
  assert.equal(response.status, 303);
  const { body } = await app.call("GET", "/", { user: "dev" });
  assert.match(body, /Lift alarm keeps ringing/);
});

test("the edit form saves through the same validation", async () => {
  const bad = await app.call("POST", "/ui/requests/REQ-1004", {
    user: "ben",
    form: { title: "ok", owner: "ben", status: "Open" },
  });
  assert.equal(bad.status, 400);
  assert.match(bad.body, /at least 3 characters/);
  const good = await app.call("POST", "/ui/requests/REQ-1004", {
    user: "ben",
    form: { title: "Shared drive quota warning", owner: "ben", status: "Resolved" },
  });
  assert.equal(good.status, 303);
  assert.equal(app.db.find("requests", "REQ-1004").status, "Resolved");
});

test("request titles are escaped on the dashboard", async () => {
  await app.call("POST", "/requests", { user: "dev", body: { title: "<script>alert(1)</script>" } });
  const { body } = await app.call("GET", "/", { user: "dev" });
  assert.doesNotMatch(body, /<script>alert/);
  assert.match(body, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

test("a badge only accepts a design-system tone", () => {
  assert.throws(() => badge({ label: "High", tone: "red" }), /Unknown tone red/);
});
