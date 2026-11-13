---
name: status-rules
description: Use when a change moves a request between statuses. These rules override a longer skill that disagrees.
---

# Status rules

A request is Open, Pending approval, or Resolved.

Reopen applies only to Resolved. Reject an Open request. Reject Pending approval. Reopen sets status to Open and does not change priority.

Do not add a status called Reopened. Pending approval is completed by the approve route, not by reopen.
