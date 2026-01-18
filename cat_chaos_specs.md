# 🐱 CAT CHAOS: Game Design Specification

## Documentation Structure

This project uses two specification documents:

1. **`cat_chaos_specs.md`** (this file) - High-level overview, cat personalities, scoring quick reference, and architecture
2. **`cat_chaos_gameplay.md`** - Detailed gameplay mechanics, UI layout, round system, and implementation specifics

**👉 Start with `cat_chaos_gameplay.md` for implementation details.**

---

## Overview

A web-based chaos management game where players manage increasingly demanding cats in a house. Think Overcooked meets Neko Atsume — cute cats doing chaotic things that you need to prevent or manage.

**Core Experience:**
- Manage multiple cats with competing needs
- Balance quick reactions (No No clicking) with strategic prioritization
- Endless survival with increasing difficulty
- Satisfying feedback for actions taken (or not)

## Tech Stack

- React with TypeScript
- React SVG for rendering (no canvas)
- Tailwind CSS for styling
- Right panel + game board UI pattern

---

## Core Game Loop

1. Cats spawn with various needs (hunger, play, attention)
2. Player uses right panel to manage cats + game board for food/water
3. "No No" button prevents disasters (requires rapid clicking)
4. Score increases from good actions, decreases from disasters
5. Mood meters add secondary lose condition
6. Game ends when score ≤ 0 OR any mood ≤ 0

---

## Quick Reference: Action Locations

| Action | Location | See |
|--------|----------|-----|
| Feed (food bowl clicks) | Game board | Gameplay doc |
| Fill water (bowl clicks) | Game board | Gameplay doc |
| Play with cat | Right panel | Gameplay doc |
| Pet cat | Right panel | Gameplay doc |
| Prevent disaster (No No) | Right panel | Gameplay doc |
| Pause game | Top right | Gameplay doc |
| View score/events | Top center + log | Gameplay doc |
| Cat movement system | Game board | Gameplay doc |
| Round progression | System | Gameplay doc |
| Mood meter system | Right panel | Gameplay doc |
| Difficulty scaling | System | Gameplay doc |

---

## Scoring System

### Positive Actions
| Action | Points |
|--------|--------|
| Complete food bowl | +10 |
| Complete water bowl | +5 |
| Play session | +15 |
| Pet cat | +5 |
| Prevent disaster | 0 (saves -15) |

### Negative Events
| Event | Points | Mood Drop |
|-------|--------|-----------|
| Food missed | -5 mood | -5% |
| Water missed | -3 mood | -3% |
| Play missed | -3 mood | -3% |
| Pet missed | -2 mood | -2% |
| Item broken | -15 | -10% |

**Game Over:** Score ≤ 0 OR any cat's mood ≤ 0

---

## Cat Personalities

| Cat | Name | Emoji | Behavior |
|-----|------|-------|----------|
| 🐱 | Mochi | Orange tabby | Balanced, starter cat |
| 🐈 | Luna | Gray cat | Calm, slower needs |
| 😺 | Oliver | Yellow cat | Playful, fast movement |
| 😸 | Bella | Pink cat | Energetic |
| 😼 | Leo | Amber cat | Mischievous, breaks items more |
| 😽 | Milo | Cream cat | Clingy, needs attention |

---

## UI Layout

### Right Panel (Left Side)
- Persistent, always visible
- Each cat has a card with:
  - Avatar + name
  - Current need icon + countdown timer
  - Primary action button (changes based on need)
  - "No No" button for disaster prevention
  - Visible mood meter

### Game Board (Center)
- Room with interactive zones (food bowl, water bowl, toys, fragile objects)
- Cats move toward their need targets
- Hover on cat shows thought bubble

### Top Bar
- Score display
- Pause button

---

## Game States

| State | Description |
|-------|-------------|
| `menu` | Start screen |
| `playing` | Active game |
| `paused` | Game paused with modal |
| `gameover` | Game ended |

---

## Implementation Priority

### Phase 1: Core Mechanics
- Right panel with cat cards
- Single primary action button per cat
- Food/water bowl clicking on game board
- Cat movement toward targets
- Basic timer system
- Score display and logging
- Mood meter visible

### Phase 2: Disaster System
- "No No" button per cat
- Disaster triggering and prevention
- Object falling animation
- Click timing requirement

### Phase 3: Advanced Features
- Round progression
- Catnip mode
- Pause system
- Thought bubbles
- Difficulty scaling

---

## File Structure

```
minimax-test/
├── app/
│   ├── page.tsx          # Main game page
│   └── layout.tsx        # App layout
├── components/
│   ├── CatChaosGame.tsx  # Main game component
│   └── RoomAssets.tsx    # SVG room elements
├── public/
│   └── (assets)
├── cat_chaos_specs.md    # This file - high-level overview
└── cat_chaos_gameplay.md # Detailed gameplay specs
```

---

## Success Metrics

A successful implementation should:
1. Be immediately understandable (no tutorial needed)
2. Create genuine "chaos management" tension
3. Make players laugh at cat behaviors
4. Be shareable/meme-able
5. Have satisfying feedback for actions
6. Scale difficulty smoothly

---

*For complete implementation details including UI layout, round system, thought bubbles, pause functionality, and difficulty scaling, see `cat_chaos_gameplay.md`.*
