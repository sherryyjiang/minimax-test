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
  type: 'hunger' | 'water' | 'play' | 'attention';
  completed: boolean;
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Constants
const GAME_WIDTH = 700;
const GAME_HEIGHT = 550;
const CAT_SPEED = 1.0;
const WANDER_SPEED = 0.25;
const NEED_INCREMENT = 0.4;
const DISASTER_THRESHOLD = 65;
const SCOLD_DURATION = 2000;
const ACTION_WINDOW_MS = 8000;
const ACTION_PRESS_COUNTS = {
  food: 5,
  water: 4,
  play: 4,
  pet: 1,
  noNoMin: 3,
  noNoMax: 5,
};

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

const NEED_ICONS = {
  hunger: '🍖',
  water: '💧',
  play: '🧶',
  attention: '💕',
};

// Get instruction text based on current game state
const getInstructionText = (
  activeCatId: string | null,
  actionWindow: ActionWindow | null,
  roundActions: RoundAction[],
  cats: Cat[]
): { line1: string; line2: string } => {
  // Find current uncompleted action
  const currentAction = roundActions.find(a => !a.completed);
  const cat = cats[0]; // Single cat mode
  
  if (!cat) {
    return { line1: 'Welcome to Cat Chaos!', line2: 'Press Start to begin' };
  }
  
  if (!currentAction) {
    return { line1: 'Round Complete!', line2: 'Great job!' };
  }
  
  const needName = currentAction.type.charAt(0).toUpperCase() + currentAction.type.slice(1);
  
  // If no cat is active, tell player to click the cat first
  if (!activeCatId) {
    return { 
      line1: `${cat.name} needs ${needName}!`,
      line2: 'Click on the cat to select it'
    };
  }
  
  // If action window is active, show press instructions
  if (actionWindow) {
    const remaining = actionWindow.requiredPresses - actionWindow.currentPresses;
    const keyMap = { food: 'F', water: 'W', play: 'P', pet: 'T', no_no: 'N' };
    const key = keyMap[actionWindow.type];
    return {
      line1: `Press ${key} to fill!`,
      line2: `${remaining} more ${remaining === 1 ? 'press' : 'presses'} needed`
    };
  }
  
  // Cat is active, give specific instructions based on need
  switch (currentAction.type) {
    case 'hunger':
      return {
        line1: `${cat.name} is hungry!`,
        line2: 'Click the FOOD BOWL, then press F'
      };
    case 'water':
      return {
        line1: `${cat.name} is thirsty!`,
        line2: 'Click the WATER BOWL, then press W'
      };
    case 'play':
      return {
        line1: `${cat.name} wants to play!`,
        line2: 'Click a TOY, then press P'
      };
    case 'attention':
      return {
        line1: `${cat.name} wants attention!`,
        line2: 'Press T to pet the cat'
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
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [actionWindow, setActionWindow] = useState<ActionWindow | null>(null);
  // Round system state
  const [currentRound, setCurrentRound] = useState(1);
  const [roundActions, setRoundActions] = useState<RoundAction[]>([]);
  const [showRoundBanner, setShowRoundBanner] = useState(false);
  const [roundPaused, setRoundPaused] = useState(false);
  const gameLoopRef = useRef<number | null>(null);
  const catIdRef = useRef(0);

  // Add popup
  const addPopup = useCallback((x: number, y: number, value: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setPopups(prev => [...prev, { id, value, x, y }]);
    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id));
    }, 1200);
  }, []);

  // Generate actions for a round based on round number
  const generateRoundActions = useCallback((round: number): RoundAction[] => {
    const actionTypes: Array<'hunger' | 'water' | 'play' | 'attention'> = ['hunger', 'water', 'play', 'attention'];
    
    // Rounds 1-3: 1-2 actions, simple intro
    // For simplified single-cat mode, we'll use 1 action per round
    const numActions = round <= 3 ? 1 : Math.min(2, 1 + Math.floor(round / 4));
    
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
    
    // Set the cat's need high for the required action
    setCats(prev => prev.map(cat => {
      const newNeeds = { hunger: 20, water: 20, play: 20, attention: 20 };
      // Set the first action's need to be urgent
      actions.forEach((action, idx) => {
        // Stagger the urgency - first action is most urgent
        newNeeds[action.type] = DISASTER_THRESHOLD + 10 - (idx * 15);
      });
      return { ...cat, needs: newNeeds, target: null };
    }));
    
    // Hide banner and unpause after 2 seconds
    setTimeout(() => {
      setShowRoundBanner(false);
      setRoundPaused(false);
    }, 2000);
  }, [generateRoundActions]);

  // Check if round is complete - called after updating round actions
  const checkRoundComplete = useCallback((updatedActions: RoundAction[]) => {
    const allComplete = updatedActions.length > 0 && updatedActions.every(a => a.completed);
    if (allComplete && !showRoundBanner) {
      // Advance to next round
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);
      
      // Show completion popup
      if (cats.length > 0) {
        addPopup(cats[0].position.x, cats[0].position.y - 50, `Round ${currentRound} Complete! 🎉`);
      }
      
      // Start next round after a brief delay
      setTimeout(() => {
        startNewRound(nextRound);
      }, 1500);
    }
  }, [showRoundBanner, currentRound, cats, addPopup, startNewRound]);

  // Get most urgent need
  const getMostUrgentNeed = useCallback((cat: Cat): { type: 'hunger' | 'water' | 'play' | 'attention'; value: number; zone?: Zone } => {
    const needs = [
      { type: 'hunger' as const, value: cat.needs.hunger, zone: zones.find(z => z.type === 'food_bowl') },
      { type: 'water' as const, value: cat.needs.water, zone: zones.find(z => z.type === 'water_bowl') },
      { type: 'play' as const, value: cat.needs.play, zone: zones.find(z => z.type === 'toy') },
      { type: 'attention' as const, value: cat.needs.attention },
    ];
    return needs.sort((a, b) => b.value - a.value)[0];
  }, [zones]);

  // Get need color based on level
  const getNeedFillColor = (value: number): string => {
    if (value < 30) return NEED_COLORS.hunger.low;
    if (value < 50) return NEED_COLORS.hunger.med;
    if (value < DISASTER_THRESHOLD) return NEED_COLORS.hunger.high;
    return NEED_COLORS.hunger.critical;
  };

  const getActionPrompt = useCallback((catId: string) => {
    if (actionWindow && actionWindow.catId === catId) {
      const remaining = Math.max(0, actionWindow.requiredPresses - actionWindow.currentPresses);
      if (actionWindow.type === 'food') return `Press F ×${remaining}`;
      if (actionWindow.type === 'water') return `Press W ×${remaining}`;
      if (actionWindow.type === 'play') return `Press P ×${remaining}`;
      if (actionWindow.type === 'pet') return `Press T ×${remaining}`;
      if (actionWindow.type === 'no_no') return `Press N ×${remaining}`;
    }
    if (activeCatId === catId) {
      return 'Select an action';
    }
    return '';
  }, [actionWindow, activeCatId]);

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
    
    setActionWindow({
      type,
      catId,
      requiredPresses,
      currentPresses: initialPresses,
      expiresAt: Date.now() + ACTION_WINDOW_MS,
      zoneId,
    });
  }, [actionWindow]);

  const clearActionWindow = useCallback(() => {
    setActionWindow(null);
    setActiveCatId(null);
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
      setZones(prev => prev.map(z => z.id === window.zoneId ? { ...z, isWobbling: false, lastNoNoFailAt: undefined } : z));
      addPopup(
        cats.find(cat => cat.id === window.catId)?.position.x ?? 0,
        cats.find(cat => cat.id === window.catId)?.position.y ?? 0,
        'Saved! ✋'
      );
    }
    clearActionWindow();
  }, [addPopup, cats, clearActionWindow, fulfillNeed]);

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
      const now = Date.now();
      let didBreak = false;
      setZones(prev => prev.map(z => {
        if (z.id !== window.zoneId) return z;
        if (z.lastNoNoFailAt && now - z.lastNoNoFailAt <= 15000) {
          didBreak = true;
          return { ...z, isWobbling: false, isFallen: true, lastNoNoFailAt: undefined };
        }
        return { ...z, lastNoNoFailAt: now };
      }));
      if (didBreak) {
        setScore(s => s - 15);
        addPopup(
          cats.find(cat => cat.id === window.catId)?.position.x ?? 0,
          cats.find(cat => cat.id === window.catId)?.position.y ?? 0,
          '-15 💔'
        );
      } else {
        setScore(s => s - 5);
        addPopup(
          cats.find(cat => cat.id === window.catId)?.position.x ?? 0,
          cats.find(cat => cat.id === window.catId)?.position.y ?? 0,
          '-5 ⚠️'
        );
      }
    }
    clearActionWindow();
  }, [addPopup, cats, clearActionWindow]);

  useEffect(() => {
    if (!actionWindow) return;
    const interval = setInterval(() => {
      if (Date.now() > actionWindow.expiresAt) {
        applyActionFailure(actionWindow);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [actionWindow, applyActionFailure]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const handler = (event: KeyboardEvent) => {
      if (!activeCatId) return;
      const key = event.key.toLowerCase();
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
            // Increment fill level visually
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
            // Increment fill level visually
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
      if (key === 't') {
        applyActionSuccess({
          type: 'pet',
          catId: activeCatId,
          requiredPresses: 1,
          currentPresses: 1,
          expiresAt: Date.now() + ACTION_WINDOW_MS,
        });
        return;
      }
      if (key === 'n') {
        const wobblingZone = zones.find(z => z.isWobbling && !z.isFallen);
        if (!wobblingZone) return;
        startActionWindow('no_no', activeCatId, wobblingZone.id, 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeCatId, actionWindow, applyActionSuccess, gameOver, gameStarted, startActionWindow, zones]);

  // Start game
  const startGame = useCallback(() => {
    const pos = getRandomSpawnPosition();
    
    // Generate first round actions
    const firstRoundActions = generateRoundActions(1);
    
    // Set initial needs based on round actions
    const initialNeeds = { hunger: 20, water: 20, play: 20, attention: 20 };
    firstRoundActions.forEach((action, idx) => {
      initialNeeds[action.type] = DISASTER_THRESHOLD + 10 - (idx * 15);
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
    setActiveCatId('cat-0'); // Auto-select the cat in simplified mode
    setActionWindow(null);
    setCurrentRound(1);
    setRoundActions(firstRoundActions);
    setShowRoundBanner(true);
    setRoundPaused(true);
    catIdRef.current = 1;
    
    // Hide banner after 2 seconds
    setTimeout(() => {
      setShowRoundBanner(false);
      setRoundPaused(false);
    }, 2000);
  }, [generateRoundActions]);

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

  // Game loop (same as before)
  useEffect(() => {
    if (!gameStarted || gameOver || roundPaused) return;

    const gameLoop = () => {
      setCats(prevCats => {
        let newScore = score;
        let disasterOccurred = false;

        const updatedCats: Cat[] = prevCats.map(cat => {
          if (cat.state === 'scolded') {
            if (Date.now() - cat.lastMoveTime > SCOLD_DURATION) {
              return { ...cat, state: 'idle', target: null } as Cat;
            }
            return cat;
          }

          const newNeeds = {
            hunger: Math.min(100, cat.needs.hunger + NEED_INCREMENT),
            water: Math.min(100, cat.needs.water + NEED_INCREMENT),
            play: Math.min(100, cat.needs.play + NEED_INCREMENT),
            attention: Math.min(100, cat.needs.attention + NEED_INCREMENT),
          };

          const urgent = getMostUrgentNeed({ ...cat, needs: newNeeds });
          let newPosition = { ...cat.position };
          let newTarget = cat.target;
          let newVelocity = { ...cat.velocity };
          const now = Date.now();

          if (cat.state === 'idle' && now - cat.lastMoveTime > 4000 && Math.random() < 0.015) {
            const wanderAngle = Math.random() * Math.PI * 2;
            newVelocity = {
              x: Math.cos(wanderAngle) * WANDER_SPEED,
              y: Math.sin(wanderAngle) * WANDER_SPEED,
            };
            newTarget = null;
          }

          if (urgent.value > DISASTER_THRESHOLD && cat.state === 'idle' && urgent.zone) {
            if (!cat.target) {
              const offsetX = (Math.random() - 0.5) * 35;
              const offsetY = (Math.random() - 0.5) * 25;
              newTarget = {
                x: urgent.zone.position.x + urgent.zone.width / 2 + offsetX,
                y: urgent.zone.position.y + urgent.zone.height / 2 + offsetY,
              };
            }
          }

          if (newTarget && cat.state === 'idle') {
            const target = newTarget;
            const dx = target.x - cat.position.x;
            const dy = target.y - cat.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 5) {
              const speed = cat.personality === 'mischievous' ? CAT_SPEED * 1.3 : CAT_SPEED;
              newPosition = {
                x: cat.position.x + (dx / dist) * speed,
                y: cat.position.y + (dy / dist) * speed,
              };
            } else {
              const zone = zones.find(z =>
                Math.abs(z.position.x + (z.width || 0)/2 - target.x) < 50 &&
                Math.abs(z.position.y + (z.height || 0)/2 - target.y) < 50
              );

              if (zone && (zone.type === 'vase' || zone.type === 'lamp' || zone.type === 'mug')) {
                setZones(prevZ => prevZ.map(z => {
                  if (z.id === zone.id && !z.isWobbling && !z.isFallen) {
                    return { ...z, isWobbling: true };
                  }
                  return z;
                }));
              }

              if (zone?.type === 'food_bowl' && !zone.isEmpty) {
                newNeeds.hunger = Math.max(0, newNeeds.hunger - 40);
                setZones(prevZ => prevZ.map(z => {
                  if (z.id === 'food_bowl') {
                    const newLevel = (z.fillLevel || 0) - 35;
                    if (newLevel <= 0) return { ...z, fillLevel: 0, isEmpty: true };
                    return { ...z, fillLevel: newLevel };
                  }
                  return z;
                }));
                newTarget = null;
              } else if (zone?.type === 'food_bowl' && zone.isEmpty) {
                newTarget = null;
              }

              if (zone?.type === 'water_bowl' && (zone.fillLevel || 0) > 0) {
                newNeeds.water = Math.max(0, newNeeds.water - 40);
                setZones(prevZ => prevZ.map(z => {
                  if (z.id === 'water_bowl') {
                    const newLevel = (z.fillLevel || 0) - 35;
                    return { ...z, fillLevel: Math.max(0, newLevel) };
                  }
                  return z;
                }));
                newTarget = null;
              } else if (zone?.type === 'water_bowl' && (zone.fillLevel || 0) <= 0) {
                newTarget = null;
              }

              if (!newTarget) {
                newVelocity = { x: 0, y: 0 };
              }
            }
          }

          if (newVelocity.x !== 0 || newVelocity.y !== 0) {
            newPosition = {
              x: Math.max(50, Math.min(GAME_WIDTH - 50, cat.position.x + newVelocity.x)),
              y: Math.max(90, Math.min(GAME_HEIGHT - 50, cat.position.y + newVelocity.y)),
            };
            newVelocity = {
              x: newVelocity.x * 0.97,
              y: newVelocity.y * 0.97,
            };
          }

          return {
            ...cat,
            needs: newNeeds,
            position: newPosition,
            velocity: newVelocity,
            target: newTarget,
            lastMoveTime: cat.lastMoveTime,
          } as Cat;
        });

        zones.forEach(zone => {
          if (zone.isWobbling && !zone.isFallen) {
            if (Math.random() < 0.012) {
              setZones(prevZ => prevZ.map(z => {
                if (z.id === zone.id) {
                  disasterOccurred = true;
                  newScore -= 15;
                  return { ...z, isWobbling: false, isFallen: true };
                }
                return z;
              }));
            }
          }
        });

        if (disasterOccurred) {
          setDisasterMode(true);
          setTimeout(() => setDisasterMode(false), 400);
        }

        if (newScore <= 0) {
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
  }, [gameStarted, gameOver, roundPaused, getMostUrgentNeed, score, zones]);

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
        <p className="text-amber-500 text-xs mt-1 bg-amber-500/10 px-3 py-1 rounded-full inline-block">🧪 Simplified Mode: Single Cat Testing</p>
      </div>

      {!gameStarted ? (
        <div className="flex flex-col items-center gap-6 bg-stone-800/90 p-10 rounded-2xl shadow-2xl border border-stone-700">
          <div className="text-7xl mb-2">🏠🐱</div>
          <p className="text-stone-200 text-center max-w-md text-lg">
            Your cats are hungry, bored, and needy! Feed them, play with them,
            give them attention, and protect your stuff from chaos!
          </p>
          <div className="grid grid-cols-2 gap-4 text-stone-300 text-sm">
            <div className="flex items-center gap-2"><span className="text-2xl">🖱️</span> Click a cat to activate</div>
            <div className="flex items-center gap-2"><span className="text-2xl">🥣</span> Click bowl, then press F/W</div>
            <div className="flex items-center gap-2"><span className="text-2xl">🎾</span> Click toy, then press P</div>
            <div className="flex items-center gap-2"><span className="text-2xl">✋</span> Press N to stop chaos</div>
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
          <div className="flex gap-6 mb-4 bg-stone-800/90 px-6 py-2 rounded-full shadow-lg border border-stone-700 items-center">
            <div className={`text-2xl font-bold ${score <= 25 ? 'text-red-400 animate-pulse' : 'text-amber-300'}`}>
              {score}
            </div>
            <div className="h-6 w-px bg-stone-600" />
            <div className="text-stone-400 flex items-center gap-2">
              <span className="text-sm font-medium">Round</span>
              <span className="font-bold text-amber-200 text-lg">{currentRound}</span>
            </div>
            <div className="h-6 w-px bg-stone-600" />
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
          </div>

          <div className="flex flex-col items-center">
            {/* Game Room */}
            <div
              className={`relative rounded-xl shadow-2xl overflow-hidden border-4 border-stone-600 ${disasterMode ? 'animate-shake' : ''}`}
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
              <BackWall width={GAME_WIDTH} height={GAME_HEIGHT} />

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
                const shouldHighlightFood = activeCatId && !actionWindow && currentAction?.type === 'hunger';
                const shouldHighlightWater = activeCatId && !actionWindow && currentAction?.type === 'water';
                const shouldHighlightToys = activeCatId && !actionWindow && currentAction?.type === 'play';
                
                return (
                  <>
                    {/* Food & Water Bowls */}
                    <g
                      filter="url(#furnitureShadow)"
                      onClick={() => {
                        if (!activeCatId || actionWindow) return;
                        startActionWindow('food', activeCatId, 'food_bowl');
                      }}
                      className="cursor-pointer"
                    >
                      {/* Highlight ring for food bowl */}
                      {shouldHighlightFood && (
                        <circle cx={77} cy={420} r="40" fill="none" stroke="#fbbf24" strokeWidth="4" opacity="0.8">
                          <animate attributeName="r" values="35;45;35" dur="1s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <FoodBowl x={50} y={400} fillLevel={zones.find(z => z.id === 'food_bowl')?.fillLevel || 0} isEmpty={zones.find(z => z.id === 'food_bowl')?.isEmpty ?? true} />
                      <ElementLabel x={80} y={460} label="Food Bowl" visible={showLabels} />
                      {shouldHighlightFood && (
                        <text x={77} y={380} textAnchor="middle" fontSize="12" fill="#fbbf24" fontWeight="bold">
                          CLICK HERE
                        </text>
                      )}
                    </g>
                    <g
                      filter="url(#furnitureShadow)"
                      onClick={() => {
                        if (!activeCatId || actionWindow) return;
                        startActionWindow('water', activeCatId, 'water_bowl');
                      }}
                      className="cursor-pointer"
                    >
                      {/* Highlight ring for water bowl */}
                      {shouldHighlightWater && (
                        <circle cx={157} cy={420} r="40" fill="none" stroke="#3b82f6" strokeWidth="4" opacity="0.8">
                          <animate attributeName="r" values="35;45;35" dur="1s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <WaterBowl x={130} y={400} fillLevel={zones.find(z => z.id === 'water_bowl')?.fillLevel || 100} />
                      <ElementLabel x={160} y={460} label="Water Bowl" visible={showLabels} />
                      {shouldHighlightWater && (
                        <text x={157} y={380} textAnchor="middle" fontSize="12" fill="#3b82f6" fontWeight="bold">
                          CLICK HERE
                        </text>
                      )}
                    </g>

                    {/* Toys */}
                    <g style={{ opacity: 0.9 }}>
                      <g
                        onClick={() => {
                          if (!activeCatId || actionWindow) return;
                          startActionWindow('play', activeCatId, 'toy1');
                        }}
                        className="cursor-pointer"
                      >
                        {/* Highlight ring for toy */}
                        {shouldHighlightToys && (
                          <circle cx={367} cy={377} r="30" fill="none" stroke="#22c55e" strokeWidth="4" opacity="0.8">
                            <animate attributeName="r" values="25;35;25" dur="1s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1s" repeatCount="indefinite" />
                          </circle>
                        )}
                        <ToyBall x={350} y={360} />
                        {shouldHighlightToys && (
                          <text x={367} y={340} textAnchor="middle" fontSize="11" fill="#22c55e" fontWeight="bold">
                            CLICK
                          </text>
                        )}
                      </g>
                      <ElementLabel x={370} y={405} label="Ball Toy" visible={showLabels} />
                      <g
                        onClick={() => {
                          if (!activeCatId || actionWindow) return;
                          startActionWindow('play', activeCatId, 'toy2');
                        }}
                        className="cursor-pointer"
                      >
                        {/* Highlight ring for yarn */}
                        {shouldHighlightToys && (
                          <circle cx={477} cy={442} r="30" fill="none" stroke="#22c55e" strokeWidth="4" opacity="0.8">
                            <animate attributeName="r" values="25;35;25" dur="1s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1s" repeatCount="indefinite" />
                          </circle>
                        )}
                        <YarnBall x={460} y={425} />
                        {shouldHighlightToys && (
                          <text x={477} y={408} textAnchor="middle" fontSize="11" fill="#22c55e" fontWeight="bold">
                            CLICK
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
                const urgent = getMostUrgentNeed({ ...cat, needs: {
                  hunger: cat.needs.hunger,
                  water: cat.needs.water,
                  play: cat.needs.play,
                  attention: cat.needs.attention,
                }});

                return (
                  <g
                    key={cat.id}
                    className="cursor-pointer"
                    onClick={() => {
                      if (actionWindow) return;
                      setActiveCatId(cat.id);
                    }}
                    style={{ zIndex: Math.floor(cat.position.y) }}
                  >
                    {/* Active cat selection glow */}
                    {activeCatId === cat.id && (
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

              {/* Popups */}
              {popups.map(popup => (
                <g key={popup.id} transform={`translate(${popup.x}, ${popup.y})`}>
                  <text textAnchor="middle" fontSize="18" fontWeight="bold" fill={popup.value.includes('-') ? '#ef4444' : '#22c55e'} filter="url(#catShadow)">
                    {popup.value}
                  </text>
                </g>
              ))}

              {/* ==================== PIXEL-STYLE INSTRUCTION BOX ==================== */}
              {(() => {
                const instruction = getInstructionText(activeCatId, actionWindow, roundActions, cats);
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
                <div className="flex items-center justify-center gap-4 mt-4">
                  {roundActions.map((action, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                      <span className="text-2xl">{NEED_ICONS[action.type]}</span>
                      <span className="text-white font-semibold capitalize">{action.type}</span>
                    </div>
                  ))}
                </div>
                <p className="text-amber-100 text-sm mt-4">Complete the actions above!</p>
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
      `}</style>
    </div>
  );
}
