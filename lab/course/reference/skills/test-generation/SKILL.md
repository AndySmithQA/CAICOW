---
name: test-generation
description: Use when a new transition needs cases and the existing resolve and comment tests must stay.
---

# Test generation

Add cases for a legal reopen, a too-short reason, a Pending approval rejection, an Open rejection, a caller who is neither reporter nor assignee, and an unchanged priority.

Run those tests with the existing resolve tests and the existing comment tests. Do not remove or regenerate those files.

A failing resolve or comment test is a stop. Fix the cause or report it. Do not delete the test to get a green run.
