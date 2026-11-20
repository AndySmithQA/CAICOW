---
name: api-development
description: Use when the change is a field on the existing request API. Reuse the current validation and service pattern.
---

# API development

Identify the affected route, service, and schema. Reuse the existing validation pattern. Modify only the request create and update paths, and run the tests that cover those paths.

Priority is Low, Medium, or High. Reject any other value in the service before persistence. Existing stored requests default to Medium when the column is empty.

Do not review unrelated routes. Do not generate a new test suite. Extend the tests that already create and update a request, and keep the current authentication and validation tests in the run.

The dashboard filter and the badge are separate UI work. Name them in the plan, and leave the component edit to the UI components skill.
