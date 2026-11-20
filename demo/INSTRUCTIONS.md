# Step-by-step instructions

The course is two folders. `demo/` is the trainer demo: the app, the inherited Copilot setup, the SR-142 course files, and the measurement tools. `lab/` is the delegate lab, in the same shape, for SR-263. Node.js 20 or newer. No install. The screen shows the editor, one terminal, and a browser tab for the app.

Stay in `demo/` for the first 80 minutes, and in `lab/` for the last 40. Every path below is inside the folder you have open. Nobody edits `.github/` during the course: the baseline workflow measures it.

The trainer demonstrates SR-142 for 80 minutes. Delegates then do SR-263 for 40 minutes. Do not open `lab/course/reference/` during the lab.

At every stage the move is the same: read what this stage must do, amend the skill, see the difference for that stage only, then go on.

```powershell
node tools/workflow-usage.mjs compare course/baseline/workflow.json course/optimised/workflow.json
```

Read one stage of that output. Do not read **All stages** until the release stage is done.

---

# Trainer demo (SR-142)

The amended files are already in `course/optimised/`. Show the change. Do not edit `.github/` or `course/baseline/`.

## Before the room arrives

1. Open a terminal in `demo/`.
2. Run `node --version`. You need Node.js 20 or newer.
3. Start the app in a second terminal, also in `demo/`, and leave it running:

   ```powershell
   npm test
   npm start
   ```

   `npm test` should report every test passing, including the app's 32. Open http://localhost:3000 and sign in as Amira Khan.
4. In the first terminal, run the compare command above once, so you know it works. Close the output. You will run it again on screen, one stage at a time.

## 0–7 minutes. The tools are already there

1. Show the dashboard in the browser: requests, owners, and status badges. Then run `npm test` and point at `test/auth.test.mjs` and `test/validation.test.mjs`. Say that the application already exists, with its tests.
2. Open the `.github/` folder in the explorer. Point at the always-on instructions, the seven skills, and the two agents. Say they are already written so the next change can reuse them. Do not open a file yet.
3. Say that a new request has arrived, and those skills were not written for it.
4. Say this line, and leave it: reuse is the goal. Running the skills as they stand is not the first move.
5. Ask the room: would you run the request on the skills already in the repo, or read them first?

Do not open a skill file yet. Do not run the compare.

## 7–18 minutes. The language

Teach these five words. Stop after the fifth.

1. **Spec.** What the request must do. The acceptance criteria.
2. **Skill.** A reusable file that tells Copilot how to carry out a kind of task.
3. **Prompt.** The ask for this one call.
4. **Stage.** One step: plan, choose the skills, implement, test, or release.
5. **Workflow.** The stages in order, and which skills each stage loads.

Then say the link:

1. Read the spec first.
2. Then choose the skill that can carry that task out.
3. A skill that does not match the spec still runs. The output then includes work the spec never asked for.

Mention an agent only as a role file that can follow a skill or override a narrower one. Do not open an agent file yet.

## 18–26 minutes. Reuse, and the engineer's job

1. Say that a skill is written once and loaded again, on the next stage and on the next request.
2. Say that a wide skill reused on every stage makes every output wider. Reuse is a saving only when the skill still matches the spec.
3. Say the job: the tools may already be in place. The engineer updates them so they are minimal and fitted to this spec, before the process runs. The job is knowing how to go about the fix.
4. Write the four steps where the room can see them:
   1. Read what this stage must do, from the spec.
   2. Amend the skill so it carries out that task and nothing wider.
   3. See the difference.
   4. Only then go on to the next stage.
5. If the room is quiet, ask: what would you check before you let Copilot run on a skill you did not write for this request?

## 26–32 minutes. SR-142 is the spec

1. Open `course/sr-142.md` and read it aloud.
2. Stop before the badge complication. That arrives during Implementation.
3. Leave these on screen: Low, Medium, and High; selectable on create and edit; validated and stored; filterable on the dashboard; existing requests default to Medium; tests and CI. Point at the dashboard: today it has a status filter and status badges, and no priority.
4. Open `.github/skills/feature-development/SKILL.md`. Show that it plans, edits, tests, reviews, and writes release notes, and that the baseline workflow loads it at every stage.
5. Close it. Ask someone to point at one line of the spec and say whether a planning skill has to carry that line.

## 32–40 minutes. Planning

1. Open `course/baseline/prompts/planning.md`. Point at the sentences that ask for a repository survey, the tests, and the release notes. Say this call only plans a one-field change.
2. Open `.github/skills/feature-planning/SKILL.md` beside `course/optimised/skills/feature-planning/SKILL.md`.
3. Say what you removed: the whole-repository survey. Say what you kept: the priority field, the Medium default, and the tests to extend. Say you left `feature-development` off this call.
4. Run:

   ```powershell
   node tools/estimate-tokens.mjs .github/skills/feature-planning/SKILL.md course/optimised/skills/feature-planning/SKILL.md
   ```

5. Run the compare. Read only the **Planning** block. Inherited file context is about 1,448. Amended file context is about 654. Confirm the amended plan still names Low, Medium, High, and the Medium default.
6. Stop. Do not open Implementation.

## 40–50 minutes. Skill refinement

1. Open `course/baseline/prompts/skill-refinement.md`. Say this call chooses which skills the rest of the feature will load. It is not a second plan.
2. Say the inherited call sends every skill and both agents. The amended call sends only the API skill that is about to be rewritten.
3. For each asset, say retain, modify, or leave unused. If the room stalls, use the trainer key at the end of `WALKTHROUGH.md`. Do not put that table on the shared screen at the start.
4. Open the one-line trap before anyone treats "shorter" as the amendment. Run:

   ```powershell
   node tools/estimate-tokens.mjs .github/skills/api-development/SKILL.md course/optimised/skills/api-development/SKILL.md
   node tools/estimate-tokens.mjs course/traps/api-too-short.md course/optimised/skills/api-development/SKILL.md
   ```

5. Open `course/traps/api-too-short.md` and `course/optimised/skills/api-development/SKILL.md`. Read the lines the trap does not have: validation, the allowed values, and the tests to keep.
6. Run the compare. Read only the **Skill refinement** block.

## 50–62 minutes. Implementation

1. Open `course/baseline/prompts/implementation.md`, then `course/optimised/prompts/implementation.md`.
2. Say what this call may do: add priority to the API and the form. It does not survey the repository, regenerate the suite, or invent a colour scale.
3. Show the amended call: `feature-development` and the developer agent are unused. The UI components skill stays. The rewritten API skill is loaded. Open `course/optimised/instructions/priority.instructions.md`. Its `applyTo` names `src/api/requests/**` and `src/ui/dashboard/**`. Open `src/api/requests` and `src/ui/dashboard` so the room sees the files it will sit beside. It is not in the always-on instructions.
4. Run the compare. Read only the **Implementation** block.
5. Now open the complication in `course/sr-142.md`. The badge uses the existing tones: Low is neutral, Medium is attention, High is urgent.
6. Add that sentence to the amended prompt on screen. Run the compare again before any live call.
7. If Copilot is available, send that prompt in a live copy of the app (the commands are in `WALKTHROUGH.md`, under "A live Copilot call against the app") and read `/usage`. If the reply skips service-layer validation, say the follow-up call is part of the cost.

## 62–70 minutes. Testing and review

1. Open `.github/skills/test-generation/SKILL.md` beside `course/optimised/skills/test-generation/SKILL.md`.
2. Say the inherited skill regenerates the suite. The amended skill extends the request tests and keeps the auth and validation tests. Open `test/` and point at `auth.test.mjs` and `validation.test.mjs`. Those are the files the amended skill keeps in the run.
3. Say `feature-development` is unused. The code-review skill and the reviewer agent stay.
4. Run the compare. Read only the **Testing and review** block.
5. Point at the inherited retry of 2,200 input and 900 output. Say the report labels it illustrative. It is not a `/usage` reading.
6. Say that if a rewrite drops the existing tests, the smaller number is not a result. The missing lines are in the skill file.

## 70–76 minutes. Release

1. Open both release prompts and `.github/skills/release-preparation/SKILL.md`.
2. Say this call writes the note and names the local CI command: `npm test`, the same command `.github/workflows/ci.yml` runs. Nothing is deployed.
3. Do not rewrite the release skill. It is already a short note and a local CI result. Leave `feature-development` unused. The amended prompt asks for user-visible behaviour, the Medium default, and the test command.
4. Run the compare. Read only the **Release** block. Both sides load the release skill. Only the inherited side also reloads the catch-all skill.

## 76–80 minutes. The whole request, then hand over

1. Run the compare if it is not already on screen.
2. Now read **All stages**. Expect about 11,744 inherited tokens and 4,204 amended tokens (64.2% fewer), and about 3.49 credits against 0.84. Say these only now.
3. Say credits moved further than tokens because output and the testing retry cost more than a reused skill.
4. Tell the room the next 40 minutes are a different spec, SR-263, in the `lab/` folder. Same steps. `lab/course/baseline/` and `lab/.github/` are read-only. `lab/course/reference/` stays closed until they have said ship, revise, or reject.
5. Point them at `lab/course/LAB.md`.

---

# Delegate lab (SR-263)

You have 40 minutes, working in the `lab/` folder. You are not repeating SR-142. The spec is `course/sr-263.md`: reopen a resolved request with a reason.

Leave `.github/` and `course/baseline/` unchanged. They are the inherited measurement. Your amendments go in `course/work/`. Do not open `course/reference/` until you have made your recommendation.

After every stage, run this and read only the stage you just changed:

```powershell
node tools/workflow-usage.mjs compare course/baseline/workflow.json course/work/workflow.json
```

## 80–88 minutes. Meet the app, read the spec, and make your copy

1. Open a terminal in `lab/`.
2. Run the app's tests and look at the app:

   ```powershell
   npm test
   npm start
   ```

   The app's own tests are the 48 that name requests, comments, resolve, and audit. Open http://localhost:3000, sign in as Ben Ortiz, and open REQ-2001. It is Resolved, with history and comments. Stop the server with Ctrl+C and stay in `lab/`.
3. Open `.github/`. Count the skills and agents. Open `copilot-instructions.md` and find the route catalog.
4. Read `course/sr-263.md`, including the complication at the bottom. Do not change a file yet.
5. Copy the inherited workflow folder. The copy sits beside `baseline/`, so every path in it still resolves:

   ```powershell
   Copy-Item -Recurse course/baseline course/work
   ```

6. Open `course/work/workflow.json`. Find the Planning stage. Name one file that call loads which the acceptance criteria do not need. Write that name down. Do not delete it until you have read the skill.

## 88–96 minutes. Planning

1. Open `course/work/prompts/planning.md` and `.github/skills/feature-planning/SKILL.md`.
2. From the spec, write down what a plan for this request must name, and what it must not draft yet.
3. Amend the planning skill, the planning prompt, or both. Edit the prompt in `course/work/prompts/` directly. Write a rewritten skill to `course/work/skills/feature-planning/SKILL.md`, then change that path in the Planning stage of `work/workflow.json` from `../../.github/skills/feature-planning/SKILL.md` to `skills/feature-planning/SKILL.md`.
4. Take `feature-development` off this stage if the spec does not need it on a planning call.
5. Run the compare. Read only **Planning**.
6. Check the amended plan still contains the rules the spec requires. If a rule is missing, put it back before you open the next stage.

## 96–102 minutes. Skill refinement

1. Open `course/work/prompts/skill-refinement.md`.
2. Open each skill and agent that this stage loads. For each one, write retain, modify, or leave unused, and one reason taken from the spec.
3. Compare a file with the short drafts before you adopt one:

   ```powershell
   node tools/estimate-tokens.mjs .github/skills/request-reopen/SKILL.md course/traps/reopen-too-short.md
   ```

   Also open `course/traps/skip-audit.md`. A smaller estimate is not a finished rewrite. Read what each draft leaves out, then decide.
4. Change the Skill refinement stage in `work/workflow.json` so it loads only the files you are actually rewriting. Compare the others locally.
5. Run the compare. Read only **Skill refinement**.

## 102–110 minutes. Implementation

1. Read the complication in `course/sr-263.md` again before you edit.
2. Open `course/work/prompts/implementation.md` and the skills that stage loads.
3. Amend the skills this call should load. Point the Implementation stage at your files. The reopen route belongs in `src/api/requests/`. Open `comments.mjs` and `../audit/log.mjs` there to see the comment API and the audit table the spec says to reuse. A path-scoped instructions file goes in `course/work/instructions/` with `applyTo` set to the folder it should sit beside.
4. If two loaded skills disagree, do not leave both instructions in force. The baseline retry prices that disagreement. Remove that retry from `work/workflow.json` only when your skills no longer contradict each other. If you make a real follow-up call, record it without `"illustrative": true`.
5. Run the compare. Read only **Implementation**.
6. In your notes, write who may reopen a request, the reason rule, where the reason is stored, and whether priority changes. If any of those are missing from the skill, the stage is not finished. Deleting the longest skill is not the finish either.
7. If Copilot is available, send the implementation prompt only after this compare, in a live copy of the lab app with your files copied into its `.github/` (see "A live Copilot call against the app" in `WALKTHROUGH.md`). Read `/usage`, then run `npm test` in that copy. The resolve and comment tests have to stay green.

## 110–116 minutes. Testing and review, then release

1. Open the testing prompt and both the inherited test skill and the skills that stage loads. Read the release prompt before you rewrite another skill.
2. Amend the test skill so the new cases are there. Keep the existing resolve tests and comment tests named. They are `test/resolve.test.mjs` and `comments.test.mjs`. If those tests are gone, the smaller number on the compare is not a result.
3. Read the release skill before you change it. If it is already the size of the release you need, change the release prompt instead.
4. Run the compare. Read **Testing and review**, then **Release**.

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

Only after that recommendation, open `course/reference/` if the trainer asks you to compare your decision with the key.
