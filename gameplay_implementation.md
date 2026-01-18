# Gameplay Implementation Checklist

This file tracks incremental build steps for the game. Specs stay in
`cat_chaos_gameplay.md` and `cat_chaos_specs.md`.

## Workflow

- For each task: I run `npm run lint` first, then you run manual checks.
- We mark the item `[x]` only after both automated + manual checks pass.

## Checklist

- [x] Baseline UI shell (panel, board zones, score bar) — Files:
  `components/CatChaosGame.tsx`, `components/RoomAssets.tsx`, `app/page.tsx`
  | Automated: `npm run lint` | Manual: load page, verify layout + urgency sort.
- [ ] Core state model (cats, needs, timers, active cat, action windows) —
  Files: `components/CatChaosGame.tsx` | Automated: lint | Manual: devtools
  state sanity (no runtime errors).
- [ ] Active Cat selection + keyboard wiring (highlight, instruction line,
  clear on completion) — Files: `components/CatChaosGame.tsx` | Automated: lint
  | Manual: click cat, press keys, verify active clears.
- [ ] Food bowl flow (click bowl → press `F` ×N, progress + timeout) — Files:
  `components/CatChaosGame.tsx`, `components/RoomAssets.tsx` | Automated: lint
  | Manual: complete feed + fail case.
- [ ] Water bowl flow (click bowl → press `W` ×N, progress + timeout) — Files:
  `components/CatChaosGame.tsx`, `components/RoomAssets.tsx` | Automated: lint
  | Manual: complete water + fail case.
- [ ] Play flow (click toy → press `P` ×N, progress + timeout) — Files:
  `components/CatChaosGame.tsx`, `components/RoomAssets.tsx` | Automated: lint
  | Manual: complete play + fail case.
- [ ] Pet flow (press `T` on Active Cat, progress if needed) — Files:
  `components/CatChaosGame.tsx` | Automated: lint | Manual: pet success/fail.
- [ ] No No flow (`N` presses, warning → break) — Files:
  `components/CatChaosGame.tsx`, `components/RoomAssets.tsx` | Automated: lint
  | Manual: prevent + miss twice.
- [ ] Scoring + streak + event log — Files: `components/CatChaosGame.tsx`
  | Automated: lint | Manual: verify points add/subtract and log order.
- [ ] Round progression schedule (1 cat rounds 1-3, 2 cats 4-8, 3 cats 9-16,
  4 cats 17-26, 4 cats 27+) — Files: `components/CatChaosGame.tsx`
  | Automated: lint | Manual: simulate round advance.
- [ ] Difficulty scaling (press counts, timer speed, disaster chance) — Files:
  `components/CatChaosGame.tsx` | Automated: lint | Manual: spot-check values.
- [ ] Cat movement + trajectory (targets per need) — Files:
  `components/CatChaosGame.tsx`, `components/RoomAssets.tsx`
  | Automated: lint | Manual: watch movement toward targets.
- [ ] Catnip mode (3+ cats only, 40s check, max 1) — Files:
  `components/CatChaosGame.tsx` | Automated: lint | Manual: trigger + observe.
- [ ] Pause system (modal, freeze timers) — Files: `components/CatChaosGame.tsx`
  | Automated: lint | Manual: pause/resume timing.
- [ ] Thought bubbles (mirror panel info only) — Files:
  `components/CatChaosGame.tsx`, `components/RoomAssets.tsx`
  | Automated: lint | Manual: verify no extra info vs panel.
- [ ] UX hints (no Active Cat prompt, key labels on cards) — Files:
  `components/CatChaosGame.tsx` | Automated: lint | Manual: confirm prompts.

## Spec Alignment Log

- [x] Feature 1 checked against `cat_chaos_gameplay.md` UI Layout + Right Panel Behavior
  and `cat_chaos_specs.md` UI Layout (Right Panel + Top Bar).
- [x] Features 2-7 checked against `cat_chaos_gameplay.md` Game Board Actions,
  Active Cat Mode, Disaster Prevention, and Action Requirements sections.
