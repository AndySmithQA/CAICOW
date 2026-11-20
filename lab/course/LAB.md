# Delegate lab: SR-263

Reopen a resolved request. You are in the lab folder. ServiceFlow is this folder: run it, read its tests, and look at the Copilot setup already in `.github/`. `course/baseline/workflow.json` measures that setup. It runs. It also spends more than the feature needs, and two of its skills disagree.

You have 40 minutes. At each stage, amend the skill, then read the difference for that stage before you open the next one.

## Do this

1. Run `npm test`. The app's own tests are the ones that name requests, comments, resolve, and audit. Look at `.github/` and `test/`.
2. Read `course/sr-263.md`, including the complication.
3. Copy the inherited workflow folder:

   ```powershell
   Copy-Item -Recurse course/baseline course/work
   ```

4. Work in stage order. Planning, then skill refinement, then implementation, then testing and review, then release.
5. Write rewritten skills under `course/work/skills/` and edit the prompts in `course/work/prompts/`. Point `course/work/workflow.json` at your skills. Leave `course/baseline/` and `.github/` as the measurement.
6. After each amendment, read only that stage:

   ```powershell
   node tools/workflow-usage.mjs compare course/baseline/workflow.json course/work/workflow.json
   ```

7. The existing resolve tests and comment tests (`test/resolve.test.mjs` and `test/comments.test.mjs`) stay named in the test skill, or the smaller number is not a result.
8. Say ship, revise, or reject.

## What makes this one harder

The demo feature could be improved by leaving one catch-all skill unused. This feature has that problem too, and it is not the only one.

- A short file can be the constraint. Cutting it because it estimates cheaply can force a retry.
- A long file can still be required. Shorten it to the criterion. Deleting it fails the feature.
- A skill about notifications can look required because the status changes. Check the acceptance criteria, and the app, before you load it.
- The release skill may already be the right size. Read the prompt before you rewrite another skill.
- The always-on instructions contain a route catalog. It is marked stable, so look at which stage pays the full price.
- Two drafts in `course/traps/` are smaller than the inherited skills. A smaller file is not a finished rewrite.
- The complication conflicts with a skill that should stay. Do not solve that by expanding the skill.

## Done when

- The compare shows your workflow against the baseline.
- You can say what you left unused, what you shortened, and what you kept on purpose.
- Implementation names the caller, the 15-character reason, the requester-visible comment, the unchanged priority, and the audit row.
- Testing names the new cases and the existing suites that stayed.
- The recommendation matches the evidence. Ship only if the cost fell and the necessary checks stayed. Revise if a check was dropped or a retry is still unpriced. Reject if the rewrite costs more, or the criteria are no longer in the call.

`course/reference/` is the trainer key. Finish your own workflow before you open it.
