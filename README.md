# Cut AI costs by optimising engineering workflows

A two-hour GitHub Copilot course. The trainer spends 80 minutes on SR-142. Delegates spend 40 minutes on SR-263 in the lab.

This repository is an index. Each folder is a complete package and stands on its own.

| Folder | Who uses it | Open this to |
| --- | --- | --- |
| `demo/` | Trainer | Deliver SR-142. Holds the slides, the walkthrough, and the click-by-click. |
| `lab/` | Delegates | Do SR-263. Holds the delegate brief, `lab/course/LAB.md`. |

Do not hand delegates `demo/`. It contains the SR-142 answers and the trainer key.

## Trainer files, in `demo/`

| File | What it is |
| --- | --- |
| `demo/SLIDES.md` | The slide deck, 0 to 24. |
| `demo/WALKTHROUGH.md` | What to say at each stage, and the timing card. |
| `demo/INSTRUCTIONS.md` | The click-by-click for the 80 minutes. |
| `demo/README.md` | The app, the commands, and the layout. |

## Run it

Node.js 20 or newer. No install.

```powershell
cd demo
npm test
npm start    # http://localhost:3000
```

The same commands work in `lab/`.

## Tests

Each folder's `npm test` runs that application's suite and its measurement tests. The repository's CI workflow runs both.

The measurement tool extends the [Token Delegate Lab](https://github.com/AndySmithQA/Token-delegate-lab). Each folder has its own copy of `tools/`.
