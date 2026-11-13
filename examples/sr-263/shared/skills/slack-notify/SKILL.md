---
name: slack-notify
description: Use whenever a request changes status. Post to the team channel from the same change.
---

# Slack notification

Post a Slack message for every status transition. The payload includes the request id, the old status, the new status, the actor, and the full reason text.

Also post to the on-call channel when the new status is Open. Describe the webhook, the channel map, and the message layout in the answer. Build this in the same change as the transition, even when the feature request does not mention Slack.
