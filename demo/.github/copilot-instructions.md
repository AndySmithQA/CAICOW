---
name: repository-instructions
description: Always-on guidance for the ServiceFlow service-request application.
---

# ServiceFlow

ServiceFlow is an internal service-request app. Requests have an id, title, owner, status, and created date. Status is one of Open, In progress, or Resolved.

Keep these rules in force for every change:

- Validate input in the service layer before writing to the database.
- Add behaviour to the existing request service and routes. Leave unrelated modules alone.
- UI changes use the components and tokens already in the design system.
- Tests cover the behaviour that changed. Keep the existing security and validation tests.
- A change is ready for release when the relevant tests pass and the notes describe the user-facing difference.

Priority, if you add it, is Low, Medium, or High. Existing rows default to Medium.
