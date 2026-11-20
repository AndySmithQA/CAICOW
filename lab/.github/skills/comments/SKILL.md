---
name: comments
description: Use when text must be stored against a request. Use the existing comment API.
---

# Comments

Store a comment through `POST /requests/{id}/comments`. The fields are request id, author, body, and audience. Audience is `staff` or `requester`. A new comment defaults to staff.

Do not create a comments table. Do not add a visibility framework. A caller that needs requester visibility sets audience on that call only.

Keep the existing comment tests in the run.
