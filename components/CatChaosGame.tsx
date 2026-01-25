'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Window, CatTree,
  FoodBowl, WaterBowl, Rug, Bookshelf, Sofa, CoffeeTable,
  Vase, TableLamp, CoffeeMug, Plant, ToyBall, YarnBall,
  CatSprite, SisalPattern, BackWall, SideWalls, ElementLabel,
  RoomFloor, RugTexture, RoomLighting
} from './RoomAssets';

// Types
interface Cat {
  id: string;
  name: string;
  emoji: string;
  color: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  needs: {
    hunger: number;
    water: number;
    play: number;
    attention: number;
  };
  state: 'idle' | 'moving' | 'eating' | 'playing' | 'purring' | 'scolded';
  target: { x: number; y: number } | null;
  personality: string;
  lastMoveTime: number;
}

interface Zone {
  id: string;
  type: 'food_bowl' | 'water_bowl' | 'play_zone' | 'vase' | 'lamp' | 'cat_tree' | 'plant' | 'mug' | 'toy' | 'window' | 'sofa' | 'rug' | 'bookshelf';
  emoji: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  label: string;
  isWobbling?: boolean;
  isFallen?: boolean;
  isEmpty?: boolean;
  fillLevel?: number;
  lastNoNoFailAt?: number;
}

interface Popup {
  id: string;
  value: string;
  x: number;
  y: number;
}

interface ActionWindow {
  type: 'food' | 'water' | 'play' | 'pet' | 'no_no';
  catId: string;
  requiredPresses: number;
  currentPresses: number;
  expiresAt: number;
  zoneId?: string;
}

interface RoundAction {
  type: 'hunger' | 'water' | 'play' | 'attention' | 'disaster';
  completed: boolean;
  targetZoneId?: string; // For disaster actions, which object the cat is targeting
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Constants
const GAME_WIDTH = 700;
const GAME_HEIGHT = 550;
const PLAYER_MOVE_SPEED = 4; // Arrow key movement speed
const PROXIMITY_RADIUS = 60; // How close cat must be to interact
const DISASTER_THRESHOLD = 65;
const SCOLD_DURATION = 2000;
const ACTION_WINDOW_MS = 8000;
const DISASTER_MOVE_SPEED = 1.5; // Speed when cat moves autonomously to destroy

// Round timer settings - creates urgency!
const ROUND_TIMER_MIN_SECONDS = 5;
const ROUND_TIMER_MAX_SECONDS = 15;
const ROUND_TIMER_PER_ACTION_SECONDS = 2;
const TIMER_SPEED_MULTIPLIERS: Record<string, number> = {
  intro: 1.0,    // Rounds 1-3
  early: 0.95,   // Rounds 4-8
  mid: 0.90,     // Rounds 9-16
  late: 0.85,    // Rounds 17-26
  endless: 0.80, // Rounds 27+
};

// Timer urgency thresholds (percentage of time remaining)
const TIMER_COMFORTABLE = 0.5;  // >50% - green, calm
const TIMER_WARNING = 0.25;      // 25-50% - yellow, slight pulse
const TIMER_CRITICAL = 0.15;     // <15% - red, aggressive pulse
const ACTION_PRESS_COUNTS = {
  food: 5,
  water: 4,
  play: 4,
  pet: 1,
  noNoMin: 3,
  noNoMax: 5,
};
const DISASTER_PENALTIES: Record<string, number> = {
  vase: 15,
  lamp: 12,
  mug: 10,
  plant: 8,
  food_counter: 12,
};

// Breakable objects for disaster mode
const BREAKABLE_ZONES = ['vase1', 'vase2', 'lamp', 'mug'];

// Cat data
const CATS = [
  { name: 'Mochi', emoji: '🐱', color: 'orange', personality: 'balanced' },
  { name: 'Luna', emoji: '🐈', color: 'gray', personality: 'calm' },
  { name: 'Oliver', emoji: '😺', color: 'yellow', personality: 'playful' },
  { name: 'Bella', emoji: '😸', color: 'pink', personality: 'energetic' },
  { name: 'Leo', emoji: '😼', color: 'amber', personality: 'mischievous' },
  { name: 'Milo', emoji: '😽', color: 'cream', personality: 'clingy' },
];

// Room layout with labels for educational purposes
const ROOM_ZONES: Zone[] = [
  // Back wall elements
  { id: 'window', type: 'window', emoji: '🪟', position: { x: 60, y: 15 }, width: 140, height: 70, label: 'Window' },

  // Plants
  { id: 'plant1', type: 'plant', emoji: '🌿', position: { x: 25, y: 70 }, width: 50, height: 50, label: 'Fern' },
  { id: 'plant2', type: 'plant', emoji: '🌵', position: { x: 220, y: 70 }, width: 45, height: 50, label: 'Cactus' },

  // Cat tree (larger, more prominent)
  { id: 'cattree', type: 'cat_tree', emoji: '🏰', position: { x: 330, y: 10 }, width: 100, height: 115, label: 'Cat Tower' },

  // Sofa (larger)
  { id: 'sofa', type: 'sofa', emoji: '🛋️', position: { x: 490, y: 15 }, width: 190, height: 95, label: 'Sofa' },

  // Rug (center floor)
  { id: 'rug', type: 'rug', emoji: '', position: { x: 270, y: 185 }, width: 180, height: 130, label: 'Area Rug' },

  // Bookshelf
  { id: 'bookshelf', type: 'bookshelf', emoji: '📚', position: { x: 560, y: 145 }, width: 110, height: 85, label: 'Bookshelf' },

  // Vases on bookshelf
  { id: 'vase1', type: 'vase', emoji: '🏺', position: { x: 570, y: 100 }, width: 45, height: 55, label: 'Flower Vase' },
  { id: 'vase2', type: 'vase', emoji: '⚱️', position: { x: 640, y: 105 }, width: 40, height: 50, label: 'Decorative Vase' },

  // Coffee table with items
  { id: 'table', type: 'sofa', emoji: '🪑', position: { x: 210, y: 105 }, width: 100, height: 75, label: 'Coffee Table' },
  { id: 'lamp', type: 'lamp', emoji: '💡', position: { x: 220, y: 75 }, width: 45, height: 60, label: 'Table Lamp' },
  { id: 'mug', type: 'mug', emoji: '☕', position: { x: 270, y: 85 }, width: 35, height: 40, label: 'Coffee Mug' },

  // Food area
  { id: 'food_bowl', type: 'food_bowl', emoji: '🍖', position: { x: 50, y: 400 }, width: 55, height: 45, label: 'Food Bowl' },
  { id: 'water_bowl', type: 'water_bowl', emoji: '💧', position: { x: 130, y: 400 }, width: 55, height: 45, label: 'Water Bowl' },

  // Toys
  { id: 'toy1', type: 'toy', emoji: '🎾', position: { x: 350, y: 360 }, width: 35, height: 35, label: 'Ball Toy' },
  { id: 'toy2', type: 'toy', emoji: '🧶', position: { x: 460, y: 425 }, width: 35, height: 35, label: 'Yarn Ball' },
];

// Random spawn positions
const getRandomSpawnPosition = (): { x: number; y: number } => {
  const spawnAreas = [
    { x: 370, y: 300 },  // On/near rug
    { x: 450, y: 380 },  // Near toys
    { x: 130, y: 360 },  // Near food
    { x: 550, y: 350 },  // Near sofa area
    { x: 370, y: 250 },  // Center room
  ];
  const area = spawnAreas[Math.floor(Math.random() * spawnAreas.length)];
  return {
    x: area.x + (Math.random() - 0.5) * 80,
    y: area.y + (Math.random() - 0.5) * 50,
  };
};

// Need colors
const NEED_COLORS = {
  hunger: { low: '#22c55e', med: '#eab308', high: '#f97316', critical: '#ef4444' },
  water: { low: '#22c55e', med: '#eab308', high: '#f97316', critical: '#ef4444' },
  play: { low: '#22c55e', med: '#eab308', high: '#f97316', critical: '#ef4444' },
  attention: { low: '#22c55e', med: '#eab308', high: '#f97316', critical: '#ef4444' },
};

const NEED_ICONS: Record<string, string> = {
  hunger: '🍖',
  water: '💧',
  play: '🧶',
  attention: '💕',
  disaster: '⚠️',
};

// Get instruction text based on current game state
const getInstructionText = (
  actionWindow: ActionWindow | null,
  roundActions: RoundAction[],
  cats: Cat[],
  isNearTarget: boolean,
  isDisasterMode: boolean,
  zones: Zone[],
  timeRemainingPercent: number = 1
): { line1: string; line2: string } => {
  // Find current uncompleted action
  const currentAction = roundActions.find(a => !a.completed);
  const cat = cats[0]; // Single cat mode
  
  // Urgency prefix based on time remaining
  const isUrgent = timeRemainingPercent <= TIMER_WARNING;
  const isCritical = timeRemainingPercent <= TIMER_CRITICAL;
  const urgencyPrefix = isCritical ? '⚡ HURRY! ' : isUrgent ? '⏱️ ' : '';
  
  if (!cat) {
    return { line1: 'Welcome to Cat Chaos!', line2: 'Press Start to begin' };
  }
  
  if (!currentAction) {
    return { line1: 'Round Complete!', line2: 'Great job!' };
  }
  
  // Disaster mode - cat is heading to destroy something
  if (currentAction.type === 'disaster') {
    if (isDisasterMode) {
      return {
        line1: `${urgencyPrefix}${cat.name} is being NAUGHTY!`,
        line2: 'Press N rapidly to say "NO NO!"'
      };
    }
    return {
      line1: 'Uh oh! Cat is about to cause trouble!',
      line2: 'Get ready to stop them!'
    };
  }
  
  // If action window is active, show press instructions
  if (actionWindow) {
    const remaining = actionWindow.requiredPresses - actionWindow.currentPresses;
    const keyMap = { food: 'F', water: 'W', play: 'P', pet: 'T', no_no: 'N' } as const;
    const key = keyMap[actionWindow.type];
    return {
      line1: `${urgencyPrefix}Press ${key} rapidly!`,
      line2: `${remaining} more ${remaining === 1 ? 'press' : 'presses'} needed`
    };
  }
  
  // Cat is active, give specific instructions based on need
  switch (currentAction.type) {
    case 'hunger':
      if (isNearTarget) {
        return {
          line1: `${urgencyPrefix}${cat.name} is at the food bowl!`,
          line2: 'Press F to fill the bowl'
        };
      }
      return {
        line1: `${urgencyPrefix}${cat.name} is hungry!`,
        line2: isCritical ? 'MOVE NOW! Arrow keys → food bowl' : 'Use ARROW KEYS to move to the food bowl'
      };
    case 'water':
      if (isNearTarget) {
        return {
          line1: `${urgencyPrefix}${cat.name} is at the water bowl!`,
          line2: 'Press W to fill the bowl'
        };
      }
      return {
        line1: `${urgencyPrefix}${cat.name} is thirsty!`,
        line2: isCritical ? 'MOVE NOW! Arrow keys → water bowl' : 'Use ARROW KEYS to move to the water bowl'
      };
    case 'play':
      if (isNearTarget) {
        return {
          line1: `${urgencyPrefix}${cat.name} found a toy!`,
          line2: 'Press P to play'
        };
      }
      return {
        line1: `${urgencyPrefix}${cat.name} wants to play!`,
        line2: isCritical ? 'MOVE NOW! Arrow keys → toy' : 'Use ARROW KEYS to move to a toy'
      };
    case 'attention':
      return {
        line1: `${urgencyPrefix}${cat.name} wants attention!`,
        line2: isCritical ? 'PRESS T NOW to pet!' : 'Press T to pet the cat'
      };
    default:
      return { line1: 'Keep your cat happy!', line2: '' };
  }
};

export default function CatChaosGame() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [zones, setZones] = useState<Zone[]>(ROOM_ZONES);
  const [score, setScore] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [disasterMode, setDisasterMode] = useState(false);
  const [showLabels, setShowLabels] = useState(false); // Toggle for educational labels
  const [actionWindow, setActionWindow] = useState<ActionWindow | null>(null);
  // Round system state
  const [currentRound, setCurrentRound] = useState(1);
  const [roundActions, setRoundActions] = useState<RoundAction[]>([]);
  const [showRoundBanner, setShowRoundBanner] = useState(false);
  const [roundPaused, setRoundPaused] = useState(false);
  // Round timer state
  const [roundTimeRemaining, setRoundTimeRemaining] = useState(0); // in milliseconds
  const [roundTimerTotal, setRoundTimerTotal] = useState(0); // total time for the round
  const [roundTimerActive, setRoundTimerActive] = useState(false);
  const [showTimerCritical, setShowTimerCritical] = useState(false);
  // Movement and disaster state
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());
  const [isDisasterMode, setIsDisasterMode] = useState(false);
  const [wrongActionFeedback, setWrongActionFeedback] = useState<{ show: boolean; x: number; y: number }>({ show: false, x: 0, y: 0 });
  const gameLoopRef = useRef<number | null>(null);
  const catIdRef = useRef(0);
  const catsRef = useRef<Cat[]>([]); // Ref to access cats without causing re-renders

  // Keep catsRef in sync with cats state
  useEffect(() => {
    catsRef.current = cats;
  }, [cats]);

  // Add popup
  const addPopup = useCallback((x: number, y: number, value: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setPopups(prev => [...prev, { id, value, x, y }]);
    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id));
    }, 1200);
  }, []);

  // Check if cat is near a specific zone type
  const isCatNearZone = useCallback((cat: Cat, zoneType: string): { near: boolean; zone?: Zone } => {
    const targetZones = zones.filter(z => z.type === zoneType || z.id === zoneType);
    for (const zone of targetZones) {
      const zoneCenterX = zone.position.x + zone.width / 2;
      const zoneCenterY = zone.position.y + zone.height / 2;
      const distance = Math.sqrt(
        Math.pow(cat.position.x - zoneCenterX, 2) + 
        Math.pow(cat.position.y - zoneCenterY, 2)
      );
      if (distance < PROXIMITY_RADIUS) {
        return { near: true, zone };
      }
    }
    return { near: false };
  }, [zones]);

  // Check if cat is near the target for current action
  const isCatNearCurrentTarget = useCallback((cat: Cat, action: RoundAction | undefined): boolean => {
    if (!action) return false;
    switch (action.type) {
      case 'hunger':
        return isCatNearZone(cat, 'food_bowl').near;
      case 'water':
        return isCatNearZone(cat, 'water_bowl').near;
      case 'play':
        return isCatNearZone(cat, 'toy').near;
      case 'attention':
        return true; // Always near for attention
      case 'disaster':
        return false; // Handled differently
      default:
        return false;
    }
  }, [isCatNearZone]);

  // Show wrong action feedback
  const showWrongAction = useCallback((x: number, y: number) => {
    setWrongActionFeedback({ show: true, x, y });
    addPopup(x, y - 30, '❌ Wrong action!');
    setTimeout(() => {
      setWrongActionFeedback({ show: false, x: 0, y: 0 });
    }, 800);
  }, [addPopup]);

  // Calculate round timer duration based on round number and action count
  const calculateRoundTimer = useCallback((round: number, actionCount: number): number => {
    // Determine difficulty stage
    let stage: string;
    if (round <= 3) stage = 'intro';
    else if (round <= 8) stage = 'early';
    else if (round <= 16) stage = 'mid';
    else if (round <= 26) stage = 'late';
    else stage = 'endless';
    
    const speedMultiplier = TIMER_SPEED_MULTIPLIERS[stage];
    
    // Calculate base time: random range + small boost per extra action
    const baseTime = getRandomInt(ROUND_TIMER_MIN_SECONDS, ROUND_TIMER_MAX_SECONDS)
      + (Math.max(0, actionCount - 1) * ROUND_TIMER_PER_ACTION_SECONDS);

    // Apply speed multiplier (lower = faster = harder)
    const finalTime = Math.round(baseTime * speedMultiplier);

    // Clamp to requested range
    const clampedTime = Math.max(ROUND_TIMER_MIN_SECONDS, Math.min(ROUND_TIMER_MAX_SECONDS, finalTime));

    return clampedTime * 1000; // Return in milliseconds
  }, []);

  // Generate actions for a round based on round number
  const generateRoundActions = useCallback((round: number): RoundAction[] => {
    const actionTypes: Array<'hunger' | 'water' | 'play' | 'attention'> = ['hunger', 'water', 'play', 'attention'];
    
    // Round 4+ can have disaster actions
    // Round 4 is the first disaster round to introduce the mechanic
    if (round === 4) {
      const targetZone = BREAKABLE_ZONES[Math.floor(Math.random() * BREAKABLE_ZONES.length)];
      return [{ type: 'disaster', completed: false, targetZoneId: targetZone }];
    }
    
    // After round 4, mix in disasters occasionally
    if (round > 4 && round % 3 === 1) {
      const targetZone = BREAKABLE_ZONES[Math.floor(Math.random() * BREAKABLE_ZONES.length)];
      return [{ type: 'disaster', completed: false, targetZoneId: targetZone }];
    }
    
    // Rounds 1-3: 1 action, simple intro
    // For simplified single-cat mode, we'll use 1 action per round
    const numActions = round <= 3 ? 1 : Math.min(2, 1 + Math.floor(round / 5));
    
    const actions: RoundAction[] = [];
    const usedTypes = new Set<string>();
    
    for (let i = 0; i < numActions; i++) {
      // Pick a random action type that hasn't been used this round
      const availableTypes = actionTypes.filter(t => !usedTypes.has(t));
      const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      usedTypes.add(type);
      actions.push({ type, completed: false });
    }
    
    return actions;
  }, []);

  // Start a new round
  const startNewRound = useCallback((round: number) => {
    const actions = generateRoundActions(round);
    setRoundActions(actions);
    setShowRoundBanner(true);
    setRoundPaused(true);
    setRoundTimerActive(false);
    setShowTimerCritical(false);
    
    // Calculate and set round timer
    const timerDuration = calculateRoundTimer(round, actions.length);
    setRoundTimerTotal(timerDuration);
    setRoundTimeRemaining(timerDuration);
    
    // Check if this is a disaster round
    const isDisasterRound = actions.some(a => a.type === 'disaster');
    
    if (isDisasterRound) {
      // For disaster rounds, set the cat's target to the breakable object
      const disasterAction = actions.find(a => a.type === 'disaster');
      const targetZone = zones.find(z => z.id === disasterAction?.targetZoneId);
      
      setCats(prev => prev.map(cat => ({
        ...cat,
        needs: { hunger: 20, water: 20, play: 20, attention: 20 },
        target: targetZone ? {
          x: targetZone.position.x + targetZone.width / 2,
          y: targetZone.position.y + targetZone.height / 2 + 30, // Below the object
        } : null,
        state: 'idle' as const,
      })));

      if (targetZone) {
        setZones(prevZ => prevZ.map(z => z.id === targetZone.id ? { ...z, isWobbling: true, isFallen: false, lastNoNoFailAt: undefined } : z));
      }
      
      // Start disaster mode after banner
      setTimeout(() => {
        setShowRoundBanner(false);
        setRoundPaused(false);
        setRoundTimerActive(false);
        setIsDisasterMode(true);
      }, 2000);
    } else {
      // Normal round - set the cat's need high for the required action
      setCats(prev => prev.map(cat => {
        const newNeeds = { hunger: 20, water: 20, play: 20, attention: 20 };
        // Set the first action's need to be urgent
        actions.forEach((action, idx) => {
          if (action.type !== 'disaster') {
            // Stagger the urgency - first action is most urgent
            newNeeds[action.type] = DISASTER_THRESHOLD + 10 - (idx * 15);
          }
        });
        return { ...cat, needs: newNeeds, target: null };
      }));
      
      setIsDisasterMode(false);
      
      // Hide banner and unpause after 2 seconds, then start timer
      setTimeout(() => {
        setShowRoundBanner(false);
        setRoundPaused(false);
        setRoundTimerActive(true);
      }, 2000);
    }
  }, [generateRoundActions, zones, calculateRoundTimer]);

  // Check if round is complete - called after updating round actions
  const checkRoundComplete = useCallback((updatedActions: RoundAction[]) => {
    const allComplete = updatedActions.length > 0 && updatedActions.every(a => a.completed);
    if (allComplete && !showRoundBanner && roundTimerActive) {
      // Stop the timer
      setRoundTimerActive(false);
      
      // Calculate time bonus - reward for finishing early!
      const timeRemainingPercent = roundTimerTotal > 0 ? roundTimeRemaining / roundTimerTotal : 0;
      let timeBonus = 0;
      
      if (timeRemainingPercent > 0.5) {
        // >50% time remaining: excellent bonus
        timeBonus = Math.round(15 * timeRemainingPercent);
      } else if (timeRemainingPercent > 0.25) {
        // 25-50% time remaining: good bonus
        timeBonus = Math.round(8 * timeRemainingPercent);
      } else if (timeRemainingPercent > 0) {
        // <25% time remaining: small bonus
        timeBonus = Math.round(3 * timeRemainingPercent);
      }
      
      if (timeBonus > 0) {
        setScore(s => s + timeBonus);
      }
      
      // Advance to next round
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);
      
      // Show completion popup with time bonus
      if (cats.length > 0) {
        const bonusText = timeBonus > 0 ? ` +${timeBonus} ⏱️` : '';
        addPopup(cats[0].position.x, cats[0].position.y - 50, `Round ${currentRound} Complete!${bonusText}`);
      }
      
      // Start next round after a brief delay
      setTimeout(() => {
        startNewRound(nextRound);
      }, 1500);
    }
  }, [showRoundBanner, currentRound, cats, addPopup, startNewRound, roundTimerActive, roundTimerTotal, roundTimeRemaining]);

  // Get need color based on level
  const getNeedFillColor = (value: number): string => {
    if (value < 30) return NEED_COLORS.hunger.low;
    if (value < 50) return NEED_COLORS.hunger.med;
    if (value < DISASTER_THRESHOLD) return NEED_COLORS.hunger.high;
    return NEED_COLORS.hunger.critical;
  };

  const startActionWindow = useCallback((type: ActionWindow['type'], catId: string, zoneId?: string, initialPresses = 0) => {
    if (actionWindow) return;
    const requiredPresses = type === 'no_no'
      ? getRandomInt(ACTION_PRESS_COUNTS.noNoMin, ACTION_PRESS_COUNTS.noNoMax)
      : ACTION_PRESS_COUNTS[type];
    
    // Reset bowl fill level to 0 when starting to fill
    if (type === 'food') {
      setZones(prev => prev.map(z => z.id === 'food_bowl' ? { ...z, fillLevel: 0, isEmpty: true } : z));
    } else if (type === 'water') {
      setZones(prev => prev.map(z => z.id === 'water_bowl' ? { ...z, fillLevel: 0 } : z));
    }
    
    setKeysPressed(new Set());
    setActionWindow({
      type,
      catId,
      requiredPresses,
      currentPresses: initialPresses,
      expiresAt: Date.now() + ACTION_WINDOW_MS,
      zoneId,
    });
  }, [actionWindow, setKeysPressed]);

  const clearActionWindow = useCallback(() => {
    setActionWindow(null);
  }, []);

  // Fulfill cat need
  const fulfillNeed = useCallback((catId: string, needType: 'hunger' | 'water' | 'play' | 'attention') => {
    setCats(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;

      let points = 0;
      let actionText = '';
      switch (needType) {
        case 'hunger': points = 10; actionText = '+10 🍖'; break;
        case 'water': points = 7; actionText = '+7 💧'; break;
        case 'play': points = 12; actionText = '+12 🎾'; break;
        case 'attention': points = 6; actionText = '+6 💕'; break;
      }

      addPopup(cat.position.x, cat.position.y - 35, actionText);
      setScore(s => s + points);

      return {
        ...cat,
        needs: {
          ...cat.needs,
          [needType]: Math.max(0, cat.needs[needType] - 50),
        },
        state: needType === 'hunger' || needType === 'water'
          ? 'eating'
          : needType === 'play'
            ? 'playing'
            : 'purring',
        lastMoveTime: Date.now(),
      };
    }));

    // Mark the round action as complete and check for round completion
    setRoundActions(prev => {
      const updated = [...prev];
      const actionIndex = updated.findIndex(a => a.type === needType && !a.completed);
      if (actionIndex !== -1) {
        updated[actionIndex] = { ...updated[actionIndex], completed: true };
      }
      // Schedule round completion check for after state updates
      setTimeout(() => checkRoundComplete(updated), 100);
      return updated;
    });

    setTimeout(() => {
      setCats(prev => prev.map(cat => ({ ...cat, state: 'idle' })));
    }, 600);
  }, [addPopup, checkRoundComplete]);

  const applyActionSuccess = useCallback((window: ActionWindow) => {
    if (window.type === 'food') {
      fulfillNeed(window.catId, 'hunger');
      setZones(prev => prev.map(z => z.id === 'food_bowl' ? { ...z, isEmpty: false, fillLevel: 100 } : z));
    }
    if (window.type === 'water') {
      fulfillNeed(window.catId, 'water');
      setZones(prev => prev.map(z => z.id === 'water_bowl' ? { ...z, fillLevel: 100 } : z));
    }
    if (window.type === 'play') {
      fulfillNeed(window.catId, 'play');
    }
    if (window.type === 'pet') {
      fulfillNeed(window.catId, 'attention');
    }
    if (window.type === 'no_no' && window.zoneId) {
      // Stop the wobbling
      setZones(prev => prev.map(z => z.id === window.zoneId ? { ...z, isWobbling: false, lastNoNoFailAt: undefined } : z));
      
      const cat = cats.find(cat => cat.id === window.catId);
      addPopup(cat?.position.x ?? 0, cat?.position.y ?? 0, 'NO NO! ✋');
      
      // If in disaster mode, complete the disaster action
      if (isDisasterMode) {
        setIsDisasterMode(false);
        setCats(prev => prev.map(c => ({ ...c, target: null })));
        
        // Mark disaster action as complete
        setRoundActions(prev => {
          const updated = prev.map(a => a.type === 'disaster' ? { ...a, completed: true } : a);
          setTimeout(() => checkRoundComplete(updated), 100);
          return updated;
        });
      }
    }
    clearActionWindow();
  }, [addPopup, cats, clearActionWindow, fulfillNeed, isDisasterMode, checkRoundComplete]);

  const applyActionFailure = useCallback((window: ActionWindow) => {
    if (window.type === 'food') {
      setScore(s => s - 6);
      addPopup(cats.find(cat => cat.id === window.catId)?.position.x ?? 0, cats.find(cat => cat.id === window.catId)?.position.y ?? 0, '-6');
    }
    if (window.type === 'water') {
      setScore(s => s - 4);
      addPopup(cats.find(cat => cat.id === window.catId)?.position.x ?? 0, cats.find(cat => cat.id === window.catId)?.position.y ?? 0, '-4');
    }
    if (window.type === 'play') {
      setScore(s => s - 4);
      addPopup(cats.find(cat => cat.id === window.catId)?.position.x ?? 0, cats.find(cat => cat.id === window.catId)?.position.y ?? 0, '-4');
    }
    if (window.type === 'pet') {
      setScore(s => s - 3);
      addPopup(cats.find(cat => cat.id === window.catId)?.position.x ?? 0, cats.find(cat => cat.id === window.catId)?.position.y ?? 0, '-3');
    }
    if (window.type === 'no_no' && window.zoneId) {
      const zone = zones.find(z => z.id === window.zoneId);
      const penalty = DISASTER_PENALTIES[zone?.type ?? 'vase'] ?? 15;
      setZones(prev => prev.map(z => z.id === window.zoneId ? { ...z, isWobbling: false, isFallen: true, lastNoNoFailAt: undefined } : z));
      setScore(s => s - penalty);
      addPopup(
        cats.find(cat => cat.id === window.catId)?.position.x ?? 0,
        cats.find(cat => cat.id === window.catId)?.position.y ?? 0,
        `-${penalty} 💔`
      );
    }
    clearActionWindow();
  }, [addPopup, cats, clearActionWindow, zones]);

  useEffect(() => {
    if (!actionWindow) return;
    if (actionWindow.type === 'no_no') return;
    const interval = setInterval(() => {
      if (Date.now() > actionWindow.expiresAt) {
        applyActionFailure(actionWindow);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [actionWindow, applyActionFailure]);

  // Arrow key movement handler
  useEffect(() => {
    if (!gameStarted || gameOver || roundPaused) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      // Arrow key movement (only when not in disaster mode or action window)
      if (!isDisasterMode && !actionWindow && ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        event.preventDefault();
        setKeysPressed(prev => new Set(prev).add(key));
        return;
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        setKeysPressed(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, gameOver, roundPaused, isDisasterMode, actionWindow]);

  // Action key handler
  useEffect(() => {
    if (!gameStarted || gameOver || roundPaused) return;
    
    const handler = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const cat = cats[0];
      if (!cat) return;
      
      const currentAction = roundActions.find(a => !a.completed);
      
      // Handle action window (action keys for actions, N for no-no)
      if (actionWindow) {
        const isCorrectKey =
          (actionWindow.type === 'food' && key === 'f') ||
          (actionWindow.type === 'water' && key === 'w') ||
          (actionWindow.type === 'play' && key === 'p') ||
          (actionWindow.type === 'pet' && key === 't') ||
          (actionWindow.type === 'no_no' && key === 'n');
        if (!isCorrectKey) return;

        // Visual feedback for bowl filling
        if (actionWindow.type === 'food') {
          const foodBowl = zones.find(z => z.id === 'food_bowl');
          if (foodBowl) {
            addPopup(foodBowl.position.x + 30, foodBowl.position.y - 10, '+🍖');
            setZones(prev => prev.map(z =>
              z.id === 'food_bowl'
                ? { ...z, fillLevel: Math.min(100, (z.fillLevel || 0) + (100 / ACTION_PRESS_COUNTS.food)) }
                : z
            ));
          }
        } else if (actionWindow.type === 'water') {
          const waterBowl = zones.find(z => z.id === 'water_bowl');
          if (waterBowl) {
            addPopup(waterBowl.position.x + 30, waterBowl.position.y - 10, '+💧');
            setZones(prev => prev.map(z =>
              z.id === 'water_bowl'
                ? { ...z, fillLevel: Math.min(100, (z.fillLevel || 0) + (100 / ACTION_PRESS_COUNTS.water)) }
                : z
            ));
          }
        }

        setActionWindow(prev => {
          if (!prev) return prev;
          const nextCount = prev.currentPresses + 1;
          if (nextCount >= prev.requiredPresses) {
            applyActionSuccess(prev);
            return null;
          }
          return { ...prev, currentPresses: nextCount };
        });
        return;
      }
      
      // Disaster mode - only N key works
      if (isDisasterMode && currentAction?.type === 'disaster') {
        if (key === 'n') {
          const targetZoneId = currentAction.targetZoneId;
          if (targetZoneId) {
            startActionWindow('no_no', cat.id, targetZoneId, 1);
          }
        }
        return;
      }

      // Check if trying to do wrong action
      const actionTypeForKey = {
        'f': 'hunger',
        'w': 'water',
        'p': 'play',
        't': 'attention',
      } as const;

      if (key in actionTypeForKey) {
        const attemptedAction = actionTypeForKey[key as keyof typeof actionTypeForKey];

        // Check if this is the correct action for the current round
        if (currentAction?.type !== attemptedAction) {
          showWrongAction(cat.position.x, cat.position.y);
          return;
        }

        // Check proximity for non-attention actions
        if (attemptedAction !== 'attention') {
          const isNear = isCatNearCurrentTarget(cat, currentAction);
          if (!isNear) {
            addPopup(cat.position.x, cat.position.y - 30, 'Get closer!');
            return;
          }
        }

        // Start the action
        if (key === 'f') {
          startActionWindow('food', cat.id, 'food_bowl');
        } else if (key === 'w') {
          startActionWindow('water', cat.id, 'water_bowl');
        } else if (key === 'p') {
          startActionWindow('play', cat.id, 'toy1');
        } else if (key === 't') {
          // Pet is instant
          applyActionSuccess({
            type: 'pet',
            catId: cat.id,
            requiredPresses: 1,
            currentPresses: 1,
            expiresAt: Date.now() + ACTION_WINDOW_MS,
          });
        }
        return;
      }

      if (key === 'n') {
        showWrongAction(cat.position.x, cat.position.y);
        return;
      }

      return;
    };
    
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cats, actionWindow, applyActionSuccess, gameOver, gameStarted, roundPaused, startActionWindow, zones, roundActions, isDisasterMode, isCatNearCurrentTarget, addPopup, showWrongAction]);


  // Start game
  const startGame = useCallback(() => {
    const pos = getRandomSpawnPosition();
    
    // Generate first round actions
    const firstRoundActions = generateRoundActions(1);
    
    // Calculate timer for first round
    const firstRoundTimer = calculateRoundTimer(1, firstRoundActions.length);
    
    // Set initial needs based on round actions
    const initialNeeds = { hunger: 20, water: 20, play: 20, attention: 20 };
    firstRoundActions.forEach((action, idx) => {
      if (action.type !== 'disaster') {
        initialNeeds[action.type] = DISASTER_THRESHOLD + 10 - (idx * 15);
      }
    });
    
    const initialCats: Cat[] = [{
      id: 'cat-0',
      ...CATS[0],
      position: pos,
      velocity: { x: 0, y: 0 },
      needs: initialNeeds,
      state: 'idle',
      target: null,
      personality: 'balanced',
      lastMoveTime: Date.now(),
    }];

    setCats(initialCats);
    setZones(ROOM_ZONES.map(z => ({ ...z, isWobbling: false, isFallen: false, lastNoNoFailAt: undefined })));
    setScore(100);
    setGameOver(false);
    setGameStarted(true);
    setPopups([]);
    setDisasterMode(false);
    setActionWindow(null);
    setCurrentRound(1);
    setRoundActions(firstRoundActions);
    setShowRoundBanner(true);
    setRoundPaused(true);
    // Initialize timer
    setRoundTimerTotal(firstRoundTimer);
    setRoundTimeRemaining(firstRoundTimer);
    setRoundTimerActive(false);
    setShowTimerCritical(false);
    catIdRef.current = 1;
    
    // Hide banner after 2 seconds and start timer
    setTimeout(() => {
      setShowRoundBanner(false);
      setRoundPaused(false);
      setRoundTimerActive(true);
    }, 2000);
  }, [generateRoundActions, calculateRoundTimer]);

  // SIMPLIFIED MODE: Single cat only - no additional cat spawning
  // TODO: Re-enable cat spawning for full game experience
  // useEffect(() => {
  //   if (!gameStarted || gameOver) return;
  //
  //   const interval = setInterval(() => {
  //     if (catIdRef.current < 6) {
  //       const catTemplate = CATS[catIdRef.current % CATS.length];
  //       const pos = getRandomSpawnPosition();
  //       const newCat: Cat = {
  //         id: `cat-${catIdRef.current}`,
  //         ...catTemplate,
  //         position: pos,
  //         velocity: { x: 0, y: 0 },
  //         needs: { hunger: 20, water: 20, play: 20, attention: 20 },
  //         state: 'idle',
  //         target: null,
  //         personality: catIdRef.current === 1 ? 'mischievous' : 'balanced',
  //         lastMoveTime: Date.now(),
  //       };
  //       setCats(prev => [...prev, newCat]);
  //       addPopup(pos.x, pos.y - 25, `+1 ${catTemplate.emoji}`);
  //       catIdRef.current++;
  //     }
  //   }, 25000);
  //
  //   return () => clearInterval(interval);
  // }, [gameStarted, gameOver, addPopup]);

  // Game loop - handles movement and disaster mode
  useEffect(() => {
    if (!gameStarted || gameOver || roundPaused) return;

    const gameLoop = () => {
      setCats(prevCats => {
        let disasterOccurred = false;
        let disasterFailed = false;
        let failedZoneId: string | null = null;
        let failurePopupPosition = { x: prevCats[0]?.position.x ?? 350, y: prevCats[0]?.position.y ?? 300 };
        const currentAction = roundActions.find(a => !a.completed);

        const updatedCats: Cat[] = prevCats.map(cat => {
          if (cat.state === 'scolded') {
            if (Date.now() - cat.lastMoveTime > SCOLD_DURATION) {
              return { ...cat, state: 'idle', target: null } as Cat;
            }
            return cat;
          }

          let newPosition = { ...cat.position };
          const newVelocity = { ...cat.velocity };
          const newTarget = cat.target;

          // DISASTER MODE: Cat moves autonomously towards target
          if (isDisasterMode && currentAction?.type === 'disaster' && cat.target) {
            const target = cat.target;
            const dx = target.x - cat.position.x;
            const dy = target.y - cat.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 10) {
              newPosition = {
                x: cat.position.x + (dx / dist) * DISASTER_MOVE_SPEED,
                y: cat.position.y + (dy / dist) * DISASTER_MOVE_SPEED,
              };
            } else {
              // Cat reached the target before enough N presses
              const noNoIncomplete = !actionWindow
                || actionWindow.type !== 'no_no'
                || actionWindow.currentPresses < actionWindow.requiredPresses;

              if (noNoIncomplete && currentAction.targetZoneId) {
                disasterFailed = true;
                failedZoneId = currentAction.targetZoneId;
                failurePopupPosition = { x: cat.position.x, y: cat.position.y };
                newTarget = null;
              }
            }
          } 
          // PLAYER CONTROL MODE: Move cat with arrow keys
          else if (!isDisasterMode && !actionWindow) {
            let moveX = 0;
            let moveY = 0;

            if (keysPressed.has('arrowup')) moveY -= PLAYER_MOVE_SPEED;
            if (keysPressed.has('arrowdown')) moveY += PLAYER_MOVE_SPEED;
            if (keysPressed.has('arrowleft')) moveX -= PLAYER_MOVE_SPEED;
            if (keysPressed.has('arrowright')) moveX += PLAYER_MOVE_SPEED;

            if (moveX !== 0 || moveY !== 0) {
              // Normalize diagonal movement
              if (moveX !== 0 && moveY !== 0) {
                const factor = 0.707; // 1/sqrt(2)
                moveX *= factor;
                moveY *= factor;
              }

              newPosition = {
                x: Math.max(50, Math.min(GAME_WIDTH - 50, cat.position.x + moveX)),
                y: Math.max(150, Math.min(GAME_HEIGHT - 100, cat.position.y + moveY)),
              };
            }
          }

          return {
            ...cat,
            position: newPosition,
            velocity: newVelocity,
            target: newTarget,
            lastMoveTime: cat.lastMoveTime,
          } as Cat;
        });

        if (disasterFailed && failedZoneId) {
          const targetZone = zones.find(z => z.id === failedZoneId);
          const penalty = DISASTER_PENALTIES[targetZone?.type ?? 'vase'] ?? 15;
          setZones(prevZ => prevZ.map(z => z.id === failedZoneId ? { ...z, isWobbling: false, isFallen: true, lastNoNoFailAt: undefined } : z));
          setScore(s => s - penalty);
          addPopup(failurePopupPosition.x, failurePopupPosition.y, `-${penalty} 💔`);

          // Mark disaster as completed (failed) and move to next round
          setRoundActions(prev => {
            const updated = prev.map(a => a.type === 'disaster' ? { ...a, completed: true } : a);
            setTimeout(() => checkRoundComplete(updated), 100);
            return updated;
          });
          setIsDisasterMode(false);
          setActionWindow(null);
          disasterOccurred = true;
        }

        if (disasterOccurred) {
          setDisasterMode(true);
          setTimeout(() => setDisasterMode(false), 400);
        }

        if (score <= 0) {
          setGameOver(true);
          return prevCats;
        }

        return updatedCats;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameStarted, gameOver, roundPaused, score, zones, keysPressed, isDisasterMode, actionWindow, roundActions, addPopup, checkRoundComplete]);

  // Round timer countdown effect
  // IMPORTANT: Do NOT include cats in dependencies - it changes every frame and would reset the interval
  useEffect(() => {
    if (!roundTimerActive || roundPaused || gameOver || !gameStarted) return;
    
    const interval = setInterval(() => {
      setRoundTimeRemaining(prev => {
        const newTime = prev - 100; // Decrease by 100ms
        
        // Check for critical threshold
        if (roundTimerTotal > 0) {
          const percentRemaining = newTime / roundTimerTotal;
          setShowTimerCritical(percentRemaining <= TIMER_CRITICAL);
        }
        
        // Timer expired - apply penalties for incomplete actions
        if (newTime <= 0) {
          setRoundTimerActive(false);
          
          // Count incomplete actions and apply penalties
          const incompleteActions = roundActions.filter(a => !a.completed);
          let totalPenalty = 0;
          
          incompleteActions.forEach(action => {
            switch (action.type) {
              case 'hunger': totalPenalty += 6; break;
              case 'water': totalPenalty += 4; break;
              case 'play': totalPenalty += 4; break;
              case 'attention': totalPenalty += 3; break;
              case 'disaster': totalPenalty += 15; break;
            }
          });
          
          if (totalPenalty > 0) {
            setScore(s => Math.max(0, s - totalPenalty));
            // Use catsRef instead of cats to avoid dependency issues
            const currentCats = catsRef.current;
            if (currentCats.length > 0) {
              addPopup(currentCats[0].position.x, currentCats[0].position.y - 40, `TIME'S UP! -${totalPenalty}`);
            }
          }
          
          // Mark all actions as completed (failed) and move to next round
          setRoundActions(prev => prev.map(a => ({ ...a, completed: true })));
          setIsDisasterMode(false);
          
          // Check if game over
          setScore(s => {
            if (s - totalPenalty <= 0) {
              setGameOver(true);
            }
            return s;
          });
          
          // Advance to next round after delay
          setTimeout(() => {
            const nextRound = currentRound + 1;
            setCurrentRound(nextRound);
            startNewRound(nextRound);
          }, 1500);
          
          return 0;
        }
        
        return newTime;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [roundTimerActive, roundPaused, gameOver, gameStarted, roundTimerTotal, roundActions, addPopup, currentRound, startNewRound]);

  // Reset fallen objects
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const interval = setInterval(() => {
      setZones(prev => prev.map(z => z.isFallen ? { ...z, isFallen: false } : z));
    }, 15000);

    return () => clearInterval(interval);
  }, [gameStarted, gameOver]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-stone-800 to-stone-900 p-4">
      {/* Title */}
      <div className="mb-4 text-center">
        <h1 className="text-4xl font-bold text-amber-200 drop-shadow-lg">Cat Chaos Mansion</h1>
        <p className="text-stone-400 text-sm">Keep your cats happy and your valuables safe!</p>
      </div>

      {!gameStarted ? (
        <div className="flex flex-col items-center gap-6 bg-stone-800/90 p-10 rounded-2xl shadow-2xl border border-stone-700">
          <div className="text-7xl mb-2">🏠🐱</div>
          <p className="text-stone-200 text-center max-w-md text-lg">
            Guide your cat around the room to fulfill their needs!
            Move to items and press the action keys to interact.
          </p>
          
          {/* Timer info */}
          <div className="bg-amber-500/20 border border-amber-500/40 rounded-lg px-4 py-2 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-300">
              <span className="text-xl">⏱️</span>
              <span className="font-semibold">Beat the clock!</span>
            </div>
            <p className="text-amber-200/80 text-xs mt-1">
              Complete each round before time runs out. Finish fast for bonus points!
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-stone-300 text-sm">
            <div className="flex items-center gap-2"><span className="text-2xl">⬆️⬇️⬅️➡️</span> Arrow keys to move</div>
            <div className="flex items-center gap-2"><span className="text-2xl">🍖</span> At food bowl → Press F rapidly</div>
            <div className="flex items-center gap-2"><span className="text-2xl">💧</span> At water bowl → Press W rapidly</div>
            <div className="flex items-center gap-2"><span className="text-2xl">🧶</span> At toy → Press P rapidly</div>
            <div className="flex items-center gap-2"><span className="text-2xl">💕</span> Pet anywhere → Press T</div>
            <div className="flex items-center gap-2"><span className="text-2xl">✋</span> Stop mischief → Press N</div>
          </div>
          <button
            onClick={startGame}
            className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xl font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg transform hover:scale-105"
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          {/* HUD */}
          <div className="flex gap-4 mb-4 bg-stone-800/90 px-6 py-2 rounded-full shadow-lg border border-stone-700 items-center">
            <div className={`text-2xl font-bold ${score <= 25 ? 'text-red-400 animate-pulse' : 'text-amber-300'}`}>
              {score}
            </div>
            <div className="h-6 w-px bg-stone-600" />
            <div className="text-stone-400 flex items-center gap-2">
              <span className="text-sm font-medium">Round</span>
              <span className="font-bold text-amber-200 text-lg">{currentRound}</span>
            </div>
            <div className="h-6 w-px bg-stone-600" />
            {/* Timer display in HUD */}
            {roundTimerActive && roundTimerTotal > 0 && (
              <>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
                  roundTimeRemaining / roundTimerTotal <= TIMER_CRITICAL 
                    ? 'bg-red-500/30 text-red-300 animate-pulse' 
                    : roundTimeRemaining / roundTimerTotal <= TIMER_WARNING
                      ? 'bg-orange-500/20 text-orange-300'
                      : roundTimeRemaining / roundTimerTotal <= TIMER_COMFORTABLE
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-green-500/20 text-green-300'
                }`}>
                  <span>⏱️</span>
                  <span>{Math.ceil(roundTimeRemaining / 1000)}s</span>
                </div>
                <div className="h-6 w-px bg-stone-600" />
              </>
            )}
            <div className="flex items-center gap-2">
              {roundActions.map((action, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    action.completed 
                      ? 'bg-green-500/20 text-green-300 line-through' 
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  <span>{NEED_ICONS[action.type]}</span>
                  <span className="capitalize">{action.type}</span>
                  {action.completed && <span>✓</span>}
                </div>
              ))}
            </div>
            <div className="h-6 w-px bg-stone-600" />
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                showLabels ? 'bg-amber-500 text-white' : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
              }`}
            >
              {showLabels ? 'Hide Labels' : 'Show Labels'}
            </button>
            <div className="h-6 w-px bg-stone-600" />
            <button
              onClick={() => {
                setGameStarted(false);
                setCats([]);
                setScore(100);
                setRoundActions([]);
                setCurrentRound(1);
                setRoundTimerActive(false);
              }}
              className="px-3 py-1 rounded-full text-sm font-medium bg-stone-700 text-stone-300 hover:bg-red-600 hover:text-white transition-colors"
            >
              End Game
            </button>
          </div>

          <div className="flex flex-col items-center">
            {/* Game Room */}
            <div
              className={`relative rounded-xl shadow-2xl overflow-hidden border-4 ${
                showTimerCritical 
                  ? 'border-red-500 animate-timer-critical' 
                  : 'border-stone-600'
              } ${disasterMode ? 'animate-shake' : ''}`}
              style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
            >
              <svg width={GAME_WIDTH} height={GAME_HEIGHT} viewBox={`0 0 ${GAME_WIDTH} ${GAME_HEIGHT}`}>
              <defs>
                <RoomFloor />
                <RugTexture />
                <SisalPattern />
                <RoomLighting />

                {/* Red glow for danger items */}
                <filter id="dangerGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Soft shadow for furniture */}
                <filter id="furnitureShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="3" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.2" />
                </filter>

                {/* Cat shadow */}
                <filter id="catShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* ==================== ROOM BASE LAYER ==================== */}

              {/* Floor - base layer with perspective gradient */}
              <rect width={GAME_WIDTH} height={GAME_HEIGHT} fill="url(#floorPlanks)" />

              {/* Floor shadow overlay for depth */}
              <rect width={GAME_WIDTH} height={GAME_HEIGHT} fill="url(#floorShadow)" />

              {/* ==================== WALLS LAYER ==================== */}

              {/* Back wall */}
              <BackWall width={GAME_WIDTH} />

              {/* Side walls with perspective */}
              <SideWalls width={GAME_WIDTH} height={GAME_HEIGHT} />

              {/* ==================== LIGHTING LAYER ==================== */}

              {/* Window light effect */}
              <ellipse cx="130" cy="100" rx="180" ry="120" fill="url(#windowLight)" />

              {/* ==================== FURNITURE LAYER ==================== */}

              {/* Window */}
              <g filter="url(#furnitureShadow)">
                <Window x={60} y={15} width={140} height={70} />
                <ElementLabel x={130} y={95} label="Window" visible={showLabels} />
              </g>

              {/* Plants near window */}
              <g filter="url(#furnitureShadow)">
                <Plant x={25} y={70} type="fern" />
                <ElementLabel x={50} y={130} label="Fern" visible={showLabels} />
                <Plant x={220} y={70} type="cactus" />
                <ElementLabel x={245} y={130} label="Cactus" visible={showLabels} />
              </g>

              {/* Cat Tree */}
              <g filter="url(#furnitureShadow)">
                <CatTree x={330} y={10} />
                <ElementLabel x={380} y={140} label="Cat Tower" visible={showLabels} />
              </g>

              {/* Sofa */}
              <g filter="url(#furnitureShadow)">
                <Sofa x={490} y={15} width={190} height={95} />
                <ElementLabel x={585} y={120} label="Sofa" visible={showLabels} />
              </g>

              {/* Rug - placed on floor but under other furniture */}
              <g filter="url(#furnitureShadow)" style={{ opacity: 0.9 }}>
                <Rug x={270} y={185} width={180} height={130} color="#8B0000" />
                <ElementLabel x={360} y={325} label="Area Rug" visible={showLabels} />
              </g>

              {/* Bookshelf */}
              <g filter="url(#furnitureShadow)">
                <Bookshelf x={560} y={145} />
                <ElementLabel x={615} y={240} label="Bookshelf" visible={showLabels} />
              </g>

              {/* Coffee Table */}
              <g filter="url(#furnitureShadow)">
                <CoffeeTable x={210} y={105} />
                <ElementLabel x={260} y={190} label="Coffee Table" visible={showLabels} />
              </g>

              {/* ==================== INTERACTIVE ZONES ==================== */}

              {(() => {
                const currentAction = roundActions.find(a => !a.completed);
                const cat = cats[0];
                const shouldHighlightFood = !actionWindow && currentAction?.type === 'hunger';
                const shouldHighlightWater = !actionWindow && currentAction?.type === 'water';
                const shouldHighlightToys = !actionWindow && currentAction?.type === 'play';
                const isNearFood = cat ? isCatNearZone(cat, 'food_bowl').near : false;
                const isNearWater = cat ? isCatNearZone(cat, 'water_bowl').near : false;
                const isNearToy = cat ? isCatNearZone(cat, 'toy').near : false;
                
                return (
                  <>
                    {/* Food & Water Bowls */}
                    <g filter="url(#furnitureShadow)">
                      {/* Highlight ring for food bowl - changes color when cat is near */}
                      {shouldHighlightFood && (
                        <circle 
                          cx={77} cy={420} r="40" 
                          fill="none" 
                          stroke={isNearFood ? "#22c55e" : "#fbbf24"} 
                          strokeWidth="4" 
                          opacity="0.8"
                        >
                          <animate attributeName="r" values="35;45;35" dur="1s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <FoodBowl x={50} y={400} fillLevel={zones.find(z => z.id === 'food_bowl')?.fillLevel || 0} isEmpty={zones.find(z => z.id === 'food_bowl')?.isEmpty ?? true} />
                      <ElementLabel x={80} y={460} label="Food Bowl" visible={showLabels} />
                      {shouldHighlightFood && (
                        <text x={77} y={380} textAnchor="middle" fontSize="12" fill={isNearFood ? "#22c55e" : "#fbbf24"} fontWeight="bold">
                          {isNearFood ? 'Press F!' : 'Move here'}
                        </text>
                      )}
                    </g>
                    <g filter="url(#furnitureShadow)">
                      {/* Highlight ring for water bowl */}
                      {shouldHighlightWater && (
                        <circle 
                          cx={157} cy={420} r="40" 
                          fill="none" 
                          stroke={isNearWater ? "#22c55e" : "#3b82f6"} 
                          strokeWidth="4" 
                          opacity="0.8"
                        >
                          <animate attributeName="r" values="35;45;35" dur="1s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <WaterBowl x={130} y={400} fillLevel={zones.find(z => z.id === 'water_bowl')?.fillLevel || 100} />
                      <ElementLabel x={160} y={460} label="Water Bowl" visible={showLabels} />
                      {shouldHighlightWater && (
                        <text x={157} y={380} textAnchor="middle" fontSize="12" fill={isNearWater ? "#22c55e" : "#3b82f6"} fontWeight="bold">
                          {isNearWater ? 'Press W!' : 'Move here'}
                        </text>
                      )}
                    </g>

                    {/* Toys */}
                    <g style={{ opacity: 0.9 }}>
                      <g>
                        {/* Highlight ring for toy */}
                        {shouldHighlightToys && (
                          <circle 
                            cx={367} cy={377} r="30" 
                            fill="none" 
                            stroke={isNearToy ? "#22c55e" : "#a855f7"} 
                            strokeWidth="4" 
                            opacity="0.8"
                          >
                            <animate attributeName="r" values="25;35;25" dur="1s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1s" repeatCount="indefinite" />
                          </circle>
                        )}
                        <ToyBall x={350} y={360} />
                        {shouldHighlightToys && (
                          <text x={367} y={340} textAnchor="middle" fontSize="11" fill={isNearToy ? "#22c55e" : "#a855f7"} fontWeight="bold">
                            {isNearToy ? 'Press P!' : 'Move'}
                          </text>
                        )}
                      </g>
                      <ElementLabel x={370} y={405} label="Ball Toy" visible={showLabels} />
                      <g>
                        {/* Highlight ring for yarn */}
                        {shouldHighlightToys && (
                          <circle 
                            cx={477} cy={442} r="30" 
                            fill="none" 
                            stroke={isNearToy ? "#22c55e" : "#a855f7"} 
                            strokeWidth="4" 
                            opacity="0.8"
                          >
                            <animate attributeName="r" values="25;35;25" dur="1s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1s" repeatCount="indefinite" />
                          </circle>
                        )}
                        <YarnBall x={460} y={425} />
                        {shouldHighlightToys && (
                          <text x={477} y={408} textAnchor="middle" fontSize="11" fill={isNearToy ? "#22c55e" : "#a855f7"} fontWeight="bold">
                            {isNearToy ? 'Press P!' : 'Move'}
                          </text>
                        )}
                      </g>
                      <ElementLabel x={485} y={470} label="Yarn Ball" visible={showLabels} />
                    </g>
                  </>
                );
              })()}

              {/* ==================== DANGER OBJECTS WITH GLOW ==================== */}

              {zones.filter(z => z.type === 'vase').map(zone => (
                <g
                  key={zone.id}
                  className="cursor-pointer"
                  filter={zone.isWobbling ? "url(#dangerGlow)" : "url(#furnitureShadow)"}
                >
                  <Vase x={zone.position.x} y={zone.position.y} isWobbling={zone.isWobbling} isFallen={zone.isFallen} />
                  {zone.isWobbling && (
                    <g transform={`translate(${zone.position.x + 22}, ${zone.position.y - 10})`}>
                      <circle r="24" fill="#ff0000" opacity="0.2">
                        <animate attributeName="r" values="20;28;20" dur="0.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="0.5s" repeatCount="indefinite" />
                      </circle>
                      <text textAnchor="middle" fontSize="22" fill="#ff0000" fontWeight="bold">⚠️</text>
                      <text y="20" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="bold" stroke="#000" strokeWidth="0.5">SAVE!</text>
                    </g>
                  )}
                  <ElementLabel x={zone.position.x + 22} y={zone.position.y + 75} label={zone.label} visible={showLabels} />
                </g>
              ))}

              {zones.filter(z => z.type === 'lamp').map(zone => (
                <g
                  key={zone.id}
                  className="cursor-pointer"
                  filter={zone.isWobbling ? "url(#dangerGlow)" : "url(#furnitureShadow)"}
                >
                  <TableLamp x={zone.position.x} y={zone.position.y} isWobbling={zone.isWobbling} isFallen={zone.isFallen} />
                  {zone.isWobbling && (
                    <g transform={`translate(${zone.position.x + 22}, ${zone.position.y - 10})`}>
                      <circle r="20" fill="#ff0000" opacity="0.2">
                        <animate attributeName="r" values="16;22;16" dur="0.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="0.5s" repeatCount="indefinite" />
                      </circle>
                      <text textAnchor="middle" fontSize="20" fill="#ff0000" fontWeight="bold">⚠️</text>
                    </g>
                  )}
                  <ElementLabel x={zone.position.x + 22} y={zone.position.y + 75} label="Table Lamp" visible={showLabels} />
                </g>
              ))}

              {zones.filter(z => z.type === 'mug').map(zone => (
                <g
                  key={zone.id}
                  className="cursor-pointer"
                  filter={zone.isWobbling ? "url(#dangerGlow)" : "url(#furnitureShadow)"}
                >
                  <CoffeeMug x={zone.position.x} y={zone.position.y} isWobbling={zone.isWobbling} isFallen={zone.isFallen} />
                  {zone.isWobbling && (
                    <g transform={`translate(${zone.position.x + 18}, ${zone.position.y - 10})`}>
                      <circle r="20" fill="#ff0000" opacity="0.2">
                        <animate attributeName="r" values="16;22;16" dur="0.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="0.5s" repeatCount="indefinite" />
                      </circle>
                      <text textAnchor="middle" fontSize="20" fill="#ff0000" fontWeight="bold">⚠️</text>
                    </g>
                  )}
                  <ElementLabel x={zone.position.x + 18} y={zone.position.y + 55} label="Coffee Mug" visible={showLabels} />
                </g>
              ))}

              {/* ==================== CATS LAYER ==================== */}

              {cats.map(cat => {
                return (
                  <g
                    key={cat.id}
                    style={{ zIndex: Math.floor(cat.position.y) }}
                  >
                    {/* Disaster mode - cat has red glow and is being naughty */}
                    {isDisasterMode && (
                      <circle
                        cx={cat.position.x}
                        cy={cat.position.y + 10}
                        r="50"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="4"
                        opacity="0.8"
                      >
                        <animate attributeName="r" values="45;55;45" dur="0.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0.4;0.8" dur="0.5s" repeatCount="indefinite" />
                      </circle>
                    )}
                    
                    {/* Normal mode - selection glow */}
                    {!isDisasterMode && (
                      <circle
                        cx={cat.position.x}
                        cy={cat.position.y + 10}
                        r="45"
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="3"
                        strokeDasharray="8 4"
                        opacity="0.8"
                      >
                        <animate attributeName="stroke-dashoffset" values="0;24" dur="1s" repeatCount="indefinite" />
                      </circle>
                    )}
                    
                    {/* Cat sprite */}
                    <g filter="url(#catShadow)">
                      <CatSprite emoji={cat.emoji} x={cat.position.x} y={cat.position.y} state={cat.state} />
                    </g>
                    
                    {/* Disaster mode thought bubble */}
                    {isDisasterMode && (
                      <g transform={`translate(${cat.position.x + 30}, ${cat.position.y - 50})`}>
                        <ellipse cx="0" cy="0" rx="35" ry="20" fill="white" stroke="#333" strokeWidth="2" />
                        <circle cx="-25" cy="15" r="5" fill="white" stroke="#333" strokeWidth="1" />
                        <circle cx="-32" cy="22" r="3" fill="white" stroke="#333" strokeWidth="1" />
                        <text x="0" y="5" textAnchor="middle" fontSize="14" fontWeight="bold">😈 Hehe!</text>
                      </g>
                    )}

                    {/* Need indicators */}
                    <g transform={`translate(${cat.position.x - 64}, ${cat.position.y - 80})`}>
                      <rect x="-4" y="-8" width="136" height="28" rx="14" fill="rgba(0,0,0,0.75)" />

                      {(['hunger', 'water', 'play', 'attention'] as const).map((need, i) => {
                        const value = cat.needs[need];
                        const color = getNeedFillColor(value);
                        const isCritical = value >= DISASTER_THRESHOLD;

                        return (
                          <g key={need} transform={`translate(${i * 32}, 0)`}>
                            <rect x="0" y="0" width="28" height="20" rx="5" fill={isCritical ? '#ef4444' : '#333'} stroke={color} strokeWidth="2" />
                            <rect x="2" y="2" width={`${Math.min(24, (value / 100) * 24)}`} height="16" rx="2" fill={color} />
                            <text x="14" y="15" textAnchor="middle" fontSize="12">{NEED_ICONS[need]}</text>
                          </g>
                        );
                      })}
                    </g>


                    {/* Scolded indicator */}
                    {cat.state === 'scolded' && (
                      <g transform={`translate(${cat.position.x - 14}, ${cat.position.y - 75})`}>
                        <circle r="20" fill="#ef4444" opacity="0.3">
                          <animate attributeName="r" values="18;24;18" dur="0.6s" repeatCount="indefinite" />
                        </circle>
                        <text fontSize="32" filter="url(#catShadow)">✋</text>
                      </g>
                    )}

                  </g>
                );
              })}

              {/* ==================== ATMOSPHERIC OVERLAY ==================== */}

              {/* Vignette effect for room atmosphere */}
              <rect width={GAME_WIDTH} height={GAME_HEIGHT} fill="url(#vignette)" pointerEvents="none" />

              {/* ==================== ROUND TIMER BAR ==================== */}
              {roundTimerActive && roundTimerTotal > 0 && (
                (() => {
                  const percentRemaining = roundTimeRemaining / roundTimerTotal;
                  const secondsRemaining = Math.ceil(roundTimeRemaining / 1000);
                  
                  // Determine timer color and urgency state
                  let timerColor = '#22c55e'; // green - comfortable
                  let bgColor = '#166534';
                  let pulseSpeed = '0s';
                  let glowIntensity = 0;
                  let showHurry = false;
                  
                  if (percentRemaining <= TIMER_CRITICAL) {
                    timerColor = '#ef4444'; // red - critical
                    bgColor = '#7f1d1d';
                    pulseSpeed = '0.3s';
                    glowIntensity = 8;
                    showHurry = true;
                  } else if (percentRemaining <= TIMER_WARNING) {
                    timerColor = '#f97316'; // orange - warning
                    bgColor = '#7c2d12';
                    pulseSpeed = '0.6s';
                    glowIntensity = 4;
                  } else if (percentRemaining <= TIMER_COMFORTABLE) {
                    timerColor = '#eab308'; // yellow - moderate
                    bgColor = '#713f12';
                    pulseSpeed = '1s';
                    glowIntensity = 2;
                  }
                  
                  const timerWidth = 300;
                  const timerHeight = 20;
                  const timerX = (GAME_WIDTH - timerWidth) / 2;
                  const timerY = 130;
                  const fillWidth = timerWidth * percentRemaining;
                  
                  return (
                    <g>
                      {/* Timer glow effect for urgency */}
                      {glowIntensity > 0 && (
                        <rect
                          x={timerX - 5}
                          y={timerY - 5}
                          width={timerWidth + 10}
                          height={timerHeight + 10}
                          rx="12"
                          fill="none"
                          stroke={timerColor}
                          strokeWidth="3"
                          opacity="0.5"
                        >
                          <animate 
                            attributeName="opacity" 
                            values="0.6;0.2;0.6" 
                            dur={pulseSpeed} 
                            repeatCount="indefinite" 
                          />
                        </rect>
                      )}
                      
                      {/* Timer background */}
                      <rect
                        x={timerX}
                        y={timerY}
                        width={timerWidth}
                        height={timerHeight}
                        rx="10"
                        fill={bgColor}
                        stroke="#374151"
                        strokeWidth="2"
                      />
                      
                      {/* Timer fill bar */}
                      <rect
                        x={timerX}
                        y={timerY}
                        width={fillWidth}
                        height={timerHeight}
                        rx="10"
                        fill={timerColor}
                      >
                        {pulseSpeed !== '0s' && (
                          <animate 
                            attributeName="opacity" 
                            values="1;0.7;1" 
                            dur={pulseSpeed} 
                            repeatCount="indefinite" 
                          />
                        )}
                      </rect>
                      
                      {/* Timer border */}
                      <rect
                        x={timerX}
                        y={timerY}
                        width={timerWidth}
                        height={timerHeight}
                        rx="10"
                        fill="none"
                        stroke="#1f2937"
                        strokeWidth="2"
                      />
                      
                      {/* Clock icon */}
                      <text
                        x={timerX - 25}
                        y={timerY + 15}
                        fontSize="16"
                        textAnchor="middle"
                      >
                        ⏱️
                      </text>
                      
                      {/* Seconds remaining - centered on timer */}
                      <text
                        x={GAME_WIDTH / 2}
                        y={timerY + 15}
                        textAnchor="middle"
                        fontSize="14"
                        fontWeight="bold"
                        fill="#fff"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                      >
                        {secondsRemaining}s
                      </text>
                      
                      {/* HURRY! text when critical */}
                      {showHurry && (
                        <g>
                          <text
                            x={timerX + timerWidth + 40}
                            y={timerY + 16}
                            textAnchor="middle"
                            fontSize="14"
                            fontWeight="bold"
                            fill="#ef4444"
                          >
                            <animate 
                              attributeName="opacity" 
                              values="1;0.3;1" 
                              dur="0.3s" 
                              repeatCount="indefinite" 
                            />
                            HURRY!
                          </text>
                        </g>
                      )}
                      
                      {/* Time bonus indicator - shows when plenty of time left */}
                      {percentRemaining > 0.5 && (
                        <text
                          x={timerX + timerWidth + 40}
                          y={timerY + 16}
                          textAnchor="middle"
                          fontSize="11"
                          fill="#22c55e"
                          fontWeight="medium"
                        >
                          +BONUS
                        </text>
                      )}
                    </g>
                  );
                })()
              )}

              {/* Popups */}
              {popups.map(popup => (
                <g key={popup.id} transform={`translate(${popup.x}, ${popup.y})`}>
                  <text textAnchor="middle" fontSize="18" fontWeight="bold" fill={popup.value.includes('-') || popup.value.includes('❌') || popup.value.includes('Wrong') ? '#ef4444' : '#22c55e'} filter="url(#catShadow)">
                    {popup.value}
                  </text>
                </g>
              ))}
              
              {/* Wrong action feedback - red X */}
              {wrongActionFeedback.show && (
                <g transform={`translate(${wrongActionFeedback.x}, ${wrongActionFeedback.y})`}>
                  <circle r="40" fill="#ef4444" opacity="0.3">
                    <animate attributeName="r" values="30;50;30" dur="0.3s" repeatCount="2" />
                    <animate attributeName="opacity" values="0.5;0.1;0.5" dur="0.3s" repeatCount="2" />
                  </circle>
                  <text textAnchor="middle" y="10" fontSize="40" fontWeight="bold" fill="#ef4444">✗</text>
                </g>
              )}

              {/* ==================== PIXEL-STYLE INSTRUCTION BOX ==================== */}
              {(() => {
                const currentAction = roundActions.find(a => !a.completed);
                const cat = cats[0];
                const isNearTarget = cat ? isCatNearCurrentTarget(cat, currentAction) : false;
                const timePercent = roundTimerTotal > 0 ? roundTimeRemaining / roundTimerTotal : 1;
                const instruction = getInstructionText(actionWindow, roundActions, cats, isNearTarget, isDisasterMode, zones, timePercent);
                return (
                  <g transform={`translate(${GAME_WIDTH / 2}, ${GAME_HEIGHT - 45})`}>
                    {/* Pixel-style box background */}
                    <rect 
                      x="-280" y="-30" width="560" height="70" 
                      fill="#1a1a2e" 
                      stroke="#3d3d5c" 
                      strokeWidth="4"
                      rx="2"
                    />
                    {/* Inner border for pixel effect */}
                    <rect 
                      x="-276" y="-26" width="552" height="62" 
                      fill="none" 
                      stroke="#4a4a6a" 
                      strokeWidth="2"
                      rx="1"
                    />
                    {/* Corner decorations for retro feel */}
                    <rect x="-280" y="-30" width="8" height="8" fill="#fbbf24" />
                    <rect x="272" y="-30" width="8" height="8" fill="#fbbf24" />
                    <rect x="-280" y="32" width="8" height="8" fill="#fbbf24" />
                    <rect x="272" y="32" width="8" height="8" fill="#fbbf24" />
                    
                    {/* Instruction text - line 1 */}
                    <text 
                      y="-6" 
                      textAnchor="middle" 
                      fontSize="16" 
                      fontWeight="bold" 
                      fill="#fbbf24"
                      fontFamily="'Courier New', Courier, monospace"
                      style={{ letterSpacing: '1px' }}
                    >
                      {instruction.line1}
                    </text>
                    
                    {/* Instruction text - line 2 */}
                    <text 
                      y="18" 
                      textAnchor="middle" 
                      fontSize="14" 
                      fill="#e5e5e5"
                      fontFamily="'Courier New', Courier, monospace"
                      style={{ letterSpacing: '0.5px' }}
                    >
                      {instruction.line2}
                    </text>

                    {/* Action window progress bar */}
                    {actionWindow && (
                      <g transform="translate(0, 28)">
                        <rect x="-100" y="0" width="200" height="8" fill="#333" rx="2" />
                        <rect 
                          x="-100" y="0" 
                          width={`${(actionWindow.currentPresses / actionWindow.requiredPresses) * 200}`} 
                          height="8" 
                          fill="#22c55e" 
                          rx="2"
                        >
                          <animate attributeName="opacity" values="1;0.7;1" dur="0.3s" repeatCount="indefinite" />
                        </rect>
                      </g>
                    )}
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>

          {/* Round Banner */}
          {showRoundBanner && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40 pointer-events-none">
              <div className="bg-gradient-to-r from-amber-600 to-orange-500 rounded-2xl px-12 py-8 text-center shadow-2xl border-2 border-amber-300 animate-pulse">
                <div className="text-5xl font-bold text-white mb-2">Round {currentRound}</div>
                
                {/* Timer preview - shows how much time they'll have */}
                <div className="flex items-center justify-center gap-2 mt-3 mb-4">
                  <span className="text-3xl">⏱️</span>
                  <span className="text-2xl font-bold text-white">
                    {Math.ceil(roundTimerTotal / 1000)} seconds
                  </span>
                </div>
                
                <div className="flex items-center justify-center gap-4">
                  {roundActions.map((action, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                      <span className="text-2xl">{NEED_ICONS[action.type]}</span>
                      <span className="text-white font-semibold capitalize">{action.type}</span>
                    </div>
                  ))}
                </div>
                
                <p className="text-amber-100 text-sm mt-4">
                  Complete before time runs out! Finish fast for bonus points ⏱️
                </p>
              </div>
            </div>
          )}

          {/* Game Over */}
          {gameOver && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-stone-800 rounded-2xl p-10 text-center shadow-2xl border border-stone-600 animate-bounce">
                <div className="text-7xl mb-4">😿</div>
                <h2 className="text-3xl font-bold text-stone-200 mb-2">Game Over!</h2>
                <p className="text-stone-400 mb-4">Final Score: <span className="font-bold text-amber-400">{score}</span></p>
                <p className="text-stone-500 mb-6">You managed {cats.length} cat{cats.length > 1 ? 's' : ''}!</p>
                <button
                  onClick={startGame}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}

        </>
      )}

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px) rotate(-0.5deg); }
          40% { transform: translateX(6px) rotate(0.5deg); }
          60% { transform: translateX(-4px) rotate(-0.3deg); }
          80% { transform: translateX(4px) rotate(0.3deg); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        @keyframes timer-critical {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 20px 5px rgba(239, 68, 68, 0.4);
            transform: scale(1.005);
          }
        }
        .animate-timer-critical {
          animation: timer-critical 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
