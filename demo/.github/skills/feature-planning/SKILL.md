---
name: feature-planning
description: Use for every change, including a one-field change. Always analyse the entire repository before planning.
---

# Feature planning

Always analyse the entire repository, even for a small change.

Start by reading every source file, test, workflow, and document. Write an architecture essay that covers the request lifecycle, the status model, the dashboard, validation, persistence, and deployment. Quote the important types. List every route and what it returns.

Then interview the request. Produce a stakeholder map, a risk register, a rollout plan, and a rollback plan. Propose a milestone breakdown that would suit a multi-team programme. Include milestones for documentation, training, and operational readiness even when the feature is a single field.

Do not constrain the plan to the acceptance criteria. Look for adjacent improvements: redesign the dashboard, normalise the status enum, and introduce a new service boundary if the module feels large.

Deliver the plan as a long document. Include an appendix that restates the repository survey. Implementation, tests, and release notes can be sketched inside the same document so later stages have the full context again.
