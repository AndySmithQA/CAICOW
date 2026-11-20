import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { startServiceFlow } from "./helpers.mjs";

let app;
before(async () => {
  app = await startServiceFlow();
});
after(() => app.close());

const rowFor = (html, id) => html.match(new RegExp(`<tr data-id="${id}">[\\s\\S]*?</tr>`))?.[0] ?? "";

test("shows status and priority badges in the design-system tones", async () => {
  const { status, body } = await app.call("GET", "/", { user: "amira" });
  assert.equal(status, 200);
  assert.match(rowFor(body, "REQ-2004"), /badge--urgent">Open/);
  assert.match(rowFor(body, "REQ-2004"), /badge--neutral">Low/);
  assert.match(rowFor(body, "REQ-2002"), /badge--attention">Pending approval/);
  assert.match(rowFor(body, "REQ-2003"), /badge--attention">Medium/);
  assert.match(rowFor(body, "REQ-2001"), /badge--urgent">High/);
});

test("the status and priority filters narrow the table together", async () => {
  const { body } = await app.call("GET", "/?status=Open&priority=High", { user: "amira" });
  assert.ok(rowFor(body, "REQ-2005"));
  assert.equal(rowFor(body, "REQ-2004"), "");
  assert.equal(rowFor(body, "REQ-2001"), "");
  assert.match(body, /<option value="High" selected>/);
});

test("the form offers priority with Medium preselected", async () => {
  const { body } = await app.call("GET", "/ui/requests/new", { user: "dev" });
  assert.match(body, /name="title"/);
  assert.match(body, /name="priority"/);
  assert.match(body, /<option value="Medium" selected>/);
});

test("creating from the form stores the chosen priority", async () => {
  const response = await app.call("POST", "/ui/requests", { user: "dev", form: { title: "Lift alarm keeps ringing", owner: "", priority: "High" } });
  assert.equal(response.status, 303);
  const created = app.db.all("requests").find((request) => request.title === "Lift alarm keeps ringing");
  assert.equal(created.priority, "High");
});

test("the request page shows history and only the comments the viewer may read", async () => {
  const staff = await app.call("GET", "/ui/requests/REQ-2001", { user: "ben" });
  assert.match(staff.body, /Reissued the VPN certificate/);
  assert.match(staff.body, /Restart the laptop/);
  const requester = await app.call("GET", "/ui/requests/REQ-2001", { user: "dev" });
  assert.doesNotMatch(requester.body, /Reissued the VPN certificate/);
  assert.match(requester.body, /Restart the laptop/);
  assert.doesNotMatch(requester.body, /name="body"/);
});

test("the assignee resolves from the request page", async () => {
  const page = await app.call("GET", "/ui/requests/REQ-2004", { user: "ben" });
  assert.match(page.body, /action="\/ui\/requests\/REQ-2004\/resolve"/);
  const other = await app.call("GET", "/ui/requests/REQ-2004", { user: "amira" });
  assert.doesNotMatch(other.body, /\/resolve"/);
  const response = await app.call("POST", "/ui/requests/REQ-2004/resolve", { user: "ben" });
  assert.equal(response.status, 303);
  assert.equal(app.db.find("requests", "REQ-2004").status, "Resolved");
});

test("staff add a comment from the request page", async () => {
  const response = await app.call("POST", "/ui/requests/REQ-2005/comments", {
    user: "amira",
    form: { body: "Contractor confirmed by phone.", audience: "staff" },
  });
  assert.equal(response.status, 303);
  const empty = await app.call("POST", "/ui/requests/REQ-2005/comments", { user: "amira", form: { body: "", audience: "staff" } });
  assert.equal(empty.status, 400);
  assert.match(empty.body, /A comment needs a body/);
});

test("request titles are escaped", async () => {
  await app.call("POST", "/requests", { user: "dev", body: { title: "<img src=x onerror=alert(1)>" } });
  const { body } = await app.call("GET", "/", { user: "dev" });
  assert.doesNotMatch(body, /<img src=x/);
});
