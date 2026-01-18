# Cat Chaos: Detailed Gameplay Specification

This document extends `cat_chaos_specs.md` with complete gameplay mechanics, UI layout, and implementation details for a polished, playable game.

---

## UI Layout

### Right Panel (Always Visible, Left Side)

```
┌─────────────────────────────────────┐
│ 🐱 MOCHI             (ACTIVE)     │
│ 😿 Hunger              ⏱️ 12s     │
│ ███████░░ 5 presses needed        │
│ [ FEED ]  Click bowl + press F×5  │
│ [ NO NO ]  Press N×4 (if active)  │
│                                   │
│ Streak: ✨ 3                      │
└─────────────────────────────────────┘

Each cat card shows:
- Cat avatar + name
- Current PRIMARY need (most urgent) with icon
- Progress bar for that need
- Countdown timer for that need
- Primary action button (changes based on need)
- "No No" prompt for disaster prevention (key-based)
```

**Right Panel Behavior:**
- Sort by urgency (most urgent at top)
- Ties keep spawn order
- Each cat has ONE primary action button (not multiple)
- "No No" uses the `N` key for rapid presses (see Active Cat Mode)
- Urgent needs (≤ 5s) pulse and show a small "URGENT" tag to focus attention
- Primary action button always initiates the action:
  - For bowls, it highlights the active bowl and starts the click window
  - For play, it highlights the toy area and starts the input window
  - For pet, it highlights the Active Cat
  - For "No No", it opens the rapid-press window
- Clicking a cat card makes that cat the Active Cat
- Active Cat shows a stronger highlight and an instruction line (e.g., "Press P to play")

### Game Board Actions

**Food Bowl:**
- Activates when the player clicks the bowl while a cat is Active
- Shows required clicks (e.g., "×5" based on hungry cats)
- User clicks the bowl once, then presses `F` rapidly to fill during the active window
- Only one bowl action can be active at a time
- Fail if incomplete when timer ends
- Feedback: "+10 🍖" per successful fill

**Water Bowl:**
- Same as food bowl mechanics (click bowl, then press `W`)
- Feedback: "+5 💧" per successful fill

**Toy Area:**
- Activates when the player clicks a toy while a cat is Active
- User clicks the toy once, then presses `P` rapidly to complete play
- Only one toy action can be active at a time
- Fail if incomplete when timer ends
- Feedback: "+12 🎾" per successful play

**Disaster Prevention:**
- Cat approaching fragile object → "!" appears above cat
- With the cat Active, press `N` rapidly to prevent
- Each `N` press shows visual feedback (checkmark or remaining)
- Fail = object falls, -15 points

### Active Cat Mode
- Only one cat can be Active at a time
- Clicking a cat (card or avatar) sets Active Cat
- Active Cat displays a clear outline + instruction text
- Action prompts show the required presses (e.g., "Press P ×3", "Press N ×4")
- While Active:
-  - `P` = Play (after clicking a toy)
-  - `T` = Pet (on the cat itself)
-  - `N` = No No (only if disaster is active)
-  - Clicking Food Bowl then pressing `F` serves Feed
-  - Clicking Water Bowl then pressing `W` serves Water
- If no Active Cat, keyboard input does nothing and a hint appears ("Select a cat")
- Completing an action clears Active Cat so the player can select another

### Hover on Cat (Minimal Context)

```
        😿
       /|\
    "I want food!"
    ⏱️ 12s
```

**Shows:**
- Thought bubble with current need or intent
- Countdown timer
- "!" if about to cause disaster
- No action buttons (actions taken on right panel)

---

## Cat Movement & Trajectory System

### Core Movement Rules

**Every cat must move toward their need target:**
- Hunger → Food bowl (waits there if empty, meows in thought bubble)
- Play → Toy area (ball or yarn)
- Attention → Near player/cursor or stationary with meow
- Disaster prep → Approaches fragile object (vase, lamp, mug)

**Movement Speed:**
- Base speed: 1.0 tiles/second
- Catnip mode: 2.0 tiles/second
- Each cat has slight speed variance (±0.1) for natural feel

**Trajectory Visualization:**
- When cat selects target, subtle arrow or dotted line shows path
- Helps users anticipate where cat is heading
- Arrow fades as cat approaches

### Cat States & Behavior

| State | Visual | Behavior |
|-------|--------|----------|
| **Idle** | 😺 | Waiting at current position, occasionally looks around |
| **Moving** | 🐱 | Walking toward target, slight bounce |
| **Waiting** | 😿 | At target (empty bowl), thought bubble shows need |
| **Disaster Prep** | 😼 | Approaching fragile object, "!" appears |
| **Catnip** | 😵‍💫 | Wide eyes, speed trail, erratic movement |
| **Scolded** | 🙀 | Brief pause, sad face, slower movement |
| **Happy** | 😸 | After need fulfilled, hearts floating |

### Catnip Mode

**Trigger:**
- Only starts once there are 3+ cats in the round
- Random chance check every 40 seconds (global)
- Max 1 cat in catnip mode at once

**Effects:**
- Current need urgency doubles (timer runs 2x faster)
- Movement speed 2x
- Visual: Speed lines behind cat, dilated pupils
- User sees "😵‍💫 CATNIP!" alert

**End Condition:**
- 5 seconds duration
- Cat returns to normal state

---

## Round System

### Round Structure

**Round Duration:**
- Ends when ALL cats complete their planned actions
- Auto-advances to next round
- Brief pause with "Round X" announcement between rounds

### Pacing & Concurrency Rules
- Only one high-APM action can be active at a time (food bowl, water bowl, "No No")
- While a high-APM action is active, other timers pause
- After completion, resume timers with a 1s grace buffer
- If multiple urgent events would overlap, delay the less urgent one by 2-4s

**Round Progression:**

| Stage | Rounds | Cats | Actions per Cat | Timer Speed | Catnip |
|-------|--------|------|-----------------|-------------|--------|
| Intro | 1-3 | 1 | 1-2 actions | 100% | None |
| Early | 4-8 | 2 | 2 actions | 95% | None |
| Mid | 9-16 | 3 | 2-3 actions | 90% | 10% (40s check) |
| Late | 17-26 | 4 | 2-4 actions | 85% | 15% (40s check) |
| Endless | 27+ | 4 | 3-4 actions | 80% | 20% (40s check) |

**Onboarding Rules (Rounds 1-3):**
- Only one interaction surface is introduced per round
- Disasters start at Round 4 (no "No No" before then)
- Catnip starts at Round 9 (3 cats) and never during an urgent window

**Action Types in Rounds:**
- Hunger (food bowl)
- Water (water bowl)
- Play (toys)
- Attention (pet)
- Disaster prep (approaching fragile item - requires "No No")

### Action Requirements

| Action Type | Requirement | Points | Failure Consequence |
|-------------|-------------|--------|---------------------|
| Food | Click bowl, then press `F` rapidly | +10 | -6 points, cat waits |
| Water | Click bowl, then press `W` rapidly | +7 | -4 points, cat waits |
| Play | Click toy, then press `P` rapidly | +12 | -4 points |
| Pet | Press `T` on Active Cat | +6 | -3 points |
| No No | Press `N` rapidly (3-5) | 0 (prevents) | Warning on first miss, break on second within 15s |

**Failure Grace (Disasters):**
- First miss triggers a warning only: -5 points, object does NOT fall
- Second miss within 15s triggers the full break penalty

### Round Example

**Round 2:**
- 1 cat (Mochi)
- Action: Hunger (click bowl, press `F` ×4)
- Timer: 15 seconds
- User completes input → +10 points → Round complete

**Round 9:**
- 3 cats (Mochi + Luna + Oliver)
- Mochi: Hunger + Disaster prep (vase)
- Luna: Play
- Oliver: Water
- Timers: 10-16 seconds each
- User must prioritize which to handle first

---

## Score-Only System

**All outcomes are points-based:**
- No mood tracking or secondary lose condition
- Mistakes apply point penalties immediately
- Successes apply point rewards immediately

### Game Over Conditions

**Either:**
1. Score ≤ 0 (from penalties)
2. Endless mode: game continues until player quits

**End Game Screen:**
- Shows final score
- Shows rounds survived
- "Play Again" button

---

## "No No" Disaster Prevention System

### Disaster Types & Requirements

| Object | `N` Press Requirement | Points Lost |
|--------|------------------------|-------------|
| Vase | 4-6 rapid presses | -15 |
| Lamp | 3-5 rapid presses | -12 |
| Mug | 3-4 rapid presses | -10 |
| Plant | 3-4 rapid presses | -8 |
| Food Counter | 5-7 rapid presses | -12 |

**Press Requirement Determination:**
- Randomly generated when disaster triggers
- Based on object fragility (vase = most fragile)
- Difficulty increases minimum presses

### Disaster Triggering

**When Cat Approaches Fragile Object:**
1. "!" appears above cat
2. Thought bubble shows intent ("😼 Break things!")
3. Object starts subtly shaking
4. Countdown appears (6-8 seconds to respond)
5. If required `N` presses incomplete → disaster

**After Disaster:**
- Object falls (visual: rotated/faded)
- Score penalty applied
- Cat shows guilty thought bubble ("😿 Sorry!")
- Object auto-resets after 10 seconds

---

## Score Display & Logging

### Score Display (Top Center)

```
┌─────────────────────────────────────┐
│  Score: 85                          │
│  Round: 3                           │
│  😵‍💫 Catnip: 1 active              │
└─────────────────────────────────────┘
```

### Score Log (Right Panel Bottom)

```
Recent Events:
+10 🍖 Fed Mochi
+15 🎾 Played with Luna
-15 💔 Vase broken!
+5 💧 Filled water
[✋ 5x] Prevented Luna from mug
```

**Log shows last 8 events with:**
- Icon + action description
- Color-coded (green +, red -)
- Auto-scrolls as new events occur

---

## Pause System

### Pause Trigger
- Click "⏸️ Pause" button (top right of game board)

### Pause Modal
```
┌─────────────────────────────────────┐
│           ⏸️ PAUSED                 │
│                                     │
│  Current Score: 85                  │
│  Round: 3                           │
│  Cats Active: 2/3                   │
│                                     │
│  ┌─ Round Summary ─────────────────┐│
│  │ Cats Fed: 4                     ││
│  │ Items Protected: 7              ││
│  │ Items Broken: 2 (-30 pts)       ││
│  │ Perfect Streaks: 3              ││
│  └─────────────────────────────────┘│
│                                     │
│  [▶️ RESUME]    [🔄 RESTART]        │
│                                     │
│  Background: 70% opacity, dimmed    │
└─────────────────────────────────────┘
```

**Background during pause:**
- 70% opacity black overlay
- Game board visible but blurred/dimmed
- No game updates (timers paused)

---

## Difficulty Scaling

### Scaling Factors

**Progressive difficulty as rounds increase:**

| Factor | Rounds 1-3 | Rounds 4-8 | Rounds 9-16 | Rounds 17-26 | Rounds 27+ |
|--------|------------|------------|-------------|--------------|------------|
| Max cats | 1 | 2 | 3 | 4 | 4 |
| Actions per cat | 1-2 | 2 | 2-3 | 2-4 | 3-4 |
| Timer speed | 100% | 95% | 90% | 85% | 80% |
| Catnip frequency | None | None | 10% (40s) | 15% (40s) | 20% (40s) |
| "No No" presses | 3-4 | 3-4 | 4-5 | 4-5 | 5-6 |
| Bowl presses | 3-4 | 3-4 | 4-5 | 4-5 | 5-6 |
| Disaster chance | Low | Medium | Medium | High | High |

**Catnip Mode Scaling:**
- Only when there are 3+ cats
- Global chance check every 40 seconds
- Max 1 cat in catnip at once
- Catnip does not trigger if any cat has an urgent timer (≤ 5s)

### Adaptive Difficulty (Fail-Safe)
- If the player misses 2 actions within 30s, extend all timers by +10% for 20s
- If the player drops below 10 points, reduce new action spawns by 1 for the next round
- If the player succeeds 5 actions in a row, revert to normal pacing

---

## Thought Bubble System

**Design Guidance:**
- Right panel is the source of truth for needs and actions
- Thought bubbles mirror the current need/intent for flavor and quick glance
- No new information is introduced in bubbles (avoid extra cognitive load)

### Bubble Triggers & Content

| Trigger | Bubble Content | Purpose |
|---------|----------------|---------|
| Hunger | "😿 Hungry..." / "Feed me!" | Indicates food need |
| Waiting at empty bowl | "😿 Where's food?" | Shows bowl is empty |
| Play | "🐱 Play time!" | Indicates toy need |
| Attention | "😸 Pet me!" | Indicates pet need |
| Disaster prep | "😼 Hehe..." | Warns of impending chaos |
| Catnip | "😵‍💫 Woohoo!" / "🚀 Fast!" | Shows altered state |
| Scolded | "😿 Nooo..." | Shows correction received |
| After disaster | "😿 Sorry..." | Guilt indicator |

### Bubble Behavior
- Appears above cat
- Lasts 3-5 seconds
- Fades out automatically
- New bubble overrides old
- Bounces slightly for emphasis

---

## Implementation Priority

### Phase 1: Core Mechanics (Current)
- [ ] Right panel with cat cards
- [ ] Single primary action button per cat
- [ ] Food/water bowl clicking on game board
- [ ] Cat movement toward targets
- [ ] Basic timer system
- [ ] Score display and logging

### Phase 2: Disaster System
- [ ] "No No" action per cat
- [ ] Disaster triggering and prevention
- [ ] Object falling animation
- [ ] Click timing requirement

### Phase 3: Advanced Features
- [ ] Round progression
- [ ] Catnip mode
- [ ] Pause system
- [ ] Thought bubbles
- [ ] Difficulty scaling

---

## Quick Reference: Where Actions Live

| Action | Location | How to Complete |
|--------|----------|-----------------|
| Feed cat | Game board (bowl) | Click bowl, then press `F` rapidly × required |
| Fill water | Game board (bowl) | Click bowl, then press `W` rapidly × required |
| Play with cat | Active cat | Press `P` |
| Pet cat | Active cat | Press `T` |
| Prevent disaster | Active cat | Press `N` rapidly × required |
| See cat state | Hover on cat | Thought bubble appears |
| Pause game | Top right button | Click "⏸️ PAUSE" |
| View score | Top center | Always visible |
| View events | Right panel bottom | Auto-updating log |

---

*This spec should be read alongside `cat_chaos_specs.md` for complete game documentation.*
