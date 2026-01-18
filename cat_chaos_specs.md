# 🐱 CAT CHAOS: Game Design Specification

## Build Instructions (Read First)

### Quick Start
Run this prompt to generate the game:

> "Build a 2D React game where player manages cats with needs. Cats spawn with hunger/play/attention bars that fill over time. Click cat to fulfill its most urgent need (shows which need is critical). Unmet needs cause cats to move toward objects and knock them over. Click object to secure it before cat reaches it. Score +10 for feeding, +15 for play, +5 for petting. Score -10 when item falls. Game over when score ≤ 0. Simple top-down view with emoji graphics. React + Tailwind."

### Current Phase: MVP v1
Status: ✅ Built (see components/CatChaosGame.tsx)

**MVP Requirements** (build in order):
1. [x] Single room with interactive zones (food bowl, play area)
2. [x] 1-3 cats with needs (hunger, play, attention)
3. [x] Need urgency system (green → yellow → orange → red)
4. [x] Click-to-fulfill mechanic (hover menu)
5. [x] Basic scoring (+/- feedback with popups)
6. [x] Game over state (score ≤ 0)

---

## Overview
A web-based chaos management game where players manage increasingly demanding cats in a house. Think Overcooked meets Neko Atsume — cute cats doing chaotic things that you need to prevent or manage.

## Tech Stack
- React with TypeScript
- React components for rendering (no canvas for MVP)
- Tailwind CSS for styling
- Single-file implementation preferred

---

## Phase 1: MVP v1 (Start Here)
Single room, 1-3 cats, 3 basic needs, click interactions

---

## Build Prompts by Phase

### Phase 1 (Current): MVP
```
Build a 2D React game where player manages cats with needs. Cats spawn with hunger/play/attention bars that fill over time. Click cat to fulfill its most urgent need (shows which need is critical). Unmet needs cause cats to move toward objects and knock them over. Click object to secure it before cat reaches it. Score +10 for feeding, +15 for play, +5 for petting. Score -10 when item falls. Game over when score ≤ 0. Simple top-down view with emoji graphics. React + Tailwind.
```

### Phase 2: Add Disasters & More Cats
```
Add to existing cat game: 1) Litter box need (new object zone), 2) Catnip mode (random 2x speed boost), 3) More cat types with personality modifiers, 4) Cat-to-cat interactions (fighting, grooming bonus), 5) Wave system that adds cats over time.
```

### Phase 3: Polish & Scale
```
Add: particle effects for actions, sound effects placeholder, difficulty scaling, mobile touch support, pause button, visual feedback (screen shake on disaster, sparkles on points).
```

---

## Core Game Loop
1. Cats spawn with various needs (hunger, play, litter, attention)
2. Player clicks to fulfill needs before they escalate
3. Ignoring needs leads to disasters (knocked items, fights, messes)
4. Score increases from good actions, decreases from disasters
5. More cats are added over time, increasing chaos
6. Game ends when score drops to 0 or below

---

## Scoring System

### Positive Actions (Earn Points)
| Action | Points |
|--------|--------|
| Feed hungry cat | +10 |
| Complete play session | +15 |
| Pet a cat demanding attention | +5 |
| Catch cat before it knocks something off | +25 |
| Clean litter box in time | +10 |

### Negative Events (Lose Points)
| Event | Points |
|-------|--------|
| Item knocked off table/shelf | -10 |
| Litter box overflow (ignored too long) | -20 |
| Cat fight breaks out | -15 |
| Cat escapes through door | -50 |

---

## Cat Needs System

Each cat has needs that build up over time. Visual indicators show urgency.

| Need | Warning Sign | Time to Act | Consequence if Ignored |
|------|--------------|-------------|------------------------|
| Hunger | Meowing icon, cat moves toward food bowl | 10 seconds | Knocks over trash, steals food from counter |
| Play | Zoomies animation, stalks objects | 8 seconds | Attacks other cats, scratches furniture |
| Litter | Paces near litter box, urgent icon | 12 seconds | Makes mess elsewhere, big point penalty |
| Attention | Follows player cursor, heart icon | 6 seconds | Knocks things off tables for attention |

### Need Urgency Indicators
- **Green**: Need is low, no action required
- **Yellow**: Need building, should address soon
- **Orange**: Urgent, act now
- **Red + Flashing**: About to cause disaster

---

## ⚡ Catnip Mode

Randomly triggered event that affects individual cats.

### Mechanics
- **Trigger**: Random chance every 15-20 seconds per cat
- **Duration**: 5 seconds
- **Effect**: Cat moves at 2x speed toward current goal
- **Visual**: Wide eyes, blur/sparkle trail behind cat
- **Audio**: Music tempo increases

### Strategic Impact
Catnip mode can be good OR bad depending on context:
- Cat rushing to litter box → Player must have it clean NOW
- Cat rushing to food bowl → Easy points if food is ready
- Cat rushing to play area → Quick play opportunity
- Cat rushing to table edge → Disaster imminent, intercept fast!

---

## Cat Personalities

Cats are added progressively. Each has unique behavior modifiers.

| Cat | Name | Appearance | Special Behavior |
|-----|------|------------|------------------|
| 🐱 | Mochi | Orange tabby | Balanced needs, good starter cat |
| 😼 | Gremlin | Black cat | Knocks things off 2x more often, mischievous |
| 😸 | Chonk | Fat gray cat | Eats 2x food, moves 50% slower, can block paths |
| 🙀 | Chaos | White with orange spots | Triggers catnip mode on nearby cats |
| 😺 | Velcro | Siamese | Constant attention needs, always follows cursor |
| 😾 | Grumpy | Persian | Starts fights with other cats, hates everyone |

### Unlock Order
1. Wave 1: Mochi (tutorial cat)
2. Wave 2: +Gremlin
3. Wave 3: +Chonk
4. Wave 4: +Random personality cat
5. Wave 5+: Mix of all cats

---

## Cat Interactions

When multiple cats are present, they can interact:

### Positive Interactions
| Interaction | Trigger | Effect |
|-------------|---------|--------|
| Grooming | Two calm cats near each other | +5 bonus points, both cats stay calm longer |
| Cuddle Pile | 3+ happy cats in same area | +20 bonus, 10-second calm period for all |

### Negative Interactions
| Interaction | Trigger | Effect |
|-------------|---------|--------|
| Fighting | Two cats with high annoyance near each other | -15 points, both cats become more demanding |
| Copying | One cat does zoomies | 30% chance nearby cats join zoomies |
| Territorial | Grumpy cat near any cat | Increased fight chance |

---

## Game Progression

### Wave System
| Wave | # of Cats | Duration | New Mechanic |
|------|-----------|----------|--------------|
| 1 | 1 | 60 sec | Tutorial - basic needs only |
| 2 | 2 | 90 sec | Cat interactions introduced |
| 3 | 3 | 90 sec | Catnip mode unlocks |
| 4 | 4 | 120 sec | Personality cats appear |
| 5+ | 5-6 | Endless | Survival mode, increasing speed |

### Difficulty Scaling
- Need timers get shorter each wave (-1 second per wave)
- Catnip mode triggers more frequently
- More personality cats with difficult behaviors

---

## Controls

Simple click-based controls for web:

### Primary Actions
- **Click on cat** → Opens action menu (Feed / Play / Pet)
- **Click on object** → Interact with it (Clean litter box, Secure vase, Fill food bowl)
- **Click on disaster-in-progress** → Attempt to prevent it

### Action Menu
When clicking a cat, show circular menu around cat with icons:
- 🍖 Feed
- 🎾 Play  
- 💜 Pet
- ❌ Cancel

---

## Room Layout

Single room with key interactive zones:

```
┌─────────────────────────────────────┐
│  [Shelf]     [Window]    [Shelf]    │
│    📚          🪴          🏺       │
│                                     │
│  [Table]                 [Counter]  │
│    ☕🌸                    🍖       │
│                                     │
│           [Play Area]               │
│              🧶🎾                    │
│                                     │
│  [Litter]              [Food Bowl]  │
│    🚽                      🍽️       │
│                                     │
│  [Door]                             │
└─────────────────────────────────────┘
```

### Danger Zones (things cats can knock off)
- Shelves: Books, plants, vases
- Table: Coffee mug, flowers
- Counter: Food items
- Window sill: Plants

---

## Visual Style

### Art Direction
- **View**: Top-down or 3/4 isometric
- **Style**: Chunky, cute, meme-able cats
- **Colors**: Warm, cozy home palette
- **Animations**: Bouncy, exaggerated movements

### Visual Feedback
| Event | Visual |
|-------|--------|
| Item wobbling | Shake animation before falling |
| Disaster | Screen shake, item breaks/spills |
| Good action | Sparkle effect, floating +points |
| Catnip mode | Speed lines, dilated pupils on cat |
| Cat happy | Hearts floating above |
| Cat angry | Steam/scribble cloud above |

### UI Elements
- **Score**: Top center, large numbers
- **Wave indicator**: Top left
- **Cat status bars**: Small bars above each cat showing needs
- **Timer**: For wave duration (if applicable)

---

## Sound Design (Optional)

| Event | Sound |
|-------|-------|
| Cat meow | Various meows for different needs |
| Item wobble | Rattling sound |
| Item crash | Glass break / thud |
| Points gained | Pleasant ding |
| Points lost | Sad trombone / buzz |
| Catnip trigger | Whoosh + tempo change |
| Cat fight | Hissing, yowling |

---

## MVP Scope (Minimum Viable Demo)

### Must Have
- [ ] Single room environment
- [ ] 1-3 cats maximum
- [ ] 3 basic needs: Food, Play, Attention
- [ ] Knock-off prevention mechanic
- [ ] Basic catnip mode (2x speed)
- [ ] Score counter with +/- feedback
- [ ] Lose condition (score ≤ 0)
- [ ] Simple click controls

### Nice to Have
- [ ] Multiple cat personalities
- [ ] Sound effects
- [ ] Cat-to-cat interactions
- [ ] Wave progression system
- [ ] Particle effects
- [ ] Mobile touch support

### Stretch Goals
- [ ] Leaderboard
- [ ] Multiple room layouts
- [ ] Unlockable cats
- [ ] Power-ups (cat treats, laser pointer)

---

## Implementation Notes

### Game State
```typescript
interface GameState {
  score: number;
  wave: number;
  cats: Cat[];
  objects: InteractiveObject[];
  gameStatus: 'playing' | 'paused' | 'gameover';
}

interface Cat {
  id: string;
  name: string;
  personality: CatPersonality;
  position: { x: number; y: number };
  needs: {
    hunger: number;      // 0-100
    play: number;        // 0-100
    attention: number;   // 0-100
    litter: number;      // 0-100
  };
  state: 'idle' | 'walking' | 'catnip' | 'disaster';
  target: Position | null;
}

interface InteractiveObject {
  id: string;
  type: 'vase' | 'mug' | 'plant' | 'food' | 'litterbox';
  position: { x: number; y: number };
  isWobbling: boolean;
  isFallen: boolean;
}
```

### Update Loop
1. Update cat need timers (increase over time)
2. Check for need thresholds → trigger behaviors
3. Move cats toward targets
4. Check for cat interactions
5. Check for disaster conditions
6. Update score
7. Check win/lose conditions
8. Render frame

---

## Example Gameplay Scenario

1. **0:00** - Game starts with Mochi (orange tabby)
2. **0:15** - Mochi gets hungry, meow icon appears
3. **0:20** - Player clicks Mochi → clicks Feed → +10 points
4. **0:45** - Mochi wants attention, starts walking to shelf
5. **0:50** - Player pets Mochi in time → +5 points
6. **1:00** - Wave 2: Gremlin (black cat) joins!
7. **1:10** - Gremlin immediately targets vase on shelf
8. **1:12** - Vase starts wobbling
9. **1:14** - Player clicks vase to secure it → +25 points
10. **1:30** - Both cats near each other, both annoyed → FIGHT! -15 points
11. **1:45** - Catnip mode triggers on Mochi → chaos ensues...

---

## Success Metrics

A successful implementation should:
1. Be immediately understandable (no tutorial needed for basics)
2. Create genuine "chaos management" tension
3. Make players laugh at cat behaviors
4. Be shareable/meme-able (good for screenshots/clips)
5. Have satisfying feedback for actions
6. Scale difficulty smoothly

---

*Built with 🐱 and chaos*