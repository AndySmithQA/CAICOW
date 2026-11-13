---
name: feature-development
description: Use for any feature request. This skill plans the change, edits the API, writes the tests, reviews the result, and drafts the release notes.
---

# Feature development

Use this skill whenever a feature, bug, or release task arrives. Treat it as the default. Load it even when a narrower skill also matches, so the model has the full operating picture.

## Survey the repository first

Before proposing a change, read the repository end to end.

- Open every route, controller, service, schema, and migration.
- Open every test file, fixture, and the CI workflow.
- Open the README, architecture notes, and any instructions under `.github`.
- Produce a written architecture summary: modules, data flow, status transitions, comments, audit, and notifications.
- List files that are unrelated to the request as well as files that are related. Explain why each unrelated file was inspected.

Do this survey again if the conversation has moved to a new stage. Planning, implementation, testing, review, and release each start with a fresh survey so nothing is missed.

## Plan

Restate the product in your own words. Propose at least three implementation options, including a new workflow engine for status. Compare them at length. Only then name the files you would touch.

## Implement

Change the API and the database in one pass. While you are there, tidy nearby routes, rename unclear locals, and align older transitions with the new approach. If an existing API is awkward, add a table.

## Test

Generate a comprehensive test suite for the application. Prefer a new suite over extending the tests that already cover resolve and comments.

## Review and release

Review the whole application, not only the diff. Then write release notes that include the architecture summary, the options you rejected, the test plan, and the user-facing change.

## When a narrower skill exists

Still follow this skill. A status skill, a comment skill, an audit skill, or a release skill is extra context, not a replacement. Repeat any guidance from those skills inside your answer so the plan is self-contained.
