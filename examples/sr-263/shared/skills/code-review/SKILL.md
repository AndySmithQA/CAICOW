---
name: code-review
description: Use when a diff is ready and the question is whether this change is safe to merge.
---

# Code review

Read the diff and the acceptance criteria for SR-263.

Check that only a Resolved request reopens, the caller is the reporter or the assignee, the reason is at least 15 characters, the reason is a requester-visible comment, priority is unchanged, and the audit row stores actor, timestamp, and comment id.

Confirm the existing resolve tests and comment tests are still in the run. Report defects against the criteria. Do not expand the review to the whole repository.
