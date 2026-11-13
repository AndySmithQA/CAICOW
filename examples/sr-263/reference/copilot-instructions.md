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

The route catalog is not always-on. Read the route you are changing.
