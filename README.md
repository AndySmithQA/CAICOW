# Token usage toolkit

Measurement toolkit for a two-hour GitHub Copilot course. The trainer spends 80 minutes on SR-142. At each stage they amend the skill, then read the difference for that stage. Delegates spend 40 minutes doing the same on SR-263. The run of show is in `WALKTHROUGH.md`.

It extends the [Token Delegate Lab](https://github.com/AndySmithQA/Token-delegate-lab). The 30-minute lab's estimator is here as `tools/estimate-tokens.mjs`: about 4 characters per token, for comparing two files. This folder adds the workflow compare, which prices a feature from planning through to release.

The application the class changes, such as a service-request codebase, stays in its own repository. Point the workflow files at that repository's instructions, skills, agents, and prompts.

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

```powershell
node tools/estimate-tokens.mjs examples/sr-142/baseline/skills/api-development/SKILL.md examples/sr-142/optimised/skills/api-development/SKILL.md

node tools/workflow-usage.mjs compare examples/sr-142/baseline/workflow.json examples/sr-142/optimised/workflow.json
```

`--model` reprices both sides with the same model. `node tools/workflow-usage.mjs models` lists the rates bundled for the lab. `--strict` exits with an error when a stage says necessary checks were removed, acceptance criteria were missed, or the task was not completed.

Read one stage of the compare after you amend that stage. The whole-feature total is for the end of the demo.

## Where it sits in the two hours

GitHub Copilot is the tool the course teaches. The first 80 minutes are the trainer, on the shared screen, taking SR-142 through every stage. The last 40 minutes are the delegate lab.

At each stage the trainer amends the skill, then reads the difference for that stage.

| Minutes | Who | What |
| --- | --- | --- |
| 0–8 | Trainer | The request lands. Show the catch-all skill. |
| 8–30 | Trainer | Planning: amend the skill, read the difference. |
| 30–42 | Trainer | Skill refinement, including the too-short file. |
| 42–56 | Trainer | Implementation, then the badge sentence. |
| 56–66 | Trainer | Testing and review. A dropped test is not a saving. |
| 66–76 | Trainer | Release. The release skill stays. The prompt changes. |
| 76–80 | Trainer | All stages, then hand over to SR-263. |
| 80–120 | Delegates | Same two moves on SR-263. Ship, revise, or reject. |

Before each Copilot call: what is being asked, which skill or agent is loaded, whether that skill fits, what can be left out, and whether the estimated saving still holds once retries and quality are counted.

## Sample: SR-142

The sample feature is request priority on an inherited service desk. The baseline workflow loads a catch-all feature-development skill at every stage. The challenge workflow leaves that skill out and loads one focused skill per stage.

The focused API skill is longer than `examples/sr-142/traps/api-too-short.md` and shorter than the inherited API skill. The one-line file estimates smaller. It also leaves out validation, the allowed values, and the tests to keep, so the follow-up calls are the expensive part. Record those calls as retries rather than treating the short file as the win.

The baseline testing stage includes an illustrative retry. The report labels it. Replace it with a `/usage` reading before quoting the result.

Example replies under `outputs/` are there so the sample has an output estimate. They are not live Copilot responses.

The delegate lab is a second feature, `examples/sr-263/`. Same five stages, harder choices. The brief is `examples/sr-263/LAB.md`. The trainer key is `examples/sr-263/reference/KEY.md`.

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
node --test
```
