# Cut AI costs by optimising engineering workflows

A two-hour GitHub Copilot course. The trainer spends the first 26 minutes on the workflow language and the engineer's job: tune the skills to the spec before the process runs. The rest of the first 80 minutes is SR-142, one stage at a time. Delegates spend 40 minutes doing the same job on SR-263. The run of show is in `WALKTHROUGH.md`. The step-by-step is in `INSTRUCTIONS.md`. The slides are in `SLIDES.md`.

The course is two folders. Each one is a complete package: the ServiceFlow app, its inherited Copilot setup in `.github/`, the course files in `course/`, and the measurement tools in `tools/`. Open one folder and everything for that half of the course is inside it.

| Folder | Who opens it | What is inside |
| --- | --- | --- |
| `demo/` | Trainer | ServiceFlow before SR-142, the inherited skills and agents, and `course/` with the amended skills. |
| `lab/` | Delegates | ServiceFlow a few releases later, before SR-263. Priority, approval, comments, and an audit table have shipped. `course/LAB.md` is the brief. `course/reference/` is the trainer key and stays closed during the lab. |

Neither folder needs an install. Node.js 20 or newer.

```powershell
cd demo
npm test
npm start
```

`npm start` serves that folder's app on http://localhost:3000. Leave `.github/` unedited during the course. The baseline workflow measures it, and amendments go in `course/`. To use the tools on your own application, point a workflow file at that repository's instructions, skills, agents, and prompts.

The measurement tool extends the [Token Delegate Lab](https://github.com/AndySmithQA/Token-delegate-lab). `tools/estimate-tokens.mjs` compares two files at about 4 characters per token. `tools/workflow-usage.mjs` prices a feature from planning through to release. Each folder has its own copy, so the demo and the lab can be handed out separately.

## What a delegate measures

For each stage, list the files that call will load:

- repository instructions that are always on
- path-scoped instructions
- the skill or agent loaded on demand
- the prompt itself
- an output estimate, from a draft reply or from `/usage`

Stable files are priced as fresh input, or as a cache write, the first time they appear. Later stages price that same file as cached input. Fresh prompts and skills are priced as input every time. Recorded retries are added as their own calls.

AI credits use GitHub's published per-token rates, copied on 10 November 2026. One credit is $0.01. Input, cached input, cache write, and output are priced separately. Check the [models and pricing page](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing) before a live course.

`/context` and `/usage` remain the meters that match a live session. A file estimate does not see tool calls or retrieval unless those costs are recorded on the stage.

A shorter file is not automatically a better workflow. The report keeps a quality bar: the task completed, the acceptance criteria met, and the necessary tests and security checks retained.

## Run it

Node.js 20 or newer. No install.

From the `demo/` folder:

```powershell
node tools/estimate-tokens.mjs .github/skills/api-development/SKILL.md course/optimised/skills/api-development/SKILL.md

node tools/workflow-usage.mjs compare course/baseline/workflow.json course/optimised/workflow.json
```

`--model` reprices both sides with the same model. `node tools/workflow-usage.mjs models` lists the rates bundled for the lab. `--strict` exits with an error when a stage says necessary checks were removed, acceptance criteria were missed, or the task was not completed.

Read one stage of the compare after you amend that stage. The whole-feature total is for the end of the demo.

## Where it sits in the two hours

GitHub Copilot is the tool the course teaches. The first 80 minutes are the trainer, on the shared screen, taking SR-142 through every stage. The last 40 minutes are the delegate lab.

The opening teaches the words and the link from spec to skill. Reuse is the goal. The engineer updates the tools before the process runs. Then each stage is an amendment and a look at the difference.

| Minutes | Who | What |
| --- | --- | --- |
| 0–7 | Trainer | The tools are already there. Reuse is the goal. |
| 7–18 | Trainer | The language: spec, skill, prompt, stage, workflow. |
| 18–26 | Trainer | The engineer's job: tune the tools before the process runs. |
| 26–40 | Trainer | SR-142 as the spec, then Planning. |
| 40–50 | Trainer | Skill refinement, including the too-short file. |
| 50–62 | Trainer | Implementation, then the badge sentence. |
| 62–70 | Trainer | Testing and review. A dropped test is not a saving. |
| 70–76 | Trainer | Release. The release skill stays. The prompt changes. |
| 76–80 | Trainer | All stages, then hand over to SR-263. |
| 80–120 | Delegates | Same two moves on SR-263. Ship, revise, or reject. |

Before each Copilot call: what is being asked, which skill or agent is loaded, whether that skill fits, what can be left out, and whether the estimated saving still holds once retries and quality are counted.

## Sample: SR-142

The sample feature is request priority, in the `demo/` folder. The baseline workflow loads the app's catch-all feature-development skill at every stage. The challenge workflow leaves that skill out and loads one focused skill per stage.

The focused API skill is longer than `demo/course/traps/api-too-short.md` and shorter than the inherited API skill. The one-line file estimates smaller. It also leaves out validation, the allowed values, and the tests to keep, so the follow-up calls are the expensive part. Record those calls as retries rather than treating the short file as the win.

The baseline testing stage includes an illustrative retry. The report labels it. Replace it with a `/usage` reading before quoting the result.

Example replies under `outputs/` are there so the sample has an output estimate. They are not live Copilot responses.

The delegate lab is the `lab/` folder. Same five stages, harder choices. Delegates copy `course/baseline/` to `course/work/` and amend there. The brief is `lab/course/LAB.md`. The trainer key is `lab/course/reference/KEY.md`.

## Your own workflow

Paths are relative to the workflow file.

```json
{
  "feature": "SR-142: Add request priority management",
  "label": "Challenge",
  "model": "gpt-5.3-codex",
  "stages": [
    {
      "id": "implementation",
      "name": "Implementation",
      "files": [
        { "path": "../../app/.github/copilot-instructions.md", "role": "always-on", "cache": "stable" },
        { "path": "../../app/.github/skills/api-development/SKILL.md", "role": "on-demand", "cache": "fresh" },
        { "path": "prompts/implementation.md", "role": "prompt", "cache": "fresh" }
      ],
      "outputTokens": 800,
      "effectiveness": {
        "completedCorrectly": "unknown",
        "correctiveInteractions": 0,
        "acceptanceCriteriaMet": "unknown",
        "necessaryChecksRetained": "yes",
        "notes": ""
      }
    }
  ]
}
```

`cache` is `stable` or `fresh`. `role` is `always-on`, `path-scoped`, `on-demand`, `prompt`, or `requirements`. Use `outputFile` or `outputTokens`, not both. Set `outputKind` to `example-reply` when the output file is a draft rather than an observed response.

An observed reading sits beside the estimate:

```json
"observed": {
  "inputTokens": 1400,
  "cachedInputTokens": 600,
  "cacheWriteTokens": 0,
  "outputTokens": 900,
  "source": "Copilot CLI /usage"
}
```

To record a follow-up call:

```json
"retries": [
  { "reason": "Validation was missing from the first reply", "inputTokens": 900, "outputTokens": 400 }
]
```

Add `"illustrative": true` when the number is a teaching figure rather than a reading.

## Tests

```powershell
cd demo
npm test

cd ..\lab
npm test
```

`npm test` in a folder runs that app's suite and that folder's measurement tests. It is the command the app's `.github/workflows/ci.yml` runs.
