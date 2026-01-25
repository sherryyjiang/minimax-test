# Gameplay Implementation Checklist

This file tracks incremental build steps for the game. Specs stay in
`cat_chaos_gameplay.md` and `cat_chaos_specs.md`.

## Current Mode: SIMPLIFIED (Single Cat Testing)

**Status:** Active - cat spawning is disabled to allow isolated testing of core mechanics.

### What's Different in Simplified Mode:
- Only ONE cat spawns at game start (Mochi)
- No additional cats spawn over time
- All core mechanics remain active (needs, bowls, toys, disasters)
- **Round system implemented:** Each round has specific actions to complete
- **Input model:** arrow keys to move; action keys to complete (no click-and-mash)
- Perfect for testing individual action flows without distraction

### Round System (Implemented):
- Each round shows required actions (e.g., 🍖 hunger, 💧 water)
- Round 1-3: 1 action per round (intro/onboarding)
- Round 4+: 1-2 actions per round
- Complete all actions → Round advances automatically
- HUD shows current round number and action checklist
- Brief "Round X" banner appears between rounds

### To Re-enable Full Mode:
1. Open `components/CatChaosGame.tsx`
2. Find the commented-out "Add new cat periodically" section (around line 500)
3. Uncomment the entire `useEffect` block
4. Remove the "Simplified Mode" banner from the title section

---

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
- [ ] Food flow (move to bowl → press `F` ×N, progress + timeout) — Files:
  `components/CatChaosGame.tsx`, `components/RoomAssets.tsx` | Automated: lint
  | Manual: complete feed + fail case.
- [ ] Water flow (move to bowl → press `W` ×N, progress + timeout) — Files:
  `components/CatChaosGame.tsx`, `components/RoomAssets.tsx` | Automated: lint
  | Manual: complete water + fail case.
- [ ] Play flow (move to toy → press `P` ×N, progress + timeout) — Files:
  `components/CatChaosGame.tsx`, `components/RoomAssets.tsx` | Automated: lint
  | Manual: complete play + fail case.
- [ ] Pet flow (press `T`, progress if needed) — Files:
  `components/CatChaosGame.tsx` | Automated: lint | Manual: pet success/fail.
- [ ] No No flow (`N` presses, fails when cat reaches item, no success points) — Files:
  `components/CatChaosGame.tsx`, `components/RoomAssets.tsx` | Automated: lint
  | Manual: prevent + miss twice.
- [ ] Scoring + streak + event log — Files: `components/CatChaosGame.tsx`
  | Automated: lint | Manual: verify points add/subtract and log order.
- [x] Round progression schedule (simplified: 1 action rounds 1-3, 1-2 actions 4+)
  — Files: `components/CatChaosGame.tsx` | Automated: lint | Manual: complete
  actions, verify round advances with banner.
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
