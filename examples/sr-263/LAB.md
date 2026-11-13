# Delegate lab: SR-263

Reopen a resolved request. The inherited Copilot setup is in `baseline/`. It runs. It also spends more than the feature needs, and two of its skills disagree.

You have 40 minutes. At each stage, amend the skill, then read the difference for that stage before you open the next one.

## Do this

1. Read `shared/sr-263.md`, including the complication.
2. Copy the inherited workflow:

   ```powershell
   Copy-Item examples/sr-263/baseline/workflow.json my-workflow.json
   ```

3. Work in stage order. Planning, then skill refinement, then implementation, then testing and review, then release.
4. Write rewritten skills under a folder of your own. Point `my-workflow.json` at those files. Leave `baseline/` as the measurement.
5. After each amendment, read only that stage:

   ```powershell
   node tools/workflow-usage.mjs compare examples/sr-263/baseline/workflow.json my-workflow.json
   ```

6. The existing resolve tests and comment tests stay named in the test skill, or the smaller number is not a result.
7. Say ship, revise, or reject.

## What makes this one harder

The demo feature could be improved by leaving one catch-all skill unused. This feature has that problem too, and it is not the only one.

- A short file can be the constraint. Cutting it because it estimates cheaply can force a retry.
- A long file can still be required. Shorten it to the criterion. Deleting it fails the feature.
- A skill about notifications can look required because the status changes. Check the acceptance criteria before you load it.
- The release skill may already be the right size. Read the prompt before you rewrite another skill.
- The always-on instructions contain a route catalog. It is marked stable, so look at which stage pays the full price.
- Two drafts in `traps/` are smaller than the inherited skills. A smaller file is not a finished rewrite.
- The complication conflicts with a skill that should stay. Do not solve that by expanding the skill.

## Done when

- The compare shows your workflow against the baseline.
- You can say what you left unused, what you shortened, and what you kept on purpose.
- Implementation names the caller, the 15-character reason, the requester-visible comment, the unchanged priority, and the audit row.
- Testing names the new cases and the existing suites that stayed.
- The recommendation matches the evidence. Ship only if the cost fell and the necessary checks stayed. Revise if a check was dropped or a retry is still unpriced. Reject if the rewrite costs more, or the criteria are no longer in the call.

`reference/` is the trainer key. Finish your own workflow before you open it.
