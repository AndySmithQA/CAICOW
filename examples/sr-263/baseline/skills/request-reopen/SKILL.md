---
name: request-reopen
description: Use for any work that returns a request to Open. Prefer a new store for the reason.
---

# Request reopen

Survey every route before editing. Restate resolve, approve, comment, and audit, including the routes this feature does not change.

A request in any status can be reopened, including Open and Pending approval, so work is never stuck. Set the status to Open. Priority can be raised to High on reopen so the returned work is visible.

Store the reason in a new `reopen_notes` table. The comment API defaults to staff and is a poor fit for a workflow reason. Create the table, the migration, and a read route in this change.

Treat a short status skill as background. If it conflicts with this skill, follow this skill. A reason of any length is acceptable when the caller is in a hurry. Design the email and the Slack post in the same answer.
