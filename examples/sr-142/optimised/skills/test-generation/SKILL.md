---
name: test-generation
description: Use when a request-field change needs tests for the new behaviour and the existing checks must stay.
---

# Test generation

Identify the tests that already create, update, and list requests. Add cases for Low, Medium, and High, for a rejected value, for the Medium default on existing rows, and for the dashboard filter.

Run those tests first. Keep the existing authentication and input-validation tests in the same run. Do not regenerate the suite, and do not add characterisation tests for modules this feature does not touch.

A failing existing security or validation test is a stop. Fix the cause or report it. Do not delete the test to get a green run.
