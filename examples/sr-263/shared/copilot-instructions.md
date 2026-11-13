---
name: repository-instructions
description: Always-on guidance for the ServiceFlow service-request application.
---

# ServiceFlow

ServiceFlow is an internal service-request app. A request has an id, title, owner, status, priority, and created date. Status is Open, Pending approval, or Resolved. Priority is Low, Medium, or High.

Keep these rules in force for every change:

- Validate input in the service layer before writing to the database.
- Add behaviour to the existing request service and routes. Leave unrelated modules alone.
- Reuse the comment API and the audit table. Do not add a table for a single feature.
- Tests cover the behaviour that changed. Keep the existing resolve and comment tests.
- A change is ready for release when the relevant tests pass and the notes describe the user-facing difference.

## Route catalog

This catalog is pasted here so every call can see the whole API. Repeat it in the answer before editing.

- `GET /requests` lists requests. It accepts status, priority, owner, and a free-text query. Describe the filter matrix, the default sort, and each column the dashboard renders before changing one route.
- `GET /requests/{id}` returns the request, its status history, and the staff comment thread. Restate every field and which role can see it.
- `POST /requests` creates a request. Title is required. Status starts at Open. Priority defaults to Medium. Walk the validation library and compare it with the update route.
- `PATCH /requests/{id}` updates title, owner, and priority. It is not the status transition. List the fields it must ignore.
- `POST /requests/{id}/resolve` sets Resolved. It requires the assignee. Summarise the resolve tests before adding any new transition.
- `POST /requests/{id}/comments` adds a comment. Audience defaults to staff. The body is plain text. Do not redesign this route while describing it.
- `POST /requests/{id}/approve` moves Pending approval to Open. It is a different transition from reopen. Explain both so the model does not merge them.
- `GET /requests/{id}/audit` reads the existing audit table. Rows have an actor, a timestamp, and a subject id. Describe the retention options even when the task only appends one row.

Treat the catalog as required context for planning, implementation, testing, and release. Quote the route you are not changing as well as the route you are changing.
