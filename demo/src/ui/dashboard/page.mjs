import { STATUSES } from "../../api/requests/validation.mjs";
import { badge, escapeHtml, filter } from "../design-system/components.mjs";

export const statusTone = { Open: "urgent", "In progress": "attention", Resolved: "neutral" };

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export function renderDashboard({ requests, users, user, status }) {
  const nameOf = (id) => users.find((candidate) => candidate.id === id)?.name ?? "Unassigned";
  const filters = filter({
    action: "/",
    fields: [
      {
        name: "status",
        label: "Status",
        value: status,
        options: [{ value: "", label: "All" }, ...STATUSES.map((value) => ({ value, label: value }))],
      },
    ],
  });
  const rows = requests.length
    ? requests
        .map(
          (request) => `<tr data-id="${escapeHtml(request.id)}">
<td>${escapeHtml(request.id)}</td>
<td>${escapeHtml(request.title)}</td>
<td>${escapeHtml(nameOf(request.owner))}</td>
<td>${badge({ label: request.status, tone: statusTone[request.status] })}</td>
<td>${formatDate(request.createdAt)}</td>
<td>${user.role === "staff" ? `<a href="/ui/requests/${encodeURIComponent(request.id)}/edit">Edit</a>` : ""}</td>
</tr>`,
        )
        .join("\n")
    : `<tr><td colspan="6">No requests match this filter.</td></tr>`;
  return `<section class="toolbar">${filters}<a href="/ui/requests/new">New request</a></section>
<table class="requests">
<thead><tr><th>ID</th><th>Title</th><th>Owner</th><th>Status</th><th>Created</th><th></th></tr></thead>
<tbody>
${rows}
</tbody>
</table>`;
}
