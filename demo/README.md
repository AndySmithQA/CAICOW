# Trainer demo: SR-142

This is the trainer package. It holds the whole SR-142 demo: the ServiceFlow app, the inherited Copilot instructions, skills, and agents in `.github/`, the request and the amended skills in `course/`, the measurement tools in `tools/`, and the trainer documents.

Do not hand this folder to delegates. They work in `lab/`. This folder contains the SR-142 answers in `course/optimised/`.

| File | What it is |
| --- | --- |
| `SLIDES.md` | The slide deck, 0 to 24. Each stage slide has an app anchor. |
| `WALKTHROUGH.md` | What to say at each stage, the trainer key, and the timing card. |
| `INSTRUCTIONS.md` | The click-by-click for the 80 minutes, including the one live edit at minute 58. |

Leave `.github/` unchanged during the demo. The baseline workflow measures it.

```powershell
npm test
npm start
node tools/workflow-usage.mjs compare course/baseline/workflow.json course/optimised/workflow.json
```

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
| `course/` | SR-142, the baseline and optimised workflows, the prompts, the amended skills, and the trap file. |
| `tools/` | The token estimate and the workflow compare. |
