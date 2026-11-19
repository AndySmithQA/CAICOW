# Slide deck: Cut the cost of a Copilot workflow

Twenty-five slides for the two-hour session. Slides 0–6 teach the language and the engineer's job. Slide 7 turns that into the SR-142 spec. Slides 8–21 are the stage demonstrations. Slides 22–24 open the 40-minute delegate lab on SR-263.

The trainer works in the editor and the terminal while a slide is up. A slide states the decision. It does not replace the skill file or the compare.

Build rules for every slide:

- One idea. The title is that idea.
- No provider price list, no rate table, and no model catalogue.
- Code on a slide is a file name or a single sentence from a prompt, large enough to read in a virtual classroom.
- The terminal stays on the demo machine. Do not screenshot a full report onto a slide. Read one stage from it.
- Speaker notes carry the numbers. Those numbers are file estimates and will move if a skill is edited. Re-run `node tools/workflow-usage.mjs compare` before the session and correct the notes.

## Slide 0 — The tools are already there. A new request has arrived.

- **On screen:** 0:00–0:05.
- **Purpose:** Set the scene. Reuse is the goal. The engineer does not run the process yet.
- **On-slide copy:** Heading: The app is built. The skills are already written. A new request arrives.
  Three lines:
  1. A working application, with its tests.
  2. Skills and agents already in place, ready to be used again.
  3. A new request, which those skills were not written for.
  Closing line: Reuse is the goal. Running them as they stand is not the first move.
- **Visual:** The application, the skill files attached to it, and a request card that has not been started.
- **Speaker:** We are not starting from an empty repository. The skills exist so the next change can reuse them. The job in this room is to decide whether those tools fit this request before anyone runs the workflow.
- **Interaction:** Chat. Would you run the request on the skills already in the repo, or read them first?
- **Leave off:** SR-142's criteria. Token figures. The stage-by-stage edits.

## Slide 1 — Cut the cost of a Copilot workflow

- **On screen:** 0:05–0:07.
- **Purpose:** Name the session.
- **On-slide copy:** Title. One line: understand the workflow, tune the skills to the spec, then run. GitHub Copilot. Two hours.
- **Visual:** Two parts. Part 1: the language. Part 2: the request, stage by stage.
- **Speaker:** The first part is how a workflow is spoken about, and how a spec connects to the skills that carry it out. The second part is SR-142, where we update those skills before the process runs. The last 40 minutes are the lab.
- **Leave off:** The course code. Any dollar figure.

## Slide 2 — The language

- **On screen:** 0:07–0:14.
- **Purpose:** Give the room the words used for the rest of the session.
- **On-slide copy:** Five words, each with one line.
  - **Spec.** What this request must do. The acceptance criteria.
  - **Skill.** A reusable file that tells Copilot how to carry out a kind of task.
  - **Prompt.** The ask for this one call.
  - **Stage.** One step: plan, choose the skills, implement, test, or release.
  - **Workflow.** The stages in order, and which skills each stage loads.
- **Visual:** The five words in a column. Spec at the top, workflow at the bottom, with a line from spec to skill.
- **Speaker:** An agent is a role file. It can tell Copilot to follow a skill, or to ignore a narrower one. We will meet agents when a skill is not the only file on the call. Stay with these five words until SR-142 is on screen.
- **Leave off:** File paths. The catch-all skill. Token buckets.

## Slide 3 — The spec chooses the skill

- **On screen:** 0:14–0:18.
- **Purpose:** Connect understanding the spec to the skill that should carry it out.
- **On-slide copy:** Read the spec first. Then ask which skill can carry out that task. A skill that does not match the spec still runs. The output then includes work the spec never asked for.
- **Visual:** Spec on the left, skill on the right, an arrow only when they match. A second skill sits unconnected, labelled "loaded anyway."
- **Speaker:** Understanding the spec is what lets you pick, keep, or rewrite a skill. If you skip that reading, reuse loads the wrong tool and the output grows.
- **Leave off:** A worked example from SR-142. That is the next part of the hour.

## Slide 4 — Use a skill again. Tune it first.

- **On screen:** 0:18–0:22.
- **Purpose:** Say what reuse does to the output.
- **On-slide copy:** A skill is written once and loaded again, on the next stage and on the next request. That is the point of having skills. A skill reused unchanged is only a saving when it still matches the spec. A wide skill, reused on every stage, makes every output wider.
- **Visual:** One skill file with arrows into several stages. One arrow is marked "fits." The others are marked "too wide."
- **Speaker:** Reuse is the final goal, not the first action. Loading yesterday's skill on today's request can be the expensive choice. The output is optimised when the skill that gets reused is the one that fits.
- **Leave off:** A percentage. A model comparison.

## Slide 5 — The engineer's job

- **On screen:** 0:22–0:26. This is a discussion, not a demo.
- **Purpose:** Name the role before any file is edited.
- **On-slide copy:** Heading: The tools may already be in place. Reuse is still the goal.
  The job: update the tools so they are minimal and fitted to this spec, before the process runs.
  One line under it: A software engineer knows how to go about fixing the problem.
- **Visual:** A sequence of three marks. Tools in place. Engineer updates them. Then the process runs.
- **Speaker:** We do not throw the skills away, and we do not hope they already fit. The fix is a way of working: read the spec, see what this stage would load, change the skill or leave it unused, and only then run the call. That is the same job on the next request, which is why the tuned skill can be reused.
- **Interaction:** Chat. What would you check before you let Copilot run on a skill you did not write for this request?
- **Leave off:** The answer key for SR-142.

## Slide 6 — The steps, before the process runs

- **On screen:** 0:26, and again at the start of each stage.
- **Purpose:** Give the room the steps the demos will follow.
- **On-slide copy:** For each stage: 1. Read what this stage must do, from the spec. 2. Amend the skill so it carries out that task and nothing wider. 3. See the difference. 4. Only then go on to the next stage.
- **Visual:** Four short steps. Step 4 is "next stage," not "run the whole feature."
- **Speaker:** We will do this on SR-142, five times. The compare is how we see the difference. We do not start the next stage until this skill matches the spec.
- **Leave off:** The whole-feature total. That waits until the last stage.

## Slide 7 — A request has arrived

- **On screen:** 0:26–0:32. Leave it up while `examples/sr-142/shared/sr-142.md` is read.
- **Purpose:** Turn the language into this spec.
- **On-slide copy:** SR-142, add request priority. Low, Medium, and High. Selectable on create and edit. Validated and stored. Filterable on the dashboard. Existing requests default to Medium. Tests and CI.
- **Visual:** The criteria as the spec. A caption: which skill can carry this out?
- **Speaker:** Read the file. Do not read the badge yet. Ask which of these lines a planning skill must keep, and which lines are not this stage's job. The inherited skills can build the feature. Several of them also survey the repository and load a catch-all skill on every stage.
- **Leave off:** The badge colours. The rewritten skill. Any token total.

## Slide 8 — Planning: what this call may do

- **On screen:** 0:32, at the start of Planning.
- **Purpose:** Bound the stage before showing its cost.
- **On-slide copy:** This call produces a plan for a one-field change. It does not implement the API, write the tests, or write the release notes.
- **Visual:** The stage name, and a single line quoted from the acceptance criteria: existing requests default to Medium.
- **Speaker:** Open `examples/sr-142/baseline/prompts/planning.md` and read it. Ask the room which sentence asks for work this stage should not do.
- **Interaction:** Chat. One sentence from the prompt that does not belong in a plan.
- **Leave off:** The rewritten prompt.

## Slide 9 — Planning: price, then rewrite

- **On screen:** 0:32–0:38, while the two planning skills are side by side.
- **Purpose:** Show the inherited cost and the edit.
- **On-slide copy:** Inherited call loads the planning skill and the catch-all skill, and it asks for a repository survey. Rewrite: plan the priority field only. Leave the catch-all skill unused on this call.
- **Visual:** Two file names, inherited and rewritten. Three words under the rewritten file: field, default, tests to extend.
- **Speaker:** Read the Planning block. File context is about 1,446 inherited. Run `estimate-tokens.mjs` on the two planning skills. Then show the rewritten skill. Do not open the other stages.
- **Leave off:** The full skill text on the slide. The later-stage totals.

## Slide 10 — Planning: follow through

- **On screen:** 0:38–0:40.
- **Purpose:** Close the stage before leaving it.
- **On-slide copy:** Reprice this stage only. The plan still names Low, Medium, High, and the Medium default. The instructions file is stable, so the next stage can treat it as cached.
- **Visual:** The two moves, with "See the difference" highlighted, and Low, Medium, High, and the Medium default listed as what the amended plan still names.
- **Speaker:** Challenge planning file context is about 654. Say that number only after the rewrite is visible. The criteria that must survive are the handoff, not a new piece of work.
- **Leave off:** Implementation's files.

## Slide 11 — Skill refinement: this call chooses what later calls load

- **On screen:** 0:40–0:44.
- **Purpose:** Stop the room treating this stage as a second planning pass.
- **On-slide copy:** The request is: which skills should the rest of this feature load? The inherited call sends every skill and both agents.
- **Visual:** A stack of file names from the baseline skill-refinement stage. No sizes yet.
- **Speaker:** Open the baseline prompt and the file list in the report. Say that comparing files the trainer already has open does not need to be a Copilot call.
- **Leave off:** The retain / modify / leave unused answers. Those are the next slide, revealed after the room has seen the list.

## Slide 12 — Retain, modify, or leave unused

- **On screen:** 0:44–0:48.
- **Purpose:** Make the decision vocabulary stick.
- **On-slide copy:** Three labels only: Retain. Modify. Leave unused. One line under them: a skill that does not match this request is left on disk, not loaded.
- **Visual:** Three columns. The trainer fills one asset per column out loud. Do not pre-fill the columns on the slide.
- **Speaker:** Walk the trainer key in the walkthrough only as far as the room needs to get unstuck. The decisions to say if the chat stalls: leave `feature-development` and the developer agent unused; modify planning, API, and test generation; retain React, code review, release, and the reviewer agent.
- **Interaction:** Chat. One asset, and one of the three labels, with a reason from the file.
- **Leave off:** A completed answer key on the slide itself.

## Slide 13 — A shorter file can cost more

- **On screen:** 0:48–0:50.
- **Purpose:** Stop "smallest estimate" being the rewrite.
- **On-slide copy:** The one-line skill estimates smaller than the focused API skill. It also drops validation, the allowed values, and the tests to keep. The follow-up call is the expensive part. Record it as a retry.
- **Visual:** Three files in a row: inherited API skill, one-line trap, focused API skill. The trap is visibly the shortest. A caption: shortest is not the result.
- **Speaker:** Run the two `estimate-tokens.mjs` commands from the walkthrough. Open `examples/sr-142/traps/api-too-short.md` and the focused skill. Read the lines the trap does not have.
- **Leave off:** A claim that the focused skill is the minimum possible length.

## Slide 14 — Implementation: what this call may do

- **On screen:** 0:50–0:54.
- **Purpose:** Bound the build stage.
- **On-slide copy:** This call adds priority to the API and the form. It does not survey the repository again, regenerate the suite, or invent a colour scale.
- **Visual:** The stage name and the criteria that belong to this call: validate in the service, default Medium, filter on the dashboard.
- **Speaker:** Read the baseline implementation prompt, then the challenge prompt. Ask which inherited sentence creates the extra cost.
- **Interaction:** Chat. One sentence to delete from the inherited prompt.
- **Leave off:** The badge complication. It is the next slide, after this call has a price.

## Slide 15 — Implementation: what to stop loading

- **On screen:** 0:54–0:58.
- **Purpose:** Show the rewrite of the call, not a new feature.
- **On-slide copy:** Leave the catch-all skill and the developer agent unused. Keep the React skill. Load the rewritten API skill. Add the priority instructions as path-scoped, next to the files they affect.
- **Visual:** A before/after file list for this stage only. Path-scoped is a label on one file, not a new stage.
- **Speaker:** Read the Implementation block of the report before and after. Show `priority.instructions.md` and say why it is not in the always-on instructions.
- **Leave off:** The whole-workflow percentage.

## Slide 16 — A new constraint arrives. Price it before the next call

- **On screen:** 0:58–1:02.
- **Purpose:** Show follow-through when the request changes mid-stage.
- **On-slide copy:** The priority badge uses the existing design-system tones. Low is neutral, Medium is attention, High is urgent. Add that sentence, then estimate again, then call Copilot.
- **Visual:** The two moves, with both highlighted. The three tones as text, not as a made-up palette.
- **Speaker:** Read the complication from `sr-142.md`. Add it to the amended prompt on screen, then run the compare again. If Copilot is available, send the call and read `/usage` in the terminal. If the reply skips service-layer validation, say that the follow-up is part of the cost.
- **Leave off:** A new colour scale. A production deploy.

## Slide 17 — Testing: the inherited call pays twice

- **On screen:** 1:02–1:06.
- **Purpose:** Connect a broad skill to a retry.
- **On-slide copy:** This call extends the request tests. It does not replace the suite. The inherited call loads the catch-all skill and the broad test skill, then pays a retry because priority validation was missed.
- **Visual:** The stage, plus a second chip labelled "Retry" sitting beside it. The chip says "illustrative, until a live call replaces it."
- **Speaker:** Open both test skills. The rewrite extends the request tests and keeps the auth and validation tests. Leave the catch-all skill unused. Keep the code-review skill and the reviewer agent.
- **Leave off:** A fake `/usage` number presented as measured.

## Slide 18 — A cheaper run can be the wrong result

- **On screen:** 1:06–1:10.
- **Purpose:** Show the quality bar rejecting a token cut.
- **On-slide copy:** If the existing auth and validation tests were removed to shrink the prompt, the cut is not a saving. The percentages can stay on screen. They are not the result.
- **Visual:** Large text: "Not a saving: the existing tests are no longer in the skill."
- **Speaker:** Open the amended test skill and show the auth and validation tests still named. If they were deleted, the smaller number on the compare is not the result. Point at the missing lines in the file.
- **Interaction:** None. Do not invite the room to clear the warning.
- **Leave off:** A green percentage beside the warning.

## Slide 19 — Release: rewrite the call, not the feature

- **On screen:** 1:10–1:14.
- **Purpose:** Show a stage where the right skill is already the right size.
- **On-slide copy:** This call writes the note and names the local CI command. Nothing is deployed. Both sides load the release skill. Only the inherited call also reloads the catch-all skill.
- **Visual:** Two file lists. The release skill appears on both. The catch-all skill appears on one.
- **Speaker:** Read both release prompts and the release skill. Leave `feature-development` unused. Do not ask Copilot to restate the implementation. If there is a live call, the note covers user-visible behaviour, the Medium default, and the test command.
- **Leave off:** A production pipeline. A second rewrite of the release skill.

## Slide 20 — Tokens and credits do not move together

- **On screen:** 1:14–1:16.
- **Purpose:** Explain the gap between the two headlines.
- **On-slide copy:** Credits move further than tokens when output and retries shrink, because those buckets cost more than cached input. Changing the model changes the credits and leaves the token count where it is.
- **Visual:** Two headlines with blank numbers, labelled Tokens and Credits. The speaker writes the SR-142 figures in the notes, not as a baked-in image: about 11,735 against 4,197 tokens (64.2% fewer), about 3.49 credits against 0.83 (76.1% fewer).
- **Speaker:** Say those figures only after every stage has been amended on screen. Read them from the **All stages** block of the compare.
- **Leave off:** A ranking of models. A recommendation to switch model as the optimisation.

## Slide 21 — Tune the tool, then it can be reused

- **On screen:** 1:16–1:20.
- **Purpose:** Hand the job to the room before the lab.
- **On-slide copy:** The skills were already there. We updated them to this spec before the process ran. That is how they become reusable. SR-142 is finished. The lab is a different spec, and the same job.
- **Visual:** The four steps from slide 6, with SR-263 named as the next spec. No hint of its answer.
- **Speaker:** The job is knowing how to go about the fix: read the spec, amend the skill, see the difference, then run. Baseline files stay read-only. Edits go in `my-workflow.json`. The reference folder stays closed until the delegate has made a recommendation.
- **Leave off:** SR-263's skill decisions. The trap files.

## Slide 22 — Your request is SR-263

- **On screen:** 1:20–1:24. Leave the criteria up while delegates open the file.
- **Purpose:** Start the lab on a feature they have not watched you solve.
- **On-slide copy:** Reopen a resolved request with a reason. Only Resolved can be reopened. The reporter or the assignee may do it. The reason has at least 15 characters and is stored through the existing comment API. Status becomes Open. Priority is unchanged. One audit row: who, when, and the comment id. Existing resolve tests and comment tests stay.
- **Visual:** The criteria as a list. A footer: same five stages. Amend the skill, then see the difference.
- **Speaker:** Point at `examples/sr-263/LAB.md`. Tell them the complication is in the feature file and they should read it before Implementation. Do not explain how to satisfy it.
- **Leave off:** Which skill to delete. The word "catalog." The traps folder. Any reference-workflow number.

## Slide 23 — What you will hand in

- **On screen:** 1:24, and again at 1:56 when the room is closing the lab.
- **Purpose:** Make the 40-minute output visible.
- **On-slide copy:** Your amended skills. The compare for the stage you changed. One recommendation: ship, revise, or reject. The existing tests are still named, or they are not.
- **Visual:** Five checkboxes matching that list.
- **Speaker:** Ship only if the cost fell and the necessary checks are still in the skills. Revise if a check was dropped. Reject if the rewrite costs more, or the criteria are no longer in the call. Give the timings: 80–88 read the request, 88–112 amend each stage and read that stage, 112–120 last compare and the recommendation.
- **Leave off:** A sample recommendation. The reference totals (about 14,571 against 5,373 tokens, about 3.31 against 1.00 credits). Those belong in the trainer key, not on a lab slide.

## Slide 24 — One thing you would keep, and one thing you would cut

- **On screen:** 1:58–2:00, during the debrief.
- **Purpose:** Close on a decision, not on a percentage.
- **On-slide copy:** Three prompts, one per delegate. Which file did you keep even though a shorter file estimated cheaper? Which stage moved because you changed the prompt rather than the skill? Which cut would have come back as a check, an audit row, or a retry?
- **Visual:** The three questions, large. No answer underneath.
- **Speaker:** Take two or three answers. If a delegate opened the reference, do not put it on the shared screen. End on the loop, which is the thing they can take to the next feature.
- **Leave off:** A ranked list of savings. A badge claim. A homework worksheet.
