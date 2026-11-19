# Walkthrough: Copilot workflow optimisation

Two-hour course on GitHub Copilot. The trainer spends 80 minutes on SR-142. Delegates spend 40 minutes on SR-263.

Work from the root of this repository. Node.js 20 or newer is enough. There is no install. The shared screen is the editor and one terminal.

SR-142 is request priority on an inherited service desk. The inherited setup loads a catch-all skill at every stage. The amended setup leaves that skill out and loads one focused skill per stage.

Figures below are file estimates for the sample as it stands. Re-run the command if a skill has been edited. `/context` and `/usage` in Copilot CLI are the meters that match a live call.

## What the trainer does at every stage

Two moves, and then the next stage. Do not open the amended total until the last stage is done.

1. **Amend.** Open the inherited skill. Show the amended skill beside it. Say what you removed, what you kept, and which acceptance criterion is still in the file.
2. **See the difference.** Run the compare and read only that stage. Inherited tokens, amended tokens, and whether the criterion is still named.

```powershell
node tools/workflow-usage.mjs compare examples/sr-142/baseline/workflow.json examples/sr-142/optimised/workflow.json
```

To compare two skill files on their own:

```powershell
node tools/estimate-tokens.mjs examples/sr-142/baseline/skills/api-development/SKILL.md examples/sr-142/optimised/skills/api-development/SKILL.md
```

A shorter file is not a win if it drops a check the next call has to put back.

## Setup

```powershell
node --version
```

Leave the baseline files unchanged during the demo. The amended files are already in `examples/sr-142/optimised/`. You are showing the amendment, not discovering it live, unless you want to type the change on screen.

## Teaching, 0–80 minutes

Delegates watch. They do not edit until the lab.

The first 26 minutes are the language and the job. No compare yet. Slides 0–7.

### 0–7 — The tools are already there

1. The application exists. Skills and agents are already written so the next change can reuse them.
2. A new request has arrived. Those skills were not written for it.
3. Say the line: reuse is the goal. Running the skills as they stand is not the first move.

### 7–18 — The language, and the spec

Teach five words, and stop there.

| Word | Meaning in this room |
| --- | --- |
| Spec | What the request must do. The acceptance criteria. |
| Skill | A reusable file that tells Copilot how to carry out a kind of task. |
| Prompt | The ask for this one call. |
| Stage | One step: plan, choose the skills, implement, test, or release. |
| Workflow | The stages in order, and which skills each stage loads. |

An agent is a role file. Mention it only as something that can follow a skill or override a narrower one. Do not open the agent files yet.

Then the link: read the spec, then choose the skill that can carry that task out. A skill that does not match the spec still runs, and the output includes work the spec never asked for.

### 18–26 — Use, reuse, and the engineer's job

1. A skill is written once and loaded again, on the next stage and the next request. That is the point of skills.
2. A wide skill reused on every stage makes every output wider. Reuse is a saving only when the skill still matches the spec.
3. Discussion, before any file is edited. The tools may already be in place. The engineer updates them so they are minimal and fitted to this spec, before the process runs. The job is knowing how to go about the fix.
4. The steps you will repeat: read what this stage must do, amend the skill, see the difference, then the next stage.

Chat, if the room is quiet: what would you check before you let Copilot run on a skill you did not write for this request?

### 26–32 — SR-142 is the spec

1. Read `examples/sr-142/shared/sr-142.md`. Low, Medium, and High. Medium default. API validation. Dashboard filter. Tests. CI.
2. Leave the badge unread. It arrives during Implementation.
3. Open `examples/sr-142/baseline/skills/feature-development/SKILL.md` only long enough to show a skill that was written for any feature, and is loaded at every stage.

Done when the room can point at one line of the spec and say whether this stage's skill has to carry it.

### 32–40 — Planning

1. **Amend.** Open `examples/sr-142/baseline/skills/feature-planning/SKILL.md` beside `examples/sr-142/optimised/skills/feature-planning/SKILL.md`. The inherited skill surveys the whole repository. The amended skill plans the priority field only. Leave `feature-development` off this call. Read `examples/sr-142/baseline/prompts/planning.md` and point at the sentences that ask for the survey, the tests, and the release notes.
2. **See the difference.**

   ```powershell
   node tools/estimate-tokens.mjs examples/sr-142/baseline/skills/feature-planning/SKILL.md examples/sr-142/optimised/skills/feature-planning/SKILL.md
   ```

   Then read only the **Planning** block of the compare. Inherited file context is about **1,446**. Amended file context is about **654**. The plan still has to name Low, Medium, High, and the Medium default.

### 40–50 — Skill refinement

1. **Amend.** Read `examples/sr-142/baseline/prompts/skill-refinement.md`. The inherited call sends every skill and both agents. The amended call sends only the API skill that is about to be rewritten. For each asset, say retain, modify, or leave unused. Use the trainer key if the room stalls.
2. **See the difference.** Show the one-line trap before anyone treats "shorter" as the amendment:

   ```powershell
   node tools/estimate-tokens.mjs examples/sr-142/baseline/skills/api-development/SKILL.md examples/sr-142/optimised/skills/api-development/SKILL.md
   node tools/estimate-tokens.mjs examples/sr-142/traps/api-too-short.md examples/sr-142/optimised/skills/api-development/SKILL.md
   ```

   The trap estimates smaller. It also leaves out validation, the allowed values, and the tests to keep. Open both files and read the lines the trap does not have. Then read only the **Skill refinement** block of the compare.

### 50–62 — Implementation

1. **Amend.** Read `examples/sr-142/baseline/prompts/implementation.md`, then `examples/sr-142/optimised/prompts/implementation.md`. Leave `feature-development` and the developer agent unused. Keep the React skill. Load the rewritten API skill. Add `examples/sr-142/shared/instructions/priority.instructions.md` beside the files it affects, not in the always-on instructions.
2. **See the difference.** Read only the **Implementation** block.
3. Then read the complication in `sr-142.md`: the badge uses the existing tones. Low is neutral, Medium is attention, High is urgent. Add that sentence to the amended prompt and run the compare again before any live Copilot call. If Copilot is available, send that call and read `/usage` in the terminal. If the reply skips service-layer validation, say so. That follow-up is part of the cost.

### 62–70 — Testing and review

1. **Amend.** Open the two test skills. The inherited skill regenerates the suite. The amended skill extends the request tests and keeps the auth and validation tests. Leave the catch-all skill unused. Keep the code-review skill and the reviewer agent.
2. **See the difference.** Read only the **Testing and review** block. The inherited side includes an illustrative retry of 2,200 input and 900 output, because the broad skill missed priority validation. The report labels it. It is not a `/usage` reading. If a rewrite drops the existing tests, say the smaller number is not a result. The tests are still missing in the file.

### 70–76 — Release

1. **Amend.** Read both release prompts and `examples/sr-142/shared/skills/release-preparation/SKILL.md`. The release skill is already a short note and a local CI result. Do not rewrite it. Leave `feature-development` unused. The amended prompt asks for user-visible behaviour, the Medium default, and the test command. Nothing is deployed.
2. **See the difference.** Read only the **Release** block. Both sides load the release skill. Only the inherited side also reloads the catch-all skill.

### 76–80 — The whole request, then hand over

1. Read **All stages**. Expect about **11,735** inherited tokens and **4,197** amended tokens (**64.2% fewer**), and about **3.49** credits against **0.83**. Say this only after every stage has been amended on screen. Credits moved further than tokens because output and the testing retry cost more than a skill that is reused.
2. The next 40 minutes are SR-263. Same two moves, same five stages. The baseline stays read-only. `examples/sr-263/reference/` stays closed until a delegate has finished.

## Lab, 80–120 minutes

Delegates work on SR-263. The brief they read is `examples/sr-263/LAB.md`.

| File | Role |
| --- | --- |
| `examples/sr-263/baseline/workflow.json` | Inherited setup. Read it. Do not rewrite it. |
| `my-workflow.json` | The delegate's copy. This is the file they amend. |
| `examples/sr-263/reference/` | Trainer key. Closed until the delegate has finished. |

### 80–88 — Read the request

1. Read `examples/sr-263/shared/sr-263.md`, including the complication. Do not explain how to satisfy it.
2. Copy the baseline:

   ```powershell
   Copy-Item examples/sr-263/baseline/workflow.json my-workflow.json
   ```

3. Ask each delegate to name one file the planning call loads that the acceptance criteria do not need.

### 88–112 — Amend each stage, then look at that stage

Work in order: Planning, skill refinement, implementation, testing and review, release. After each amendment, run:

```powershell
node tools/workflow-usage.mjs compare examples/sr-263/baseline/workflow.json my-workflow.json
```

Read only the stage just changed.

Before anyone treats the shortest file as the amendment:

```powershell
node tools/estimate-tokens.mjs examples/sr-263/baseline/skills/request-reopen/SKILL.md examples/sr-263/traps/reopen-too-short.md
```

The trap estimates smaller. Say so if someone uses it. Do not say which inherited file must stay.

Point `my-workflow.json` at the rewritten skills. Leave `baseline/` unchanged. The inherited implementation retry is illustrative. Remove it from the copy only when the two skills no longer disagree.

Done when the amended implementation still names who may reopen, the reason rule, where the reason is stored, and that priority does not change. A workflow that only deletes the longest skill is not finished.

### 112–120 — Last compare, and the decision

```powershell
node tools/workflow-usage.mjs compare examples/sr-263/baseline/workflow.json my-workflow.json
```

Recommend ship, revise, or reject in one or two sentences. Ship only if the cost fell and the necessary checks are still in the skills. Revise if a check was dropped. Reject if the rewrite costs more, or the criteria are no longer in the call.

Open `examples/sr-263/reference/` only after that recommendation. Use it to mark, not to replace the delegate's files during the lab.

In the debrief, each delegate answers one of these:

- Which file did you keep even though a shorter file estimated cheaper?
- Which stage moved because you changed the prompt rather than the skill?
- Which cut would have come back as a missing check, a missing audit row, or another call?

## When a separate application repository is in the room

Same two moves. Point the workflow at that repository.

1. Copy `examples/sr-142/optimised/workflow.json` to `my-workflow.json`.
2. Change each `path` so it is relative to `my-workflow.json` and lands on that application's instructions, skills, and agents.
3. Amend the skill for one stage, run the compare, and read that stage before opening the next.
4. Keep the baseline workflow as the inherited measurement.

## Copilot CLI, when it is installed

Use it after the amendment, on the stage you just changed.

1. Run `/context` and read the first line.
2. After a call, run `/usage`.
3. If `/usage` is higher than the file estimate, the difference is the real cost of that call. The estimate does not see tool calls until they are recorded.

## Trainer key for the demo (SR-142)

Use this to unblock the demo. The lab key is `examples/sr-263/reference/KEY.md`. Do not show that file during the 40 minutes.

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

| Minutes | Who | What they do |
| --- | --- | --- |
| 0–7 | Trainer | The tools are already there. Reuse is the goal. Do not run yet. |
| 7–18 | Trainer | The language. Spec, skill, prompt, stage, workflow. |
| 18–26 | Trainer | Reuse, then the engineer's job: tune the tools before the process runs. |
| 26–32 | Trainer | SR-142 is the spec. Show the catch-all skill. |
| 32–40 | Trainer | Planning: amend the skill, read the difference. |
| 40–50 | Trainer | Skill refinement, including the too-short file. |
| 50–62 | Trainer | Implementation, then the badge sentence. |
| 62–70 | Trainer | Testing and review. A dropped test is not a saving. |
| 70–76 | Trainer | Release. The release skill stays. The prompt changes. |
| 76–80 | Trainer | All stages, then hand over to SR-263. |
| 80–88 | Delegates | Read SR-263. Copy the baseline. |
| 88–112 | Delegates | Amend each stage, then read that stage. |
| 112–120 | Delegates | Last compare. Ship, revise, or reject. |
