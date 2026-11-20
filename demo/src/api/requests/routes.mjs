import { requireStaff } from "../../auth.mjs";

export function requestRoutes(service) {
  return [
    {
      method: "GET",
      path: "/requests",
      handle: ({ query }) => ({ status: 200, body: service.list({ status: query.get("status") }) }),
    },
    {
      method: "GET",
      path: "/requests/:id",
      handle: ({ params }) => ({ status: 200, body: service.get(params.id) }),
    },
    {
      method: "POST",
      path: "/requests",
      handle: ({ body }) => ({ status: 201, body: service.create(body) }),
    },
    {
      method: "PATCH",
      path: "/requests/:id",
      handle: ({ params, body, user }) => {
        requireStaff(user);
        return { status: 200, body: service.update(params.id, body) };
      },
    },
  ];
}
