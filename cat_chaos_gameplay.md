# Cat Chaos: Detailed Gameplay Specification

This document extends `cat_chaos_specs.md` with complete gameplay mechanics, UI layout, and implementation details for a polished, playable game.

---

## UI Layout

### Right Panel (Always Visible, Left Side)

```
┌─────────────────────────────────────┐
│ 🐱 MOCHI                            │
│ ┌─────────────────────────────────┐ │
│ │ 😿 Hunger                       │ │
│ │ ████████░░ 8 clicks needed      │ │
│ │ ⏱️ 12s                         │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 🎾 PLAY                         │ │
│ │ ████░░░░░░░ 4/10               │ │
│ │ ⏱️ 15s                         │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 💜 PET                         │ │
│ │ ██████░░░░░░ 6/10              │ │
│ │ ⏱️ 10s                         │ │
│ └─────────────────────────────────┘ │
│                                   │
│ [🛑 NO NO] (×5 required)          │
│                                   │
│ Mood: 😊 ██████████░░ 85%         │
└─────────────────────────────────────┘

Each cat card shows:
- Cat avatar + name
- Current PRIMARY need (most urgent) with icon
- Progress bar for that need
- Countdown timer for that need
- Primary action button (changes based on need)
- "No No" button for disaster prevention
- Visible mood meter
```

**Right Panel Behavior:**
- No sorting by urgency (chaos is intentional)
- Cats appear in spawn order
- Each cat has ONE primary action button (not multiple)
- "No No" button requires rapid clicking (3-8 random clicks based on disaster severity)

### Game Board Actions

**Food Bowl:**
- Shows required clicks (e.g., "×6" based on hungry cats)
- User must click bowl repeatedly to fill
- Fail if incomplete when timer ends
- Feedback: "+10 🍖" per successful fill

**Water Bowl:**
- Same as food bowl mechanics
- Feedback: "+5 💧" per successful fill

**Disaster Prevention:**
- Cat approaching fragile object → "!" appears above cat
- Click "No No" on cat's card rapidly to prevent
- Each "No No" press shows visual feedback (checkmark or remaining)
- Fail = object falls, -15 points

### Hover on Cat (Minimal Context)

```
        😿
       /|\
    "I want food!"
    ⏱️ 12s
```

**Shows:**
- Thought bubble with current emotional state
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
- Random chance every 20-30 seconds per cat
- Difficulty increases frequency
- Max 2 cats in catnip mode at once

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

**Round Progression:**

| Round | Cats | Actions per Cat | Timer Speed | Catnip Chance |
|-------|------|-----------------|-------------|---------------|
| 1 | 1 | 1 action (hunger) | 100% | None |
| 2 | 1 | 2 actions (hunger + play) | 100% | None |
| 3 | 2 | 1-2 actions each | 95% | 10% |
| 4 | 2 | 2 actions each | 90% | 15% |
| 5 | 3 | 2-3 actions each | 85% | 20% |
| 6+ | 3-6 | 2-4 actions each | 80% + | 25% + |

**Action Types in Rounds:**
- Hunger (food bowl)
- Play (toys)
- Attention (pet)
- Disaster prep (approaching fragile item - requires "No No")

### Action Requirements

| Action Type | Requirement | Points | Failure Consequence |
|-------------|-------------|--------|---------------------|
| Food | Complete all clicks on bowl | +10 | Cat waits, meows, mood -5 |
| Water | Complete all clicks on bowl | +5 | Cat waits, meows, mood -5 |
| Play | Click "Play" button | +15 | Mood -3 |
| Pet | Click "Pet" button | +5 | Mood -3 |
| No No | Rapid clicks (3-8) | 0 (prevents) | -15 points, item falls |

### Round Example

**Round 1:**
- 1 cat (Mochi)
- Action: Hunger (needs ×4 food clicks)
- Timer: 15 seconds
- User clicks food bowl 4 times → +10 points → Round complete

**Round 3:**
- 2 cats (Mochi + Luna)
- Mochi: Hunger (×4) + Disaster prep (vase)
- Luna: Play + Attention
- Timers: 12-18 seconds each
- User must prioritize which to handle first

---

## Mood Meter System

### Mood Mechanics

**Visible mood meter on each cat card:**
- Starts at 100%
- Decreases when needs aren't met
- Different needs affect mood differently:

| Missed Need | Mood Drop | Notes |
|-------------|-----------|-------|
| Food (empty bowl) | -5% per check | Cat waits at bowl, meows |
| Water (empty bowl) | -3% per check | Cat waits at bowl, meows |
| Play (no play session) | -3% per check | Cat gets restless |
| Attention (no pets) | -2% per check | Cat follows cursor |
| Disaster (item falls) | -10% per item | Cat looks guilty |

**Mood Recovery:**
- Successful Food: +5%
- Successful Water: +3%
- Successful Play: +8%
- Successful Pet: +5%
- "No No" success: +2%

### Game Over Conditions

**Either:**
1. Score ≤ 0 (from disasters)
2. Any cat's mood ≤ 0 (from neglected needs)

**End Game Screen:**
- Shows final score
- Shows rounds survived
- Lists which cats' mood reached zero
- "Play Again" button

---

## "No No" Disaster Prevention System

### Disaster Types & Requirements

| Object | Click Requirement | Points Lost | Mood Drop |
|--------|-------------------|-------------|-----------|
| Vase | 4-6 rapid clicks | -15 | -10% |
| Lamp | 3-5 rapid clicks | -12 | -8% |
| Mug | 3-4 rapid clicks | -10 | -5% |
| Plant | 3-4 rapid clicks | -8 | -5% |
| Food Counter | 5-7 rapid clicks | -12 | -10% |

**Click Requirement Determination:**
- Randomly generated when disaster triggers
- Based on object fragility (vase = most fragile)
- Difficulty increases minimum clicks

### Disaster Triggering

**When Cat Approaches Fragile Object:**
1. "!" appears above cat
2. Thought bubble shows intent ("😼 Break things!")
3. Object starts subtly shaking
4. Countdown appears (5 seconds to respond)
5. If "No No" clicks incomplete → disaster

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
│  │ Mood Restored: 12               ││
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

| Factor | Round 1-2 | Round 3-4 | Round 5+ |
|--------|-----------|-----------|----------|
| Max cats | 1 | 2 | 3-6 |
| Actions per cat | 1-2 | 2-3 | 2-4 |
| Timer speed | 100% | 90% | 80% |
| Catnip frequency | None | 15% | 25% |
| "No No" clicks | 3-4 | 4-6 | 5-8 |
| Food bowl clicks | 3-4 | 4-6 | 5-8 |
| Disaster chance | Low | Medium | High |

**Catnip Mode Scaling:**
- Rounds 1-2: Never
- Rounds 3-4: 15% chance per cat
- Rounds 5+: 25% chance per cat
- Max 2 cats in catnip at once

---

## Thought Bubble System

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
| Mood low | "😾 Grumpy..." | Warns mood is dropping |
| Mood critical | "🙀 Help!" | Urgent mood warning |

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
- [ ] Mood meter visible

### Phase 2: Disaster System
- [ ] "No No" button per cat
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
| Feed cat | Game board (food bowl) | Click bowl × required clicks |
| Fill water | Game board (water bowl) | Click bowl × required clicks |
| Play with cat | Right panel (cat card) | Click "🎾 PLAY" button |
| Pet cat | Right panel (cat card) | Click "💜 PET" button |
| Prevent disaster | Right panel (cat card) | Click "🛑 NO NO" rapidly × N times |
| See cat state | Hover on cat | Thought bubble appears |
| Pause game | Top right button | Click "⏸️ PAUSE" |
| View score | Top center | Always visible |
| View events | Right panel bottom | Auto-updating log |

---

*This spec should be read alongside `cat_chaos_specs.md` for complete game documentation.*
