# Slide deck: Cut the cost of a Copilot workflow

Twenty-five slides for the two-hour session. Slide 0 sets the scene the delegates walk into. Slides 1–21 support the 80-minute trainer demonstration on SR-142. Slides 22–24 open the 40-minute delegate lab on SR-263.

The trainer works in the editor and the terminal while a slide is up. A slide states the decision. It does not replace the skill file or the compare.

Build rules for every slide:

- One idea. The title is that idea.
- No provider price list, no rate table, and no model catalogue.
- Code on a slide is a file name or a single sentence from a prompt, large enough to read in a virtual classroom.
- The terminal stays on the demo machine. Do not screenshot a full report onto a slide. Read one stage from it.
- Speaker notes carry the numbers. Those numbers are file estimates and will move if a skill is edited. Re-run `node tools/workflow-usage.mjs compare` before the session and correct the notes.

## Slide 0 — The setup is already there. A new request just arrived.

- **On screen:** 0:00–0:05. This is the opening scene, before the title and before SR-142's criteria.
- **Purpose:** Put the delegates in the situation the rest of the session answers.
- **On-slide copy:** Heading: The app is built. The help is already in place. Then a new request arrives.
  Three lines under the heading:
  1. A working application, with its tests.
  2. Skills and agents already written, so Copilot can plan, build, test, and release the next change.
  3. A new request lands on that setup.
  The question, on its own line: Will the help we already have solve this request at a cost we can accept?
  The engineer's move, on its own line: Find out what this request would cost with the current skills, then change the setup where that cost is not earned.
- **Visual:** Left, the application, already standing. Middle, a small set of skill and agent files attached to it. Right, a new request arriving as a card. A question under the three, not a diagram of the answer.
- **Speaker:** The team is not starting from an empty repository. Someone has already written the skills and agents that Copilot loads. Those files were written for the application in general, not for the request that just arrived. Today we treat that inherited help as an engineering decision: keep what this request needs, rewrite what is too broad, and stop loading what this request does not need. We do that one stage at a time, and we check the feature still gets built.
- **Interaction:** Chat. If a new request arrived on your team tomorrow, would you trust the skills already in the repo, or would you read them first?
- **Leave off:** SR-142's criteria. The catch-all skill by name. Any token figure. The four-step loop. That arrives on the next slides, as the way through the question.

## Slide 1 — Cut the cost of a Copilot workflow

- **On screen:** 0:05–0:07, while the room settles.
- **Purpose:** Name the session and the tool.
- **On-slide copy:** Title. One line: a feature request is priced with the skills it loads, then those skills are rewritten, stage by stage. GitHub Copilot. Two hours.
- **Visual:** Five stage names in a row: Planning, Skill refinement, Implementation, Testing and review, Release. No icons that imply a cloud bill.
- **Speaker:** This is a working session on Copilot skills, prompts, and agents. The first 80 minutes are demonstrated. The last 40 are the lab.
- **Leave off:** Learning-objective paragraphs. The course code. Any dollar figure.

## Slide 2 — A request has arrived

- **On screen:** 0:02–0:08. Leave it up while `examples/sr-142/shared/sr-142.md` is on the shared screen.
- **Purpose:** Give the room the feature the demo will not abandon.
- **On-slide copy:** SR-142, add request priority. Five criteria only: Low, Medium, and High; selectable on create and edit; validated and stored by the API; filterable on the dashboard; existing requests default to Medium. Tests and CI.
- **Visual:** The five criteria as a short list. The feature title as the heading.
- **Speaker:** Read the criteria from the file, then show this slide as the reminder. Do not read the badge complication yet.
- **Interaction:** None.
- **Leave off:** The badge colours. The solution. Any skill name.

## Slide 3 — It can work and still cost too much

- **On screen:** a beat inside 0:02–0:08, after the criteria.
- **Purpose:** Separate a working feature from an affordable workflow.
- **On-slide copy:** The inherited skills can produce the feature. They also survey the repository, load a catch-all skill on every stage, and ask for work the criteria do not name.
- **Visual:** Two labels on one request: "Feature can be built" and "This call is doing more than the feature."
- **Speaker:** We are not starting by picking a cheaper model. We are looking at what this request sends.
- **Leave off:** Token totals. The optimised workflow.

## Slide 4 — Two moves at every stage

- **On screen:** 0:08, and again whenever a stage opens.
- **Purpose:** Teach the demo once.
- **On-slide copy:** 1. Amend the skill. 2. See the difference for this stage. Then the next stage.
- **Visual:** Two boxes. The stage name sits above them, blank, so the trainer can say it.
- **Speaker:** We will do this five times on SR-142. Open the inherited skill, show the amended skill, then read only that stage of the compare.
- **Leave off:** A four-step method. A form. A total for the whole feature. That total waits until every stage has been amended.

## Slide 5 — Five stages, one request

- **On screen:** with slide 4, still before 0:18.
- **Purpose:** Show that the request is not one Copilot call.
- **On-slide copy:** Planning decides the change. Skill refinement decides what later calls load. Implementation makes the change. Testing and review checks it. Release writes the note. Each stage is priced on its own.
- **Visual:** The five names, each with the one-line job above. An arrow from Release back to the loop, labelled "the next request."
- **Speaker:** A saving on Planning that pushes the work into Implementation is not a saving yet.
- **Leave off:** File trees.

## Slide 6 — Price the inherited workflow first

- **On screen:** 0:08–0:18, behind the terminal.
- **Purpose:** Make the baseline the thing being beaten.
- **On-slide copy:** Heading: Inherited cost, before any rewrite. Three words under it: stage, files loaded, tokens. A blank fourth line labelled "after the rewrite" with nothing in it.
- **Visual:** A five-row table with the baseline column filled in the speaker notes, not on the slide. The rewrite column is an empty track.
- **Speaker:** Run the compare and read the inherited side of one stage only when you are about to amend that stage. Name the catch-all `feature-development` skill when it appears. Do not read the amended total yet. The testing retry is illustrative, not a `/usage` reading.
- **Leave off:** The 64% figure. The optimised column. A rate card.

## Slide 7 — What the price is made of

- **On screen:** a beat inside 0:08–0:18, when the trainer opens Token categories on Planning.
- **Purpose:** Give the room four buckets so later stages are readable.
- **On-slide copy:** Fresh input. Cached input, for a stable file that already appeared. Output. Retries, as their own calls. A stable instruction is paid for on the first stage, then reused.
- **Visual:** Four short bars labelled with those names. No axis scale. Output and retries marked as the expensive buckets. Cached input marked as the cheap bucket.
- **Speaker:** When the compare shows the same instructions file as fresh input on Planning and cached input later, say that once. A file estimate misses tool calls until a live `/usage` is read.
- **Leave off:** The per-token rate table. Model names other than the one the room is using.

## Slide 8 — Planning: what this call may do

- **On screen:** 0:18, at the start of Planning.
- **Purpose:** Bound the stage before showing its cost.
- **On-slide copy:** This call produces a plan for a one-field change. It does not implement the API, write the tests, or write the release notes.
- **Visual:** The stage name, and a single line quoted from the acceptance criteria: existing requests default to Medium.
- **Speaker:** Open `examples/sr-142/baseline/prompts/planning.md` and read it. Ask the room which sentence asks for work this stage should not do.
- **Interaction:** Chat. One sentence from the prompt that does not belong in a plan.
- **Leave off:** The rewritten prompt.

## Slide 9 — Planning: price, then rewrite

- **On screen:** 0:18–0:28, while the two planning skills are side by side.
- **Purpose:** Show the inherited cost and the edit.
- **On-slide copy:** Inherited call loads the planning skill and the catch-all skill, and it asks for a repository survey. Rewrite: plan the priority field only. Leave the catch-all skill unused on this call.
- **Visual:** Two file names, inherited and rewritten. Three words under the rewritten file: field, default, tests to extend.
- **Speaker:** Read the Planning block. File context is about 1,446 inherited. Run `estimate-tokens.mjs` on the two planning skills. Then show the rewritten skill. Do not open the other stages.
- **Leave off:** The full skill text on the slide. The later-stage totals.

## Slide 10 — Planning: follow through

- **On screen:** 0:28–0:30.
- **Purpose:** Close the stage before leaving it.
- **On-slide copy:** Reprice this stage only. The plan still names Low, Medium, High, and the Medium default. The instructions file is stable, so the next stage can treat it as cached.
- **Visual:** The two moves, with "See the difference" highlighted, and Low, Medium, High, and the Medium default listed as what the amended plan still names.
- **Speaker:** Challenge planning file context is about 654. Say that number only after the rewrite is visible. The criteria that must survive are the handoff, not a new piece of work.
- **Leave off:** Implementation's files.

## Slide 11 — Skill refinement: this call chooses what later calls load

- **On screen:** 0:30–0:34.
- **Purpose:** Stop the room treating this stage as a second planning pass.
- **On-slide copy:** The request is: which skills should the rest of this feature load? The inherited call sends every skill and both agents.
- **Visual:** A stack of file names from the baseline skill-refinement stage. No sizes yet.
- **Speaker:** Open the baseline prompt and the file list in the report. Say that comparing files the trainer already has open does not need to be a Copilot call.
- **Leave off:** The retain / modify / leave unused answers. Those are the next slide, revealed after the room has seen the list.

## Slide 12 — Retain, modify, or leave unused

- **On screen:** 0:34–0:38.
- **Purpose:** Make the decision vocabulary stick.
- **On-slide copy:** Three labels only: Retain. Modify. Leave unused. One line under them: a skill that does not match this request is left on disk, not loaded.
- **Visual:** Three columns. The trainer fills one asset per column out loud. Do not pre-fill the columns on the slide.
- **Speaker:** Walk the trainer key in the walkthrough only as far as the room needs to get unstuck. The decisions to say if the chat stalls: leave `feature-development` and the developer agent unused; modify planning, API, and test generation; retain React, code review, release, and the reviewer agent.
- **Interaction:** Chat. One asset, and one of the three labels, with a reason from the file.
- **Leave off:** A completed answer key on the slide itself.

## Slide 13 — A shorter file can cost more

- **On screen:** 0:38–0:42.
- **Purpose:** Stop "smallest estimate" being the rewrite.
- **On-slide copy:** The one-line skill estimates smaller than the focused API skill. It also drops validation, the allowed values, and the tests to keep. The follow-up call is the expensive part. Record it as a retry.
- **Visual:** Three files in a row: inherited API skill, one-line trap, focused API skill. The trap is visibly the shortest. A caption: shortest is not the result.
- **Speaker:** Run the two `estimate-tokens.mjs` commands from the walkthrough. Open `examples/sr-142/traps/api-too-short.md` and the focused skill. Read the lines the trap does not have.
- **Leave off:** A claim that the focused skill is the minimum possible length.

## Slide 14 — Implementation: what this call may do

- **On screen:** 0:42–0:46.
- **Purpose:** Bound the build stage.
- **On-slide copy:** This call adds priority to the API and the form. It does not survey the repository again, regenerate the suite, or invent a colour scale.
- **Visual:** The stage name and the criteria that belong to this call: validate in the service, default Medium, filter on the dashboard.
- **Speaker:** Read the baseline implementation prompt, then the challenge prompt. Ask which inherited sentence creates the extra cost.
- **Interaction:** Chat. One sentence to delete from the inherited prompt.
- **Leave off:** The badge complication. It is the next slide, after this call has a price.

## Slide 15 — Implementation: what to stop loading

- **On screen:** 0:46–0:52.
- **Purpose:** Show the rewrite of the call, not a new feature.
- **On-slide copy:** Leave the catch-all skill and the developer agent unused. Keep the React skill. Load the rewritten API skill. Add the priority instructions as path-scoped, next to the files they affect.
- **Visual:** A before/after file list for this stage only. Path-scoped is a label on one file, not a new stage.
- **Speaker:** Read the Implementation block of the report before and after. Show `priority.instructions.md` and say why it is not in the always-on instructions.
- **Leave off:** The whole-workflow percentage.

## Slide 16 — A new constraint arrives. Price it before the next call

- **On screen:** 0:52–0:56.
- **Purpose:** Show follow-through when the request changes mid-stage.
- **On-slide copy:** The priority badge uses the existing design-system tones. Low is neutral, Medium is attention, High is urgent. Add that sentence, then estimate again, then call Copilot.
- **Visual:** The two moves, with both highlighted. The three tones as text, not as a made-up palette.
- **Speaker:** Read the complication from `sr-142.md`. Add it to the amended prompt on screen, then run the compare again. If Copilot is available, send the call and read `/usage` in the terminal. If the reply skips service-layer validation, say that the follow-up is part of the cost.
- **Leave off:** A new colour scale. A production deploy.

## Slide 17 — Testing: the inherited call pays twice

- **On screen:** 0:56–1:02.
- **Purpose:** Connect a broad skill to a retry.
- **On-slide copy:** This call extends the request tests. It does not replace the suite. The inherited call loads the catch-all skill and the broad test skill, then pays a retry because priority validation was missed.
- **Visual:** The stage, plus a second chip labelled "Retry" sitting beside it. The chip says "illustrative, until a live call replaces it."
- **Speaker:** Open both test skills. The rewrite extends the request tests and keeps the auth and validation tests. Leave the catch-all skill unused. Keep the code-review skill and the reviewer agent.
- **Leave off:** A fake `/usage` number presented as measured.

## Slide 18 — A cheaper run can be the wrong result

- **On screen:** 1:02–1:06.
- **Purpose:** Show the quality bar rejecting a token cut.
- **On-slide copy:** If the existing auth and validation tests were removed to shrink the prompt, the cut is not a saving. The percentages can stay on screen. They are not the result.
- **Visual:** Large text: "Not a saving: the existing tests are no longer in the skill."
- **Speaker:** Open the amended test skill and show the auth and validation tests still named. If they were deleted, the smaller number on the compare is not the result. Point at the missing lines in the file.
- **Interaction:** None. Do not invite the room to clear the warning.
- **Leave off:** A green percentage beside the warning.

## Slide 19 — Release: rewrite the call, not the feature

- **On screen:** 1:06–1:12.
- **Purpose:** Show a stage where the right skill is already the right size.
- **On-slide copy:** This call writes the note and names the local CI command. Nothing is deployed. Both sides load the release skill. Only the inherited call also reloads the catch-all skill.
- **Visual:** Two file lists. The release skill appears on both. The catch-all skill appears on one.
- **Speaker:** Read both release prompts and the release skill. Leave `feature-development` unused. Do not ask Copilot to restate the implementation. If there is a live call, the note covers user-visible behaviour, the Medium default, and the test command.
- **Leave off:** A production pipeline. A second rewrite of the release skill.

## Slide 20 — Tokens and credits do not move together

- **On screen:** 1:12–1:16, optional model switch included if the clock allows.
- **Purpose:** Explain the gap between the two headlines.
- **On-slide copy:** Credits move further than tokens when output and retries shrink, because those buckets cost more than cached input. Changing the model changes the credits and leaves the token count where it is.
- **Visual:** Two headlines with blank numbers, labelled Tokens and Credits. The speaker writes the SR-142 figures in the notes, not as a baked-in image: about 11,735 against 4,197 tokens (64.2% fewer), about 3.49 credits against 0.83 (76.1% fewer).
- **Speaker:** Say those figures only after every stage has been amended on screen. Read them from the **All stages** block of the compare.
- **Leave off:** A ranking of models. A recommendation to switch model as the optimisation.

## Slide 21 — The loop is the thing to reuse

- **On screen:** 1:16–1:20.
- **Purpose:** Hand the method to the room before the lab.
- **On-slide copy:** Amend the skill. See the difference. Then the next stage. SR-142 is finished. The lab is a different request.
- **Visual:** The two moves, with SR-142 marked done and SR-263 named as the lab. No hint of the SR-263 answer.
- **Speaker:** Baseline workflows stay read-only. Edits go in `my-workflow.json`. The reference folder stays closed until the delegate has made a recommendation.
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
