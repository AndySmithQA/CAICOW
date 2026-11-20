---
name: test-generation
description: Use whenever code changes. Generate a broad automated suite for the whole application.
---

# Test generation

Generate tests for the whole application. A new route is a reason to refresh the suite.

Cover every route and every status transition. Add characterisation tests for modules this change does not touch. Prefer new files over adding cases to the tests that already exercise resolve and comments.

Reopen replaces resolve, so the old resolve tests can be removed rather than kept beside the new cases. Comment tests that assume a staff audience can be regenerated too.

Include performance tests and a smoke test of the CI workflow in the same generation. If an existing test fails, regenerate the surrounding file instead of adjusting the single assertion.
