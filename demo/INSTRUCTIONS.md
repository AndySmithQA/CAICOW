# Trainer instructions: SR-142 (80 minutes)

This is the click-by-click for the trainer. `SLIDES.md` says what is on screen. `WALKTHROUGH.md` says what to say and why. Keep the terminal in this folder for the whole 80 minutes. Node.js 20 or newer. No install.

Rules for the demo:

- Do not edit `.github/` or `course/baseline/`. They are the measurement.
- The amended skills are already in `course/optimised/`. You show them, you do not type them, with one exception.
- The one live edit happens in a copy, `course/work/`, at minute 58 (slide 16).
- Do not hand this folder to delegates. `course/optimised/` is the SR-142 answer. Hand out `lab/` only.

## Before the room arrives

1. In a terminal in `demo/`, run `node --version`. You need 20 or newer.
2. Run `npm test`. Every test should pass: the app's 32 and the 11 measurement tests. If one fails, fix it before the room arrives.
3. In a second terminal in `demo/`, run `npm start` and leave it running. Open http://localhost:3000 and sign in as Amira Khan.
4. In the first terminal, run the compare once and close the output:

   ```powershell
   node tools/workflow-usage.mjs compare course/baseline/workflow.json course/optimised/workflow.json
   ```

   The **All stages** block should read about 11,744 inherited and 4,204 amended tokens. If it does not, a file has changed. Do not use the figures in the notes until you have found out why.
5. Clear any copy left from a previous run:

   ```powershell
   Remove-Item -Recurse -Force course/work -ErrorAction SilentlyContinue
   ```

## 0–7 minutes. The tools are already there (slides 0 and 1)

1. Show the dashboard in the browser. Point at the requests, the owners, and the status badges. Say: this is a working application.
2. In the first terminal, run `npm test`. Wait for the summary. In the explorer, open `test/auth.test.mjs` and `test/validation.test.mjs`. Say: these tests exist already, and the next change must keep them.
3. In the explorer, open `.github/`. Point at the always-on instructions, the seven skills, and the two agents. Say they are written, so the next change can reuse them. Do not open a file.
4. Ask the room: would you run the request on these skills as they stand, or read them first? Do not run the compare.

## 7–26 minutes. Language, reuse, and the engineer's job (slides 2 to 6)

No commands. Use the slides and the speaker notes. Slide 6 shows the four steps. Leave it up until SR-142 is on screen.

## 26–32 minutes. SR-142 is the spec (slide 7)

1. Open `course/sr-142.md` and read it aloud. Stop before the badge line.
2. Show the dashboard again. Point at the status filter. Say there is no priority yet.
3. Open `.github/skills/feature-development/SKILL.md` for about 30 seconds. Say it plans, edits, tests, reviews, and writes release notes, and the inherited workflow loads it at every stage.
4. Close it.

## 32–40 minutes. Planning (slides 8 to 10)

1. Open `course/baseline/prompts/planning.md`. Point at the sentences that ask for a survey, tests, and release notes.
2. **App anchor:** open `src/api/requests/service.mjs`. Say: create and update live here. This call plans changes to those two functions and the form, not a survey of the whole app.
3. Open `.github/skills/feature-planning/SKILL.md` beside `course/optimised/skills/feature-planning/SKILL.md`.
4. Run:

   ```powershell
   node tools/estimate-tokens.mjs .github/skills/feature-planning/SKILL.md course/optimised/skills/feature-planning/SKILL.md
   ```

5. Run the compare. Read only the **Planning** block: about 1,448 inherited and 654 amended file context. Confirm the amended plan still names Low, Medium, High, and the Medium default.
6. Stop. Do not open Implementation.

## 40–50 minutes. Skill refinement (slides 11 to 13)

1. Open `course/baseline/prompts/skill-refinement.md`. Say this call chooses which skills the rest of the feature loads.
2. For each asset, say retain, modify, or leave unused. Use the trainer key in `WALKTHROUGH.md` only if the room stalls.
3. Run both lines. The first is the inherited API skill against the focused one. The second is the one-line trap against the focused one:

   ```powershell
   node tools/estimate-tokens.mjs .github/skills/api-development/SKILL.md course/optimised/skills/api-development/SKILL.md
   node tools/estimate-tokens.mjs course/traps/api-too-short.md course/optimised/skills/api-development/SKILL.md
   ```

4. **App anchor:** open `test/validation.test.mjs`. Say: the focused skill keeps this file in the run. The one-line trap says nothing about validation, so it would not.
5. Open `course/traps/api-too-short.md` and `course/optimised/skills/api-development/SKILL.md` side by side. Read the lines the trap does not have.
6. Run the compare. Read only the **Skill refinement** block.

## 50–62 minutes. Implementation (slides 14 to 16)

1. Open `course/baseline/prompts/implementation.md`, then `course/optimised/prompts/implementation.md`.
2. Say what this call may do: add priority to the API and the form. It does not survey the repository or invent a colour scale.
3. Show the amended call. `feature-development` and the developer agent are unused. The UI components skill stays. The rewritten API skill is loaded.
4. Open `course/optimised/instructions/priority.instructions.md`. Its `applyTo` names `src/api/requests/**` and `src/ui/dashboard/**`.
5. **App anchors:** open `src/api/requests/validation.mjs`, where validation goes, and `src/ui/dashboard/page.mjs`, where the status badge is built today. Say the priority badge goes next to it.
6. Run the compare. Read only the **Implementation** block.

### Minute 58: the live edit (slide 16)

This is the only edit you type on screen. It happens in a copy, so the baseline and the optimised files stay as they are.

1. Make the copy. The paths still resolve because the copy sits at the same depth:

   ```powershell
   Copy-Item -Recurse course/optimised course/work
   ```

2. Open `course/work/prompts/implementation.md`. Delete the sentence "Badge tones come from the path-scoped priority instructions." The prompt now has no badge rule, which is what a draft that missed the complication looks like. Save.
3. Run the compare on the copy and read only the **Implementation** block:

   ```powershell
   node tools/workflow-usage.mjs compare course/baseline/workflow.json course/work/workflow.json
   ```

4. Type this sentence at the end of the same prompt, and save: "Badge tones: Low is neutral, Medium is attention, High is urgent, from the design system."
5. Run the same compare again and read the **Implementation** block. The difference is the price of the complication. Say that number out loud. It is small, and it is cheaper than the follow-up call the complication would otherwise cause.

   Rehearsed figures (Implementation, revised file context): 924 before the edit, 909 after the deletion, 932 after the typed line. If yours differ, a file has changed since the rehearsal.
6. If Copilot is available, send the prompt in a live copy of the app (see "A live Copilot call against the app" in `WALKTHROUGH.md`). Read `/usage`. If the reply skips service-layer validation, say the follow-up call is part of the cost.

Do not paste the typed sentence back into `course/optimised/`. The pre-written figures are the reference. The copy is the live example.

## 62–70 minutes. Testing and review (slides 17 and 18)

1. Open `course/baseline/prompts/testing-review.md` and `course/optimised/prompts/testing-review.md`.
2. Open `.github/skills/test-generation/SKILL.md` beside `course/optimised/skills/test-generation/SKILL.md`. Say the inherited skill regenerates the suite. The amended skill extends the request tests and keeps the auth and validation tests.
3. **App anchor:** in the first terminal, run `npm test` again. Say: the amended skill is the thing that stops an agent regenerating these files. The check is only as good as the skill that keeps it in the run.
4. Run the compare. Read only the **Testing and review** block. The inherited retry of 2,200 input and 900 output is labelled illustrative. Say so.
5. Say that if a rewrite removes the existing tests, the smaller number is not a result (slide 18). Open the amended test skill and point at the lines that keep them.

## 70–76 minutes. Release (slide 19)

1. Open both release prompts and `.github/skills/release-preparation/SKILL.md`.
2. **App anchor:** open `.github/workflows/ci.yml`. Say: the CI workflow runs the same `npm test` you ran on screen. Nothing is deployed.
3. Do not rewrite the release skill. Leave `feature-development` unused.
4. Run the compare and read only the **Release** block. Both sides load the release skill. Only the inherited side also reloads the catch-all skill.

## 76–80 minutes. The whole request, then hand over (slides 20 and 21)

1. Run the compare and read **All stages**: about 11,744 inherited tokens against 4,204 amended (64.2% fewer), and about 3.49 credits against 0.84. Say these only now.
2. Say credits fell further than tokens, because output and the testing retry cost more than a reused skill.
3. Tell the room the next 40 minutes are SR-263, in the `lab/` folder. Same steps. `lab/course/reference/` stays closed until they have said ship, revise, or reject.
4. Stop the server in the second terminal with Ctrl+C.

## Before you hand out the lab

1. Give delegates the `lab/` folder only.
2. Delete `lab/course/reference/` from the copy you hand out, if the machines should not hold the trainer key. Keep your own copy.
3. Check that `lab/` runs: `npm test` in that folder should pass.
