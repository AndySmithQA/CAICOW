import { AuthError, authenticate } from "./auth.mjs";
import { requestRoutes } from "./api/requests/routes.mjs";
import { createRequestService, NotFoundError } from "./api/requests/service.mjs";
import { ValidationError } from "./api/requests/validation.mjs";
import { openDatabase } from "./db/database.mjs";
import { readBody } from "./http/body.mjs";
import { matchRoute } from "./http/router.mjs";
import { escapeHtml } from "./ui/design-system/components.mjs";
import { page, signInPage } from "./ui/layout.mjs";
import { uiRoutes } from "./ui/routes.mjs";

export function createApp({ db = openDatabase(), now } = {}) {
  const requests = createRequestService(db, { now });
  const routes = [...uiRoutes({ db, requests }), ...requestRoutes(requests)];

  function signIn(url) {
    const user = db.find("users", url.searchParams.get("user") ?? "");
    if (!user) return { status: 200, html: signInPage(db.all("users")) };
    return { status: 303, redirect: "/", cookie: `sf_user=${user.id}; Path=/; HttpOnly; SameSite=Lax` };
  }

  function statusOf(error) {
    if (error instanceof ValidationError) return 400;
    if (error instanceof AuthError) return error.status;
    if (error instanceof NotFoundError) return 404;
    throw error;
  }

  function failure(error, route) {
    const status = statusOf(error);
    if (route?.ui) {
      if (status === 401) return { status, html: signInPage(db.all("users")) };
      return { status, html: page({ title: "Something is wrong", body: `<p>${escapeHtml(error.message)}</p>` }) };
    }
    if (error instanceof ValidationError) return { status, body: { error: error.message, details: error.details } };
    return { status, body: { error: error.message } };
  }

  async function respond(req) {
    const url = new URL(req.url, "http://serviceflow.local");
    if (req.method === "GET" && url.pathname === "/health") return { status: 200, body: { ok: true } };
    if (req.method === "GET" && url.pathname === "/sign-in") return signIn(url);
    const match = matchRoute(routes, req.method, url.pathname);
    if (!match) return { status: 404, body: { error: "Not found." } };
    try {
      const user = authenticate(db, req);
      const body = ["POST", "PATCH"].includes(req.method) ? await readBody(req) : {};
      return await match.route.handle({ params: match.params, query: url.searchParams, body, user });
    } catch (error) {
      return failure(error, match.route);
    }
  }

  return async function handle(req, res) {
    let result;
    try {
      result = await respond(req);
    } catch (error) {
      console.error(error);
      result = { status: 500, body: { error: "Something went wrong." } };
    }
    const headers = {};
    if (result.cookie) headers["set-cookie"] = result.cookie;
    if (result.redirect) {
      res.writeHead(result.status, { ...headers, location: result.redirect }).end();
    } else if (result.html !== undefined) {
      res.writeHead(result.status, { ...headers, "content-type": "text/html; charset=utf-8" }).end(result.html);
    } else {
      res.writeHead(result.status, { ...headers, "content-type": "application/json" }).end(JSON.stringify(result.body));
    }
  };
}
