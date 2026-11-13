# Walkthrough: Copilot workflow optimisation

Two-hour course on GitHub Copilot. The trainer spends 80 minutes taking one feature request through every stage. Delegates then spend 40 minutes repeating that loop on their own copy.

Work from the root of this repository. Node.js 20 or newer is enough. There is no install.

The feature is SR-142, request priority on an inherited service desk. The inherited Copilot setup loads a catch-all skill at every stage. The rewritten setup leaves that skill out and loads one focused skill per stage.

Figures below are the sample as it stands. Re-run the command if a skill file has been edited. Treat them as file estimates. `/context` and `/usage` in Copilot CLI are the meters that match a live session.

## The loop, at every stage

Use this four-step loop for Planning, Skill refinement, Implementation, Testing and review, and Release. Do not skip a stage, and do not rewrite the next stage's skill before the current stage has been priced.

1. **Request.** Read the stage prompt out loud. Say what this call is allowed to do, and what it must not do yet.
2. **Price the current skills.** Show the files this call loads in the baseline workflow. Read the stage tokens and credits from the report before changing anything.
3. **Rewrite.** Decide retain, modify, or leave unused for each skill and agent on that call. Edit the skill, or show the focused skill beside the inherited one. A shorter file is not a win if it drops a check the next call has to put back.
4. **Follow through.** Reprice that stage only. Say whether the acceptance criteria and the necessary checks are still in the call. Name what the next stage is now allowed to load.

Five questions before every Copilot call, including a call the estimator stands in for:

1. What am I asking Copilot to do?
2. What context, skills, or agents will be loaded?
3. Is the existing skill appropriate for this task?
4. What can I leave out of this call?
5. Does the estimated saving still hold once retries and quality are counted?

## Setup

1. Open a terminal in this repository.
2. Confirm Node:

   ```powershell
   node --version
   ```

3. Open `scorecard/index.html` in a browser on the shared screen. Leave it open for the whole session.
4. On the scorecard, type the delegate name, leave the feature as **SR-142: Add request priority management**, and leave the model as **GPT-5.3-Codex** unless the room is standardising on another model.

The sheet starts at the illustrative course figures: **130,000** baseline tokens, **84,000** optimised tokens, **35.4% fewer**. Those numbers are placeholders. The first workflow command replaces them.

Price both workflows once, before the teaching clock, so the report is ready to import:

```powershell
node tools/workflow-usage.mjs compare examples/sr-142/baseline/workflow.json examples/sr-142/optimised/workflow.json --json report.json
```

During the 80 minutes, read one stage at a time. Do not open with the optimised total. That total is the follow-through at the end, after every stage has been rewritten on screen.

## Teaching, 0–80 minutes

The trainer drives. Delegates watch, answer the stage question, and do not edit yet.

### 0–8 — The request lands

1. Read `examples/sr-142/shared/sr-142.md` on the shared screen. Low, Medium, and High. Medium default. API validation. Dashboard filter. Tests. CI.
2. Leave the badge complication unread for now. It arrives during Implementation.
3. Say the loop once: request, price the current skills, rewrite, follow through. Say it will happen five times, once per stage.
4. Confirm the scorecard feature name and model.

Done when the room can say what SR-142 must still do after any cost cut.

### 8–18 — Price the inherited workflow

Purpose: the request is already expensive before anyone writes a line of the feature.

1. Run the compare if `report.json` is not already on disk, then import it.
2. Walk only the baseline column, in stage order. For each stage, name the catch-all `feature-development` skill and say it is loaded again.
3. Read the baseline total: about **11,735** tokens and about **3.49** credits on GPT-5.3-Codex. File context on its own is about **8,150**.
4. Point at Testing and review. The baseline includes an **illustrative** retry of 2,200 input and 900 output. The report labels it. It is not a `/usage` reading.
5. Leave the challenge column visible but do not explain it yet. Each stage below earns one piece of it.

Say this: we are not looking for a cheaper model first. We are looking at which skills this request is sending.

### 18–30 — Planning

1. **Request.** Read `examples/sr-142/baseline/prompts/planning.md`. This call produces a plan for a one-field change. It does not implement the API.
2. **Price.** In the imported report, open Planning. The baseline loads the always-on instructions, the feature request, the planning skill, and the catch-all feature-development skill. File context is about **1,446**.
3. **Rewrite.** Open `examples/sr-142/baseline/skills/feature-planning/SKILL.md` beside `examples/sr-142/optimised/skills/feature-planning/SKILL.md`. The inherited skill surveys the whole repository. The rewrite plans the priority field only. Leave `feature-development` unused on this call. Estimate the pair:

   ```powershell
   node tools/estimate-tokens.mjs examples/sr-142/baseline/skills/feature-planning/SKILL.md examples/sr-142/optimised/skills/feature-planning/SKILL.md
   ```

4. **Follow through.** Challenge planning file context is about **654**. The instructions file is stable, so later stages can price it as cached input. The plan must still name Low, Medium, High, and the Medium default. Those values are what Implementation is allowed to assume.

### 30–42 — Skill refinement

1. **Request.** Read `examples/sr-142/baseline/prompts/skill-refinement.md`. This call decides which skills the rest of the feature will load. It is not a second planning pass.
2. **Price.** Baseline skill refinement sends every local skill and both agents: feature-development, feature-planning, api-development, test-generation, developer, and reviewer.
3. **Rewrite.** On the scorecard notes for Skill refinement, mark each asset out loud: retain, modify, or leave unused. Use the trainer key at the end of this file if the room stalls. The challenge workflow sends only the inherited API skill that is about to be rewritten, plus the instructions and the request. Compare files locally. Do not pay Copilot to reread skills the trainer is already holding open.
4. **Follow through.** Show the one-line trap before anyone treats "shorter" as the rewrite:

   ```powershell
   node tools/estimate-tokens.mjs examples/sr-142/baseline/skills/api-development/SKILL.md examples/sr-142/optimised/skills/api-development/SKILL.md
   node tools/estimate-tokens.mjs examples/sr-142/traps/api-too-short.md examples/sr-142/optimised/skills/api-development/SKILL.md
   ```

   The trap estimates smaller. It also leaves out validation, the allowed values, and the tests to keep, so the follow-up calls are the expensive part. Record those calls as retries. The focused API skill is the one Implementation will load.

### 42–56 — Implementation

1. **Request.** Read `examples/sr-142/baseline/prompts/implementation.md`, then the challenge prompt `examples/sr-142/optimised/prompts/implementation.md`. This call builds the priority field. It does not regenerate the application.
2. **Price.** Baseline implementation loads the catch-all skill, the API skill, the React skill, and the developer agent, and it asks for a fresh repository survey. Read that stage in the report before the rewrite.
3. **Rewrite.** Leave `feature-development` and the developer agent unused. Keep the React skill: it already points at the design system. Load the rewritten API skill. Add `examples/sr-142/shared/instructions/priority.instructions.md` as path-scoped instructions, so the allowed values sit next to the files they affect and not in the always-on instructions.
4. **Follow through.** Halfway through, read the complication in `sr-142.md`: the priority badge uses the existing design-system tones. Low is neutral, Medium is attention, High is urgent. Add that sentence to the challenge prompt, then estimate again before the next call. If Copilot is available, send that call and copy `/usage` into the Implementation observed row. Enter **0** for a bucket that was measured as zero. If the first reply skips service-layer validation, add a retry on the implementation stage and price the follow-up. Do not hide that cost inside the rewritten skill.

   The same instructions file is billed as fresh input on Planning and as cached input here. Say that out loud when you open **Token categories and files**.

### 56–66 — Testing and review

1. **Request.** Read both testing prompts. This call extends the request tests. It does not replace the suite.
2. **Price.** Baseline testing loads the catch-all skill, the broad test skill, the code-review skill, and the reviewer agent, then pays the illustrative retry because the broad skill regenerated unrelated suites and missed priority validation.
3. **Rewrite.** Open the two test skills. The rewrite extends the request tests and keeps the auth and validation tests. Leave the catch-all skill unused. Retain the code-review skill and the reviewer agent: they review the diff and refuse a whole-repository tour.
4. **Follow through.** On the scorecard, set **Testing and review → Necessary checks retained** to **No** and read the warning. The percentages stay on screen. They are not a result to keep. Set the field back to **Not recorded** before the lab. A token cut that drops the existing tests is rejected even when the credit figure falls.

### 66–76 — Release

1. **Request.** Read both release prompts and `examples/sr-142/shared/skills/release-preparation/SKILL.md`. This call writes the note and names the local CI command. There is no production deploy.
2. **Price.** Both sides load the release skill. Only the baseline also reloads the catch-all skill.
3. **Rewrite.** Leave `feature-development` unused. Keep the release skill as it stands: a short note and a local CI result. Do not ask Copilot to restate the implementation.
4. **Follow through.** If Copilot is available, ask only for release notes: user-visible behaviour, the Medium default, and the test command. Record `/usage` on the Release observed row.

   Optional, if the clock allows: change the scorecard model to **Claude Sonnet 5**, show that the token headlines stay put and the credit headlines move, then change it back to **GPT-5.3-Codex**. Output is the expensive bucket. Cached input is the cheap bucket.

### 76–80 — Hand over the loop

1. Read the full compare now. Expect about **11,735** baseline tokens and **4,197** challenge tokens (**64.2% fewer**), and about **3.49** credits against **0.83** (**76.1% fewer credits**). File context is about **8,150** against **3,900**.
2. Say why credits moved further than tokens: output and the testing retry cost more than cached input.
3. Tell the room the next 40 minutes are a different request, SR-263. Same loop, same five stages. The inherited workflow is read-only. `examples/sr-263/reference/` stays closed until a delegate has submitted.

## Lab, 80–120 minutes

Delegates work on SR-263, not on the feature the trainer just rewrote. The brief is `examples/sr-263/LAB.md`. Each person keeps their own scorecard. Copy the CSV at the end.

| Workflow | Role in the lab |
| --- | --- |
| `examples/sr-263/baseline/workflow.json` | The inherited setup. Read it. Do not rewrite it. |
| `my-workflow.json` | The delegate copy. This is the file they price. |
| `examples/sr-263/reference/workflow.json` | Trainer key. Do not put it on the shared screen during the lab. |

### 80–88 — Request and inherited cost

1. Read `examples/sr-263/shared/sr-263.md`, including the complication. Do not explain how to satisfy it.
2. Copy the baseline and price the copy before any edit. The two sides match, so the change is zero. That is the point.

   ```powershell
   Copy-Item examples/sr-263/baseline/workflow.json my-workflow.json
   node tools/workflow-usage.mjs compare examples/sr-263/baseline/workflow.json my-workflow.json --json report.json
   ```

3. Import `report.json`. The feature name on the scorecard becomes SR-263.
4. Ask each delegate to name one file the planning call loads that the acceptance criteria do not need.

Done when the scorecard shows SR-263 and the notes name that file.

### 88–100 — Planning, then skill refinement

Run the loop. Do not edit `baseline/`.

1. Read the baseline planning prompt and the baseline planning skill. Price that stage. Rewrite the prompt as well as the skill if the prompt is where the extra work is.
2. On skill refinement, mark every loaded skill and agent: retain, modify, or leave unused. Compare files locally. Do not send the whole set to Copilot to decide.
3. Estimate one pair before editing the workflow:

   ```powershell
   node tools/estimate-tokens.mjs examples/sr-263/baseline/skills/request-reopen/SKILL.md examples/sr-263/traps/reopen-too-short.md
   ```

4. The trap estimates smaller. Say so if someone treats it as the rewrite. Do not say which inherited file must stay.

Done when `my-workflow.json` no longer loads the catch-all skill on planning, and the notes record at least one file that was kept on purpose.

### 100–112 — Rewrite and follow through Implementation

1. Rewrite the skills the implementation call should load. Point `my-workflow.json` at the new files. Leave the sample skills unchanged.
2. Reprice and import:

   ```powershell
   node tools/workflow-usage.mjs compare examples/sr-263/baseline/workflow.json my-workflow.json --json report.json
   ```

3. Read the Implementation block. The baseline retry is illustrative. It prices a follow-up caused by two skills disagreeing. Delete it from `my-workflow.json` only when the delegate's skills no longer contradict each other. A real follow-up is recorded without `"illustrative": true`.
4. If Copilot is available, send the implementation prompt after the estimate, then copy `/usage` into the observed row.

Done when Implementation has a predicted total, and the notes name who may reopen, the reason rule, where the reason is stored, and that priority does not change. A workflow that only deletes the longest skill is not finished.

### 112–116 — Testing and release

1. Read the testing prompt and the release prompt before rewriting another skill.
2. Set **Completed correctly**, **Acceptance criteria met**, and **Necessary checks retained**.
3. Set **Necessary checks retained** to **Yes** only if the existing resolve tests and comment tests stay in the run. The warning is the result. Do not clear it to improve the percentage.
4. Confirm the release stage is priced from the prompt the delegate would actually send.

Done when both rows have a judgement, and the notes name the new tests and the existing suites that stayed.

### 116–120 — Compare and submit

1. Run the final compare and import it:

   ```powershell
   node tools/workflow-usage.mjs compare examples/sr-263/baseline/workflow.json my-workflow.json --json report.json --markdown scorecard.md
   ```

2. Check three headlines: token change, credit change, and the quality warning.
3. Choose **Copy results as CSV**. If the browser blocks the clipboard, copy from the box under the button.
4. Recommend ship, revise, or reject in one or two sentences. Ship only if the cost fell and the necessary checks stayed. Revise if a check was dropped or a retry is still unpriced. Reject if the rewrite costs more, or the criteria are no longer in the call.

Open `examples/sr-263/reference/` only after the CSV is in. Use it to mark, not to replace the delegate's workflow during the lab.

In the debrief, each delegate answers one of these:

- Which file did you keep even though a shorter file estimated cheaper?
- Which stage moved because you changed the prompt rather than the skill?
- Which cut would have been a false saving because a check, an audit row, or a retry came back?

## When a separate application repository is in the room

Use the same loop. Point the workflow at that repository instead of the sample skills.

1. Copy `examples/sr-142/optimised/workflow.json` to `my-workflow.json`.
2. Change each `path` so it is relative to `my-workflow.json` and lands on the application's `copilot-instructions.md`, `SKILL.md`, and agent files.
3. Mark repository instructions `cache: "stable"`. Mark the skill and the prompt `cache: "fresh"`.
4. At each stage, price the current files, rewrite the skill that stage loads, then follow through before opening the next stage.
5. Keep the baseline workflow as the inherited measurement. Do not edit it during the lab.

## Copilot CLI, when it is installed

Use these beside the estimator, not instead of it. On a stage where you make a live call, do it in Follow through, after the rewrite is priced.

1. In the application workspace, run `/context`. Record the first line and how much is system, tools, and messages.
2. After a call, run `/usage`. Split the reading into input, cached input, cache write, and output if the CLI shows those buckets.
3. Type the four numbers into the matching stage on the scorecard. Use **0** for a bucket that was zero.
4. A file estimate will miss retrieval and tool calls until those costs are in `observed` or `retries`.

Switching model, tools, or reasoning, or leaving a long pause, can invalidate a real Copilot cache. This report is a planning model of that idea.

## Trainer key for the demo (SR-142)

Delegates should reach this by reading. Use it to unblock the demo, not to open the lab. The delegate lab is SR-263. Its key is `examples/sr-263/reference/KEY.md`. Do not show that file during the 40 minutes.

| Asset | Decision | Why |
| --- | --- | --- |
| `feature-development` skill | Leave unused | It plans, edits, tests, reviews, and writes release notes on every call, and it repeats the repository survey. |
| `developer` agent | Leave unused | It tells the model to follow that catch-all survey even when a narrower skill exists. |
| `feature-planning` skill | Modify | The inherited skill analyses the whole repository for a one-field change. |
| `api-development` skill | Modify | The inherited skill tours every route and generates a new suite. The revision names the existing validation pattern. |
| `test-generation` skill | Modify | The inherited skill regenerates the whole application. The revision extends the request tests and keeps the auth and validation tests. |
| `react-components` skill | Retain | It already points at the design system. Load it for the form and the badge only. |
| `code-review` skill | Retain | It reviews the diff against the acceptance criteria. |
| `release-preparation` skill | Retain | It asks for a short note and a local CI result. |
| `reviewer` agent | Retain | It reviews the diff and refuses a whole-repository tour. |
| `priority.instructions.md` | Add, path-scoped | The allowed values and badge tones belong next to the files they affect, not in the always-on instructions. |

## Timing card

| Minutes | Who | Stage |
| --- | --- | --- |
| 0–8 | Trainer | Request lands. Scorecard and model. |
| 8–18 | Trainer | Inherited workflow priced, stage by stage. |
| 18–30 | Trainer | Planning: request, price, rewrite, follow through. |
| 30–42 | Trainer | Skill refinement, including the too-short trap. |
| 42–56 | Trainer | Implementation, including the badge complication. |
| 56–66 | Trainer | Testing and review. A dropped check is rejected. |
| 66–76 | Trainer | Release. Credits versus tokens. |
| 76–80 | Trainer | Full compare. Hand over to SR-263. |
| 80–88 | Delegates | SR-263 request and inherited cost. |
| 88–100 | Delegates | Planning, then skill refinement. |
| 100–112 | Delegates | Rewrite and follow through Implementation. |
| 112–116 | Delegates | Testing and release judgements. |
| 116–120 | Delegates | Compare, CSV, ship / revise / reject. |
