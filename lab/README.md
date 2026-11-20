# Delegate lab: SR-263

This folder is the whole lab. The app is here, the inherited Copilot instructions, skills, and agents are in `.github/`, and the request is in `course/`. The brief is `course/LAB.md`. Leave `.github/` and `course/baseline/` unchanged, and put your amendments in `course/work/`. Do not open `course/reference/` until you have said ship, revise, or reject.

```powershell
npm test
npm start
Copy-Item -Recurse course/baseline course/work
node tools/workflow-usage.mjs compare course/baseline/workflow.json course/work/workflow.json
```

# ServiceFlow

Internal service-request app. Staff and requesters raise requests. Some requests wait for approval. Staff own them, comment on them, and resolve them. Every transition is audited.

Node.js 20 or newer. No install.

```powershell
npm start   # http://localhost:3000, then pick a user on the sign-in page
npm test    # the same command CI runs
```

Data is seeded from `data/seed.json` and kept in memory, so every start is a clean copy. Set `SERVICEFLOW_DB` to a file path to keep changes between runs.

## API

Every call names the user in an `x-user` header (`amira`, `ben`, and `chloe` are staff; `dev` and `erin` are requesters). The browser uses the `sf_user` cookie set by `/sign-in`.

| Route | Who | What |
| --- | --- | --- |
| `GET /requests?status=&priority=&owner=&q=` | Anyone signed in | List, newest first. |
| `GET /requests/{id}` | Anyone signed in | The request, its status history, and the comments the caller may read. |
| `POST /requests` | Anyone signed in | Create. `title` is required. Status starts at Open. Priority defaults to Medium. |
| `PATCH /requests/{id}` | Staff | Change `title`, `owner`, or `priority`. Not a status transition. |
| `POST /requests/{id}/resolve` | The assignee | Open to Resolved. Writes an audit row. |
| `POST /requests/{id}/comments` | Staff | Add a comment. `audience` is `staff` (the default) or `requester`. |
| `POST /requests/{id}/approve` | Staff | Pending approval to Open. Writes an audit row. |
| `GET /requests/{id}/audit` | Staff | Audit rows: actor, timestamp, and subject id. |

A request has an id, title, reporter, owner, status, priority, and created date. Status is Open, Pending approval, or Resolved. Priority is Low, Medium, or High. A stored request with no priority reads as Medium.

## Layout

| Path | Contents |
| --- | --- |
| `src/api/requests/` | Routes, the request service, the comment API, and service-layer validation. |
| `src/api/audit/` | The audit table. |
| `src/db/` | The JSON table store. |
| `src/ui/design-system/` | Tokens and the badge, select, text field, and filter components. |
| `src/ui/dashboard/` | The request dashboard and the status and priority badge tones. |
| `src/ui/requests/` | The create and edit form, and the request page. |
| `test/` | `auth`, `validation`, `requests`, `resolve`, `comments`, `approve`, `audit`, and `dashboard` tests. |
| `.github/` | Copilot instructions, skills, and agents, plus the CI workflow. Leave this as the baseline. |
| `course/` | SR-263, the prompts, the traps, and the workflow files. `reference/` is the trainer key. |
| `tools/` | The token estimate and the workflow compare. |
