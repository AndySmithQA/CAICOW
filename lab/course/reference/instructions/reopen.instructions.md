---
applyTo: "src/api/requests/**"
---

# Reopen

Reopen is `POST /requests/{id}/reopen`. The caller must be the reporter or the assignee.

The reason is required and must be at least 15 characters. Store it with the existing comment API. On this call, set audience to requester. Leave the comment skill's staff default unchanged for every other call.

Status becomes Open. Do not change priority. Reject Open and Pending approval.
