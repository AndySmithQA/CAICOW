import { requireStaff } from "../auth.mjs";
import { ValidationError } from "../api/requests/validation.mjs";
import { renderDashboard } from "./dashboard/page.mjs";
import { escapeHtml } from "./design-system/components.mjs";
import { page } from "./layout.mjs";
import { renderRequestDetail } from "./requests/detail.mjs";
import { renderRequestForm } from "./requests/form.mjs";

export function uiRoutes({ db, requests, comments }) {
  const users = () => db.all("users");
  const view = (user, title, body, status = 200) => ({ status, html: page({ title, user, body }) });

  function submit(user, title, attempt, form, redirect = "/") {
    try {
      attempt();
      return { status: 303, redirect };
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
        const filters = { status: query.get("status") ?? "", priority: query.get("priority") ?? "" };
        const list = requests.list(filters);
        return view(user, "Requests", renderDashboard({ requests: list, users: users(), filters }));
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
          () => requests.create(body, user),
          (errors) => renderRequestForm({ users: users(), values: body, errors }),
        ),
    },
    {
      method: "GET",
      path: "/ui/requests/:id",
      ui: true,
      handle: ({ params, user }) => {
        const request = requests.detail(params.id, user);
        return view(user, request.id, renderRequestDetail({ request, users: users(), viewer: user }));
      },
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
    {
      method: "POST",
      path: "/ui/requests/:id/resolve",
      ui: true,
      handle: ({ params, user }) => {
        requests.resolve(params.id, user);
        return { status: 303, redirect: `/ui/requests/${encodeURIComponent(params.id)}` };
      },
    },
    {
      method: "POST",
      path: "/ui/requests/:id/approve",
      ui: true,
      handle: ({ params, user }) => {
        requireStaff(user);
        requests.approve(params.id, user);
        return { status: 303, redirect: `/ui/requests/${encodeURIComponent(params.id)}` };
      },
    },
    {
      method: "POST",
      path: "/ui/requests/:id/comments",
      ui: true,
      handle: ({ params, body, user }) => {
        requireStaff(user);
        const back = `/ui/requests/${encodeURIComponent(params.id)}`;
        const request = requests.detail(params.id, user);
        return submit(
          user,
          request.id,
          () => comments.add(request.id, body, user),
          (errors) =>
            `<p class="field__error">${escapeHtml(Object.values(errors).join(" "))}</p>` +
            renderRequestDetail({ request, users: users(), viewer: user }),
          back,
        );
      },
    },
  ];
}
