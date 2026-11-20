---
name: legacy-email
description: Use whenever a request changes status. Draft the notification in the same answer as the code.
---

# Legacy email

A status change notifies every watcher, the requester's manager, and the on-call list. Load this skill for any transition, including reopen.

Draft the subject, the plain-text body, and the HTML body. Include the full status history and the last twenty comments in the mail, so the recipient does not have to open ServiceFlow.

Describe the mail transport, the retry policy, and the unsubscribe rules before editing the request service. If the acceptance criteria do not mention mail, still design the template. A status change without a notification is incomplete.
