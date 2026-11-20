import { requireStaff } from "../../auth.mjs";

export function requestRoutes({ requests, comments, audit }) {
  return [
    {
      method: "GET",
      path: "/requests",
      handle: ({ query }) => ({
        status: 200,
        body: requests.list({
          status: query.get("status"),
          priority: query.get("priority"),
          owner: query.get("owner"),
          q: query.get("q"),
        }),
      }),
    },
    {
      method: "GET",
      path: "/requests/:id",
      handle: ({ params, user }) => ({ status: 200, body: requests.detail(params.id, user) }),
    },
    {
      method: "POST",
      path: "/requests",
      handle: ({ body, user }) => ({ status: 201, body: requests.create(body, user) }),
    },
    {
      method: "PATCH",
      path: "/requests/:id",
      handle: ({ params, body, user }) => {
        requireStaff(user);
        return { status: 200, body: requests.update(params.id, body) };
      },
    },
    {
      method: "POST",
      path: "/requests/:id/resolve",
      handle: ({ params, user }) => ({ status: 200, body: requests.resolve(params.id, user) }),
    },
    {
      method: "POST",
      path: "/requests/:id/comments",
      handle: ({ params, body, user }) => {
        requireStaff(user);
        requests.get(params.id);
        return { status: 201, body: comments.add(params.id, body, user) };
      },
    },
    {
      method: "POST",
      path: "/requests/:id/approve",
      handle: ({ params, user }) => {
        requireStaff(user);
        return { status: 200, body: requests.approve(params.id, user) };
      },
    },
    {
      method: "GET",
      path: "/requests/:id/audit",
      handle: ({ params, user }) => {
        requireStaff(user);
        requests.get(params.id);
        return { status: 200, body: audit.listFor(params.id) };
      },
    },
  ];
}
