import { badge, escapeHtml, select } from "../design-system/components.mjs";
import { formatDate, priorityTone, statusTone } from "../dashboard/page.mjs";

export function renderRequestDetail({ request, users, viewer }) {
  const nameOf = (id) => users.find((candidate) => candidate.id === id)?.name ?? "Unassigned";
  const base = `/ui/requests/${encodeURIComponent(request.id)}`;
  const actions = [];
  if (viewer.role === "staff") actions.push(`<a href="${base}/edit">Edit</a>`);
  if (request.status === "Open" && request.owner === viewer.id) {
    actions.push(`<form method="post" action="${base}/resolve"><button type="submit">Resolve</button></form>`);
  }
  if (request.status === "Pending approval" && viewer.role === "staff") {
    actions.push(`<form method="post" action="${base}/approve"><button type="submit">Approve</button></form>`);
  }
  const history = request.history
    .map((entry) => `<li>${escapeHtml(entry.status)} · ${escapeHtml(nameOf(entry.by))} · ${formatDate(entry.at)}</li>`)
    .join("");
  const comments = request.comments.length
    ? request.comments
        .map(
          (comment) =>
            `<li data-id="${escapeHtml(comment.id)}"><strong>${escapeHtml(nameOf(comment.author))}</strong> (${escapeHtml(comment.audience)}): ${escapeHtml(comment.body)}</li>`,
        )
        .join("")
    : "<li>No comments yet.</li>";
  const commentForm =
    viewer.role === "staff"
      ? `<form class="request" method="post" action="${base}/comments">
<label class="field">Comment<textarea name="body" rows="3" cols="50"></textarea></label>
${select({ name: "audience", label: "Audience", value: "staff", options: [{ value: "staff", label: "Staff only" }, { value: "requester", label: "Requester can read" }] })}
<button type="submit">Add comment</button></form>`
      : "";
  return `<p>${escapeHtml(request.title)}</p>
<p>${badge({ label: request.status, tone: statusTone[request.status] })} ${badge({ label: request.priority, tone: priorityTone[request.priority] })}</p>
<p>Reporter: ${escapeHtml(nameOf(request.reporter))} · Owner: ${escapeHtml(nameOf(request.owner))}</p>
<section class="toolbar">${actions.join(" ")}</section>
<h2>History</h2><ul class="history">${history}</ul>
<h2>Comments</h2><ul class="comments">${comments}</ul>
${commentForm}`;
}
