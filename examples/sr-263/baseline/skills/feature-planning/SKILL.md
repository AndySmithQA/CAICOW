---
name: feature-planning
description: Use for every change. Analyse the repository and the notification paths before planning a transition.
---

# Feature planning

Always analyse the entire repository, even for a single new route.

Start by reading every source file, test, workflow, and document. Write an architecture essay that covers the request lifecycle, every status transition, comments, audit, mail, and Slack. Quote the important types. List every route and what it returns.

Then propose three options. One must be a new workflow engine that replaces resolve, approve, and reopen. One must add a dedicated reopen notes store. Compare them at length, with a risk register and a rollback plan.

Do not constrain the plan to the acceptance criteria. Include the email and Slack work so the status change is operable. Sketch the tests and the release notes in the same document so later stages have the full context again.
