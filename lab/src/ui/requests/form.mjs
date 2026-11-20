import { DEFAULT_PRIORITY, PRIORITIES } from "../../api/requests/validation.mjs";
import { escapeHtml, select, textField } from "../design-system/components.mjs";

export function renderRequestForm({ request, users, values = request ?? {}, errors = {} }) {
  const editing = Boolean(request);
  const action = editing ? `/ui/requests/${encodeURIComponent(request.id)}` : "/ui/requests";
  const owners = [
    { value: "", label: "Unassigned" },
    ...users.filter((user) => user.role === "staff").map((user) => ({ value: user.id, label: user.name })),
  ];
  const fields = [
    textField({ name: "title", label: "Title", value: values.title, error: errors.title }),
    select({ name: "owner", label: "Owner", options: owners, value: values.owner, error: errors.owner }),
    select({
      name: "priority",
      label: "Priority",
      options: PRIORITIES.map((value) => ({ value, label: value })),
      value: values.priority ?? DEFAULT_PRIORITY,
      error: errors.priority,
    }),
  ];
  const general = Object.entries(errors)
    .filter(([field]) => !["title", "owner", "priority"].includes(field))
    .map(([, message]) => `<p class="field__error">${escapeHtml(message)}</p>`)
    .join("");
  return `<form class="request" method="post" action="${action}">${general}${fields.join("")}<button type="submit">${editing ? "Save" : "Create request"}</button></form>`;
}
