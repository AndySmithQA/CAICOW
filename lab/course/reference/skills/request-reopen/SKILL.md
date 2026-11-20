---
name: request-reopen
description: Use when adding reopen on the existing request service. Follow the status rules and the comment skill.
---

# Request reopen

Add `POST /requests/{id}/reopen` on the existing request service.

The caller must be the reporter or the assignee. Follow the status rules: only Resolved reopens, status becomes Open, and priority is unchanged.

The reason is at least 15 characters. Store it through the comment skill. Set audience from the path-scoped reopen instructions. Do not add a table.

Leave email and Slack out of this change.
