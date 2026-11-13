# Trainer key: SR-263

Open this after the CSV is in. A delegate workflow can differ from `workflow.json` in this folder and still be a ship, if the evidence supports it.

Figures below are the reference compared with the baseline on GPT-5.3-Codex, as file estimates. Re-run the command if a file has been edited.

```powershell
node tools/workflow-usage.mjs compare examples/sr-263/baseline/workflow.json examples/sr-263/reference/workflow.json
```

About **14,571** baseline tokens against **5,373** reference tokens (**63.1% fewer**). About **3.31** credits against **1.00** (**69.8% fewer**). File context about **11,663** against **5,030**. The implementation gap is the large one: the baseline includes an illustrative retry of 1,800 input and 700 output because the reopen skill and the comment skill disagree. It is not a `/usage` reading.

## Decisions

| Asset | Decision | Why |
| --- | --- | --- |
| `feature-development` | Leave unused | It is loaded at every stage and repeats the repository survey. This is the lesson from the demo. It is not the only saving. |
| `developer` agent | Leave unused | It tells the model to ignore a narrower skill and to prefer a new table. |
| `feature-planning` skill | Modify | The inherited skill asks for a workflow engine, a notes store, mail, and Slack. |
| Planning prompt | Modify | It asks for test code and release notes in the planning call. Rewriting the skill and leaving this prompt still spends the stage. |
| `status-rules` | Retain, and load it | It is short. It is also the only file that rejects Pending approval and protects priority. The one-line trap in `traps/reopen-too-short.md` is smaller and drops those rules. |
| `comments` | Retain, do not rewrite | The existing API is the store. The staff default stays. Requester visibility is one field on this call. |
| `request-reopen` | Modify | The inherited skill reopens any status, raises priority, and adds a `reopen_notes` table. |
| `audit` | Modify, do not delete | The criterion is one row on the existing table: actor, timestamp, comment id. `traps/skip-audit.md` estimates smaller and fails the feature. |
| `legacy-email` | Leave unused | A status change is not a mailout in the acceptance criteria. |
| `slack-notify` | Leave unused | Slack is not in the acceptance criteria. |
| `test-generation` | Modify | The inherited skill removes the resolve tests and regenerates the comment tests. |
| `reviewer` agent | Modify, do not drop | The inherited agent reviews the whole repository and replaces the suite. The review itself stays. |
| `code-review` | Retain | It already reviews the diff against the criteria. |
| `release-preparation` | Retain | The skill is already a short note and a local CI result. |
| Release prompt | Modify | The inherited prompt asks for the route catalog, a rollback plan, and a threat model. The skill is not where that cost sits. |
| Route catalog in `copilot-instructions.md` | Remove from always-on | The rules at the top stay. The catalog is stable, so the full price is on the first stage and later stages pay the cached rate. Deleting the rules to delete the catalog is a failed cut. |
| `reopen.instructions.md` | Add, path-scoped, on implementation | Audience `requester` and the 15-character reason sit next to the route. They do not go into the always-on file, and the comment skill is not rewritten to change its default. |

## What a strong lab looks like

- The catch-all skill and the developer agent are off every stage.
- Mail and Slack are unused, with the criteria named as the reason.
- Status rules and the comment skill are still loaded where a call could break them.
- Audit is a short insert, still present.
- The release skill path is unchanged and the release prompt is shorter.
- Necessary checks are Yes only because the resolve tests and the comment tests remain.
- The illustrative retry is gone because the two skills no longer disagree. A real retry, if one happened, is still in the report.

## False savings to mark down

- Loading `traps/reopen-too-short.md` or `traps/skip-audit.md` because the estimate fell.
- Deleting the audit skill.
- Rewriting the comment skill into a long visibility essay, or changing its default for every comment.
- Leaving the release prompt alone and rewriting a skill that was already the right size.
- Quoting the credit drop while **Necessary checks retained** is No.
