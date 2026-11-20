# Delegate lab: SR-263 (40 minutes)

Reopen a resolved request. You are in the `lab/` folder. ServiceFlow is this folder: its app, its tests, and its Copilot setup in `.github/`. Your job is the workflow, not the code. You will not change the app.

`course/baseline/workflow.json` measures the inherited setup. It runs. It also spends more than this feature needs, and two of its skills disagree.

The spec is `course/sr-263.md`, including the complication at the bottom.

At each stage, amend the skill, then read the difference for that stage before you open the next one. Do not open `course/reference/` until you have made your recommendation.

Stay in this folder for all 40 minutes. Every path below is relative to it.

## 80–88 minutes. Meet the app, read the spec, make your copy

1. Run the app's tests:

   ```powershell
   npm test
   ```

   The app's own tests name requests, comments, resolve, approve, and audit. You do not need to read them all.
2. Look at the app if you like. Run `npm start`, open http://localhost:3000, sign in as Ben Ortiz, and open REQ-2001. Stop the server with Ctrl+C when you are done.
3. Open `.github/`. Count the skills and agents. Open `copilot-instructions.md` and find the route catalog.
4. Read `course/sr-263.md`, including the complication. Do not change a file yet.
5. Make your copy of the inherited workflow. The copy sits beside `baseline/`, so every path in it still resolves:

   ```powershell
   Copy-Item -Recurse course/baseline course/work
   ```

6. Open `course/work/workflow.json`. Find the Planning stage. Name one file that call loads which the acceptance criteria do not need. Write it down. Do not delete it until you have read the skill.

## 88–96 minutes. Planning

1. Open `course/work/prompts/planning.md` and `.github/skills/feature-planning/SKILL.md`.
2. **App anchor:** open `src/api/requests/service.mjs`. The reopen route will live beside create and update. Write down what a plan for this request must name, and what it must not draft yet.
3. Amend the planning skill, the planning prompt, or both. Edit the prompt in `course/work/prompts/` directly. Write a rewritten skill to `course/work/skills/feature-planning/SKILL.md`. Then, in the Planning stage of `course/work/workflow.json`, change the path from `../../.github/skills/feature-planning/SKILL.md` to `skills/feature-planning/SKILL.md`.
4. Take `feature-development` off this stage if the spec does not need it on a planning call.
5. Run the compare and read only **Planning**:

   ```powershell
   node tools/workflow-usage.mjs compare course/baseline/workflow.json course/work/workflow.json
   ```

6. Check the amended plan still contains the rules the spec requires. If a rule is missing, put it back before you open the next stage.

## 96–102 minutes. Skill refinement

1. Open `course/work/prompts/skill-refinement.md`.
2. Open each skill and agent that this stage loads. For each one, write retain, modify, or leave unused, with one reason taken from the spec.
3. **App anchor:** open `test/resolve.test.mjs` and `test/comments.test.mjs`. Decide now that these stay in the run. The inherited test skill says the opposite (see below), so this is a decision you make, not one the skill makes for you.
4. Compare a file with the short drafts before you adopt one:

   ```powershell
   node tools/estimate-tokens.mjs .github/skills/request-reopen/SKILL.md course/traps/reopen-too-short.md
   ```

   Also open `course/traps/skip-audit.md`. A smaller estimate is not a finished rewrite. Read what each draft leaves out, then decide.
5. Change the Skill refinement stage in `course/work/workflow.json` so it loads only the files you are actually rewriting.
6. Run the compare and read only **Skill refinement**.

## 102–110 minutes. Implementation

1. Read the complication in `course/sr-263.md` again before you edit.
2. Open `course/work/prompts/implementation.md` and the skills that stage loads.
3. **App anchors:** open `src/api/requests/comments.mjs` and `src/api/audit/log.mjs`. The spec says to reuse the comment API and the audit table, so the skill should point at them.
4. Amend the skills this call should load. Point the Implementation stage at your files. A path-scoped instructions file goes in `course/work/instructions/`, with `applyTo` set to the folder it should sit beside.
5. If two loaded skills disagree, do not leave both instructions in force. The baseline retry prices that disagreement. Remove that retry from `course/work/workflow.json` only when your skills no longer contradict each other. If you record a real follow-up call, record it without `"illustrative": true`.
6. Run the compare and read only **Implementation**.
7. In your notes, write who may reopen a request, the reason rule, where the reason is stored, and whether priority changes. If any of those are missing from the skill, the stage is not finished. Deleting the longest skill is not the finish either.
8. If Copilot is available, send the implementation prompt only after this compare. Use a live copy of the lab app with your files in its `.github/`, as described in `WALKTHROUGH.md`. Read `/usage`, then run `npm test` in that copy. The resolve and comment tests have to stay green.

## 110–116 minutes. Testing and review, then release

1. Open the testing prompt, the inherited test skill, and the skills that stage loads. Read the release prompt before you rewrite anything else.
2. **App anchor:** run `npm test`. Read `.github/skills/test-generation/SKILL.md`. It says reopen replaces resolve, so the old resolve tests can be removed, and that comment tests assuming a staff audience can be regenerated. Do not accept that. Keep `test/resolve.test.mjs` and `test/comments.test.mjs` in the run. If they are gone from the skill's run, the smaller number on the compare is not a result.
3. Amend the test skill in `course/work/skills/test-generation/SKILL.md` so it adds the reopen cases and keeps the resolve and comment suites, then point the Testing stage at that file.
4. Read the release skill before you change it. If it is already the size of the release you need, change the release prompt instead.
5. Run the compare and read **Testing and review**, then **Release**.

## 116–120 minutes. Decide

1. Run the compare once more and read **All stages**.
2. Say ship, revise, or reject in one or two sentences.
   - Ship only if the cost fell and the necessary checks are still in the skills.
   - Revise if a check was dropped, or a retry is still unpriced.
   - Reject if the rewrite costs more, or the criteria are no longer in the call.
3. Be ready to answer one of these:
   - Which file did you keep even though a shorter file estimated cheaper?
   - Which stage moved because you changed the prompt rather than the skill?
   - Which cut would have come back as a missing check, a missing audit row, or another call?

Open `course/reference/` only after that recommendation, and only if the trainer asks you to compare your decision with the key.

## Ground rules

- `.github/` and `course/baseline/` stay unchanged. They are the inherited measurement.
- Your amendments go in `course/work/`. That folder is ignored by git, so it will not clutter your changes.
- Do not change files in `src/` or `test/`. The app is context for the decision.
