# Trainer demo: SR-142

This folder is the whole demo. The app is here, the inherited Copilot instructions, skills, and agents are in `.github/`, the request and the amended skills are in `course/`, and the measurement tools are in `tools/`. Leave `.github/` unchanged during the demo. The baseline workflow measures it.

```powershell
npm test
npm start
node tools/workflow-usage.mjs compare course/baseline/workflow.json course/optimised/workflow.json
```

The spoken script for the two-hour course is `../WALKTHROUGH.md` when this folder is inside the course repository. Hand this folder out on its own and the commands above still run.

# ServiceFlow

Internal service-request app. Staff and requesters raise requests, staff own and progress them, and the dashboard shows what is open.

Node.js 20 or newer. No install.

```powershell
npm start   # http://localhost:3000, then pick a user on the sign-in page
npm test    # the same command CI runs
```

Data is seeded from `data/seed.json` and kept in memory, so every start is a clean copy. Set `SERVICEFLOW_DB` to a file path to keep changes between runs.

## API

Every call names the user in an `x-user` header (`amira`, `ben`, and `chloe` are staff; `dev` is a requester). The browser uses the `sf_user` cookie set by `/sign-in`.

| Route | Who | What |
| --- | --- | --- |
| `GET /requests?status=` | Anyone signed in | List, newest first. Optional status filter. |
| `GET /requests/{id}` | Anyone signed in | One request. |
| `POST /requests` | Anyone signed in | Create. `title` is required, `owner` is optional. Status starts at Open. |
| `PATCH /requests/{id}` | Staff | Change `title`, `owner`, or `status`. |

A request has an id, title, owner, status, and created date. Status is Open, In progress, or Resolved.

## Layout

| Path | Contents |
| --- | --- |
| `src/api/requests/` | Routes, the request service, and service-layer validation. |
| `src/db/` | The JSON table store. |
| `src/ui/design-system/` | Tokens and the badge, select, text field, and filter components. |
| `src/ui/dashboard/` | The request dashboard and the status badge tones. |
| `src/ui/requests/` | The create and edit form. |
| `test/` | `auth`, `validation`, `requests`, and `dashboard` tests. |
| `.github/` | Copilot instructions, skills, and agents, plus the CI workflow. Leave this as the baseline. |
| `course/` | SR-142, the prompts, the amended skills, and the workflow files. |
| `tools/` | The token estimate and the workflow compare. |
