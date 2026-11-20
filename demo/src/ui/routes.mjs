import { requireStaff } from "../auth.mjs";
import { ValidationError } from "../api/requests/validation.mjs";
import { renderDashboard } from "./dashboard/page.mjs";
import { page } from "./layout.mjs";
import { renderRequestForm } from "./requests/form.mjs";

export function uiRoutes({ db, requests }) {
  const users = () => db.all("users");
  const view = (user, title, body, status = 200) => ({ status, html: page({ title, user, body }) });

  function submit(user, title, attempt, form) {
    try {
      attempt();
      return { status: 303, redirect: "/" };
    } catch (error) {
      if (!(error instanceof ValidationError)) throw error;
      return view(user, title, form(error.details), 400);
    }
  }

  return [
    {
      method: "GET",
      path: "/",
      ui: true,
      handle: ({ query, user }) => {
        const status = query.get("status") ?? "";
        const list = requests.list({ status });
        return view(user, "Requests", renderDashboard({ requests: list, users: users(), user, status }));
      },
    },
    {
      method: "GET",
      path: "/ui/requests/new",
      ui: true,
      handle: ({ user }) => view(user, "New request", renderRequestForm({ users: users() })),
    },
    {
      method: "POST",
      path: "/ui/requests",
      ui: true,
      handle: ({ body, user }) =>
        submit(
          user,
          "New request",
          () => requests.create(body),
          (errors) => renderRequestForm({ users: users(), values: body, errors }),
        ),
    },
    {
      method: "GET",
      path: "/ui/requests/:id/edit",
      ui: true,
      handle: ({ params, user }) => {
        requireStaff(user);
        const request = requests.get(params.id);
        return view(user, `Edit ${request.id}`, renderRequestForm({ request, users: users() }));
      },
    },
    {
      method: "POST",
      path: "/ui/requests/:id",
      ui: true,
      handle: ({ params, body, user }) => {
        requireStaff(user);
        const request = requests.get(params.id);
        return submit(
          user,
          `Edit ${request.id}`,
          () => requests.update(request.id, body),
          (errors) => renderRequestForm({ request, users: users(), values: { ...request, ...body }, errors }),
        );
      },
    },
  ];
}
