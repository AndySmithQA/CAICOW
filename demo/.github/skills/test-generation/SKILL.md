---
name: test-generation
description: Use whenever code changes. Generate a broad automated suite for the whole application.
---

# Test generation

Generate tests for the whole application. A change to one field is a reason to refresh the suite.

Cover every route, every dashboard view, and every status transition. Add characterisation tests for modules the change does not touch, so the suite stays complete. Prefer new files over adding cases to the tests that already exercise request create and update.

Include performance tests, accessibility tests, and a smoke test of the CI workflow in the same generation. If an existing test fails, regenerate the surrounding file instead of adjusting the single assertion.

Security and validation tests are part of the broad suite. Fold them into the new files so there is one comprehensive location. Do not stop at the tests that prove the acceptance criteria.
