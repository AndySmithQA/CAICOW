import { PRIORITIES, STATUSES } from "../../api/requests/validation.mjs";
import { badge, escapeHtml, filter } from "../design-system/components.mjs";

export const statusTone = { Open: "urgent", "Pending approval": "attention", Resolved: "neutral" };
export const priorityTone = { Low: "neutral", Medium: "attention", High: "urgent" };

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const choices = (values) => [{ value: "", label: "All" }, ...values.map((value) => ({ value, label: value }))];

export function renderDashboard({ requests, users, filters }) {
  const nameOf = (id) => users.find((candidate) => candidate.id === id)?.name ?? "Unassigned";
  const filterBar = filter({
    action: "/",
    fields: [
      { name: "status", label: "Status", value: filters.status, options: choices(STATUSES) },
      { name: "priority", label: "Priority", value: filters.priority, options: choices(PRIORITIES) },
    ],
  });
  const rows = requests.length
    ? requests
        .map(
          (request) => `<tr data-id="${escapeHtml(request.id)}">
<td><a href="/ui/requests/${encodeURIComponent(request.id)}">${escapeHtml(request.id)}</a></td>
<td>${escapeHtml(request.title)}</td>
<td>${escapeHtml(nameOf(request.owner))}</td>
<td>${badge({ label: request.status, tone: statusTone[request.status] })}</td>
<td>${badge({ label: request.priority, tone: priorityTone[request.priority] })}</td>
<td>${formatDate(request.createdAt)}</td>
</tr>`,
        )
        .join("\n")
    : `<tr><td colspan="6">No requests match this filter.</td></tr>`;
  return `<section class="toolbar">${filterBar}<a href="/ui/requests/new">New request</a></section>
<table class="requests">
<thead><tr><th>ID</th><th>Title</th><th>Owner</th><th>Status</th><th>Priority</th><th>Created</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>`;
}
