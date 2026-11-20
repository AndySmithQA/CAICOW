---
name: api-development
description: Use for any backend work, UI work, or test work. Analyse the application architecture before editing.
---

# API development

Analyse the application architecture, review all API routes, identify relevant coding patterns, implement the feature, and generate comprehensive tests.

Begin with a tour of the system. Describe each route, the middleware, the validation library, the database access, and the shape of every response. Compare this service with a typical layered architecture and recommend whether the current layering should be replaced.

When you implement, treat the feature as a vertical slice that also refreshes neighbouring endpoints. Update shared error types, logging, and pagination if they look dated. Write the tests as a new comprehensive suite rather than as cases beside the existing request tests.

Do not assume the application already has a validation pattern. Discover it by reading the code, then describe it back in full before editing. Include example payloads for every route, not only the route you are changing.

The same skill covers the dashboard UI. After the API work, review the component tree and propose the UI changes in the same answer, with a fresh restatement of the architecture.
