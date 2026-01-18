'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  RoomElements, WoodFloor, Window, CatTree,
  FoodBowl, WaterBowl, Rug, Bookshelf, Sofa, DiningTable,
  Vase, TableLamp, CoffeeMug, Plant, ToyBall, YarnBall,
  CatSprite, WindowPlant, SisalPattern, RoomBackground,
  BackWall, SideWalls, RealisticFloor, ElementLabel
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
}

interface Popup {
  id: string;
  value: string;
  x: number;
  y: number;
}

// Constants
const GAME_WIDTH = 700;
const GAME_HEIGHT = 550;
const CAT_SPEED = 1.0;
const WANDER_SPEED = 0.25;
const NEED_INCREMENT = 0.4;
const DISASTER_THRESHOLD = 65;
const SCOLD_DURATION = 2000;

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
  { id: 'window', type: 'window', emoji: '🪟', position: { x: 80, y: 25 }, width: 120, height: 55, label: 'Window' },

  // Plants
  { id: 'plant1', type: 'plant', emoji: '🌿', position: { x: 30, y: 70 }, width: 45, height: 45, label: 'Potted Plant' },
  { id: 'plant2', type: 'plant', emoji: '🌵', position: { x: 190, y: 70 }, width: 45, height: 45, label: 'Cactus' },

  // Cat tree (larger, more prominent)
  { id: 'cattree', type: 'cat_tree', emoji: '🏰', position: { x: 350, y: 15 }, width: 100, height: 110, label: 'Cat Tower' },

  // Sofa (larger)
  { id: 'sofa', type: 'sofa', emoji: '🛋️', position: { x: 520, y: 20 }, width: 160, height: 80, label: 'Sofa' },

  // Rug (center floor)
  { id: 'rug', type: 'rug', emoji: '', position: { x: 280, y: 200 }, width: 180, height: 120, label: 'Area Rug' },

  // Bookshelf
  { id: 'bookshelf', type: 'bookshelf', emoji: '📚', position: { x: 580, y: 160 }, width: 100, height: 80, label: 'Bookshelf' },

  // Vases on bookshelf
  { id: 'vase1', type: 'vase', emoji: '🏺', position: { x: 590, y: 110 }, width: 45, height: 55, label: 'Flower Vase' },
  { id: 'vase2', type: 'vase', emoji: '⚱️', position: { x: 650, y: 115 }, width: 40, height: 50, label: 'Decorative Vase' },

  // Table and items
  { id: 'table', type: 'sofa', emoji: '🪑', position: { x: 230, y: 120 }, width: 90, height: 70, label: 'Coffee Table' },
  { id: 'lamp', type: 'lamp', emoji: '💡', position: { x: 240, y: 90 }, width: 40, height: 55, label: 'Table Lamp' },
  { id: 'mug', type: 'mug', emoji: '☕', position: { x: 280, y: 95 }, width: 35, height: 40, label: 'Coffee Mug' },

  // Food area
  { id: 'food_bowl', type: 'food_bowl', emoji: '🍖', position: { x: 60, y: 400 }, width: 55, height: 45, label: 'Food Bowl' },
  { id: 'water_bowl', type: 'water_bowl', emoji: '💧', position: { x: 140, y: 400 }, width: 55, height: 45, label: 'Water Bowl' },

  // Toys
  { id: 'toy1', type: 'toy', emoji: '🎾', position: { x: 360, y: 360 }, width: 35, height: 35, label: 'Ball Toy' },
  { id: 'toy2', type: 'toy', emoji: '🧶', position: { x: 470, y: 420 }, width: 35, height: 35, label: 'Yarn Ball' },
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
  play: { low: '#22c55e', med: '#eab308', high: '#f97316', critical: '#ef4444' },
  attention: { low: '#22c55e', med: '#eab308', high: '#f97316', critical: '#ef4444' },
};

const NEED_ICONS = {
  hunger: '🍖',
  play: '🧶',
  attention: '💕',
};

export default function CatChaosGame() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [zones, setZones] = useState<Zone[]>(ROOM_ZONES);
  const [score, setScore] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [disasterMode, setDisasterMode] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(false); // Toggle for educational labels
  const gameLoopRef = useRef<number>();
  const catIdRef = useRef(0);

  // Add popup
  const addPopup = useCallback((x: number, y: number, value: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setPopups(prev => [...prev, { id, value, x, y }]);
    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id));
    }, 1200);
  }, []);

  // Get most urgent need
  const getMostUrgentNeed = (cat: Cat): { type: 'hunger' | 'play' | 'attention'; value: number; zone?: Zone } => {
    const needs = [
      { type: 'hunger' as const, value: cat.needs.hunger, zone: zones.find(z => z.type === 'food_bowl') },
      { type: 'play' as const, value: cat.needs.play, zone: zones.find(z => z.type === 'cat_tree') },
      { type: 'attention' as const, value: cat.needs.attention },
    ];
    return needs.sort((a, b) => b.value - a.value)[0];
  };

  // Get need color based on level
  const getNeedFillColor = (value: number): string => {
    if (value < 30) return NEED_COLORS.hunger.low;
    if (value < 50) return NEED_COLORS.hunger.med;
    if (value < DISASTER_THRESHOLD) return NEED_COLORS.hunger.high;
    return NEED_COLORS.hunger.critical;
  };

  // Fill food bowl
  const fillFoodBowl = () => {
    setZones(prev => prev.map(z => {
      if (z.id === 'food_bowl') {
        addPopup(z.position.x + 27, z.position.y - 15, '+5 🍖');
        setScore(s => Math.min(s + 5, 200));
        return { ...z, isEmpty: false, fillLevel: 100 };
      }
      return z;
    }));
  };

  // Fill water bowl
  const fillWaterBowl = () => {
    setZones(prev => prev.map(z => {
      if (z.id === 'water_bowl') {
        addPopup(z.position.x + 27, z.position.y - 15, '+3 💧');
        setScore(s => Math.min(s + 3, 200));
        return { ...z, fillLevel: 100 };
      }
      return z;
    }));
  };

  // Scold cat
  const scoldCat = (catId: string) => {
    setCats(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      addPopup(cat.position.x, cat.position.y - 50, 'No No! ✋');
      setScore(s => s + 2);
      return { ...cat, state: 'scolded', lastMoveTime: Date.now() };
    }));
  };

  // Fulfill cat need
  const fulfillNeed = (catId: string, needType: 'hunger' | 'play' | 'attention') => {
    setCats(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;

      let points = 0;
      let actionText = '';
      switch (needType) {
        case 'hunger': points = 10; actionText = '+10 🍖'; break;
        case 'play': points = 15; actionText = '+15 🎾'; break;
        case 'attention': points = 5; actionText = '+5 💕'; break;
      }

      addPopup(cat.position.x, cat.position.y - 35, actionText);
      setScore(s => s + points);

      return {
        ...cat,
        needs: {
          ...cat.needs,
          [needType]: Math.max(0, cat.needs[needType] - 50),
        },
        state: needType === 'hunger' ? 'eating' : needType === 'play' ? 'playing' : 'purring',
        lastMoveTime: Date.now(),
      };
    }));

    setTimeout(() => {
      setCats(prev => prev.map(cat => ({ ...cat, state: 'idle' })));
    }, 600);
  };

  // Start game
  const startGame = useCallback(() => {
    const pos = getRandomSpawnPosition();
    const initialCats: Cat[] = [{
      id: 'cat-0',
      ...CATS[0],
      position: pos,
      velocity: { x: 0, y: 0 },
      needs: { hunger: 15, play: 15, attention: 15 },
      state: 'idle',
      target: null,
      personality: 'balanced',
      lastMoveTime: Date.now(),
    }];

    setCats(initialCats);
    setZones(ROOM_ZONES.map(z => ({ ...z, isWobbling: false, isFallen: false })));
    setScore(100);
    setGameOver(false);
    setGameStarted(true);
    setPopups([]);
    setDisasterMode(false);
    catIdRef.current = 1;
  }, []);

  // Add new cat periodically
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const interval = setInterval(() => {
      if (catIdRef.current < 6) {
        const catTemplate = CATS[catIdRef.current % CATS.length];
        const pos = getRandomSpawnPosition();
        const newCat: Cat = {
          id: `cat-${catIdRef.current}`,
          ...catTemplate,
          position: pos,
          velocity: { x: 0, y: 0 },
          needs: { hunger: 20, play: 20, attention: 20 },
          state: 'idle',
          target: null,
          personality: catIdRef.current === 1 ? 'mischievous' : 'balanced',
          lastMoveTime: Date.now(),
        };
        setCats(prev => [...prev, newCat]);
        addPopup(pos.x, pos.y - 25, `+1 ${catTemplate.emoji}`);
        catIdRef.current++;
      }
    }, 25000);

    return () => clearInterval(interval);
  }, [gameStarted, gameOver, addPopup]);

  // Game loop (same as before)
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = () => {
      setCats(prevCats => {
        let newScore = score;
        let disasterOccurred = false;

        const updatedCats = prevCats.map(cat => {
          if (cat.state === 'scolded') {
            if (Date.now() - cat.lastMoveTime > SCOLD_DURATION) {
              return { ...cat, state: 'idle', target: null };
            }
            return cat;
          }

          const newNeeds = {
            hunger: Math.min(100, cat.needs.hunger + NEED_INCREMENT),
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
            const dx = newTarget.x - cat.position.x;
            const dy = newTarget.y - cat.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 5) {
              const speed = cat.personality === 'mischievous' ? CAT_SPEED * 1.3 : CAT_SPEED;
              newPosition = {
                x: cat.position.x + (dx / dist) * speed,
                y: cat.position.y + (dy / dist) * speed,
              };
            } else {
              const zone = zones.find(z =>
                Math.abs(z.position.x + (z.width || 0)/2 - newTarget.x) < 50 &&
                Math.abs(z.position.y + (z.height || 0)/2 - newTarget.y) < 50
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
          };
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
  }, [gameStarted, gameOver, score, zones]);

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
            Your cats are hungry, bored, and needy! Feed them, play with them,
            give them attention, and protect your stuff from chaos!
          </p>
          <div className="grid grid-cols-2 gap-4 text-stone-300 text-sm">
            <div className="flex items-center gap-2"><span className="text-2xl">🥣</span> Click bowls to fill</div>
            <div className="flex items-center gap-2"><span className="text-2xl">✋</span> Say "No No!" to scold</div>
            <div className="flex items-center gap-2"><span className="text-2xl">⚠️</span> Click to save items!</div>
            <div className="flex items-center gap-2"><span className="text-2xl">🏰</span> Cats love cat tower!</div>
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
          <div className="flex gap-6 mb-3 bg-stone-800/90 px-6 py-2 rounded-full shadow-lg border border-stone-700 items-center">
            <div className={`text-2xl font-bold ${score <= 25 ? 'text-red-400 animate-pulse' : 'text-amber-300'}`}>
              {score}
            </div>
            <div className="text-stone-400 flex items-center gap-2">
              <span className="text-xl">🐱</span>
              <span className="font-semibold text-stone-200">{cats.length}</span>
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

          {/* Game Room */}
          <div
            className={`relative rounded-xl shadow-2xl overflow-hidden border-4 border-stone-600 ${disasterMode ? 'animate-shake' : ''}`}
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          >
            <svg width={GAME_WIDTH} height={GAME_HEIGHT} viewBox={`0 0 ${GAME_WIDTH} ${GAME_HEIGHT}`}>
              <defs>
                <RealisticFloor />
                <SisalPattern />

                {/* Red glow for danger items */}
                <filter id="dangerGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Lighting gradient */}
                <radialGradient id="roomLight" cx="50%" cy="40%" r="70%">
                  <stop offset="0%" stopColor="#fff8e7" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#1a1a1a" stopOpacity="0" />
                </radialGradient>

                {/* Cat shadow */}
                <filter id="catShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.35" />
                </filter>

                {/* Furniture shadow */}
                <filter id="furnitureShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="4" dy="5" stdDeviation="5" floodColor="#000" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* Room Background Image */}
              <RoomBackground imageUrl="/room-bg.png" />

              {/* Floor with slight transparency to show background */}
              <rect width={GAME_WIDTH} height={GAME_HEIGHT} fill="url(#realisticFloor)" style={{ opacity: 0.7 }} />

              {/* Back Wall with picture and lamp */}
              <BackWall width={GAME_WIDTH} height={GAME_HEIGHT} />

              {/* Side Walls */}
              <SideWalls width={GAME_WIDTH} height={GAME_HEIGHT} />

              {/* Lighting overlay */}
              <rect width={GAME_WIDTH} height={GAME_HEIGHT} fill="url(#roomLight)" pointerEvents="none" />

              {/* ==================== ROOM FURNITURE LAYER ==================== */}

              {/* Window */}
              <g filter="url(#furnitureShadow)">
                <Window x={60} y={20} width={140} height={60} />
                <ElementLabel x={130} y={90} label="Window" visible={showLabels} />
              </g>

              {/* Plants near window */}
              <g filter="url(#furnitureShadow)">
                <Plant x={25} y={65} type="fern" />
                <ElementLabel x={50} y={120} label="Fern" visible={showLabels} />
                <Plant x={195} y={65} type="cactus" />
                <ElementLabel x={215} y={120} label="Cactus" visible={showLabels} />
              </g>

              {/* Cat Tree */}
              <g filter="url(#furnitureShadow)">
                <CatTree x={340} y={5} />
                <ElementLabel x={390} y={130} label="Cat Tower" visible={showLabels} />
              </g>

              {/* Sofa */}
              <g filter="url(#furnitureShadow)">
                <Sofa x={510} y={15} width={175} height={90} />
                <ElementLabel x={595} y={115} label="Sofa" visible={showLabels} />
              </g>

              {/* Rug */}
              <g filter="url(#furnitureShadow)" style={{ opacity: 0.85 }}>
                <Rug x={270} y={190} width={190} height={130} color="#8B0000" />
                <ElementLabel x={365} y={330} label="Area Rug" visible={showLabels} />
              </g>

              {/* Bookshelf */}
              <g filter="url(#furnitureShadow)">
                <Bookshelf x={570} y={150} />
                <ElementLabel x={620} y={240} label="Bookshelf" visible={showLabels} />
              </g>

              {/* Dining Table */}
              <g filter="url(#furnitureShadow)">
                <DiningTable x={220} y={110} />
                <ElementLabel x={265} y={190} label="Coffee Table" visible={showLabels} />
              </g>

              {/* ==================== INTERACTIVE ZONES ==================== */}

              {/* Food & Water Bowls */}
              <g filter="url(#furnitureShadow)" onClick={fillFoodBowl} className="cursor-pointer">
                <FoodBowl x={55} y={395} fillLevel={zones.find(z => z.id === 'food_bowl')?.fillLevel || 0} isEmpty={zones.find(z => z.id === 'food_bowl')?.isEmpty ?? true} />
                <ElementLabel x={85} y={455} label="Food Bowl" visible={showLabels} />
              </g>
              <g filter="url(#furnitureShadow)" onClick={fillWaterBowl} className="cursor-pointer">
                <WaterBowl x={135} y={395} fillLevel={zones.find(z => z.id === 'water_bowl')?.fillLevel || 100} />
                <ElementLabel x={165} y={455} label="Water Bowl" visible={showLabels} />
              </g>

              {/* Toys */}
              <g style={{ opacity: 0.9 }}>
                <ToyBall x={355} y={355} />
                <ElementLabel x={375} y={400} label="Ball Toy" visible={showLabels} />
                <YarnBall x={460} y={415} />
                <ElementLabel x={485} y={460} label="Yarn Ball" visible={showLabels} />
              </g>

              {/* ==================== DANGER OBJECTS WITH GLOW ==================== */}

              {zones.filter(z => z.type === 'vase').map(zone => (
                <g
                  key={zone.id}
                  onClick={() => zone.isWobbling && setZones(prev => prev.map(z => z.id === zone.id ? { ...z, isWobbling: false } : z))}
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
                  <ElementLabel x={zone.position.x + 20} y={zone.position.y + 65} label={zone.label} visible={showLabels} />
                </g>
              ))}

              {zones.filter(z => z.type === 'lamp').map(zone => (
                <g
                  key={zone.id}
                  onClick={() => zone.isWobbling && setZones(prev => prev.map(z => z.id === zone.id ? { ...z, isWobbling: false } : z))}
                  className="cursor-pointer"
                  filter={zone.isWobbling ? "url(#dangerGlow)" : "url(#furnitureShadow)"}
                >
                  <TableLamp x={zone.position.x} y={zone.position.y} isWobbling={zone.isWobbling} isFallen={zone.isFallen} />
                  {zone.isWobbling && (
                    <g transform={`translate(${zone.position.x + 20}, ${zone.position.y - 10})`}>
                      <circle r="20" fill="#ff0000" opacity="0.2">
                        <animate attributeName="r" values="16;22;16" dur="0.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="0.5s" repeatCount="indefinite" />
                      </circle>
                      <text textAnchor="middle" fontSize="20" fill="#ff0000" fontWeight="bold">⚠️</text>
                    </g>
                  )}
                  <ElementLabel x={zone.position.x + 20} y={zone.position.y + 65} label="Table Lamp" visible={showLabels} />
                </g>
              ))}

              {zones.filter(z => z.type === 'mug').map(zone => (
                <g
                  key={zone.id}
                  onClick={() => zone.isWobbling && setZones(prev => prev.map(z => z.id === zone.id ? { ...z, isWobbling: false } : z))}
                  className="cursor-pointer"
                  filter={zone.isWobbling ? "url(#dangerGlow)" : "url(#furnitureShadow)"}
                >
                  <CoffeeMug x={zone.position.x} y={zone.position.y} isWobbling={zone.isWobbling} isFallen={zone.isFallen} />
                  {zone.isWobbling && (
                    <g transform={`translate(${zone.position.x + 17}, ${zone.position.y - 10})`}>
                      <circle r="20" fill="#ff0000" opacity="0.2">
                        <animate attributeName="r" values="16;22;16" dur="0.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="0.5s" repeatCount="indefinite" />
                      </circle>
                      <text textAnchor="middle" fontSize="20" fill="#ff0000" fontWeight="bold">⚠️</text>
                    </g>
                  )}
                  <ElementLabel x={zone.position.x + 17} y={zone.position.y + 50} label="Coffee Mug" visible={showLabels} />
                </g>
              ))}

              {/* ==================== CATS LAYER ==================== */}

              {cats.map(cat => {
                const urgent = getMostUrgentNeed({ ...cat, needs: {
                  hunger: cat.needs.hunger,
                  play: cat.needs.play,
                  attention: cat.needs.attention,
                }});

                const isHovered = hoveredCat === cat.id;

                return (
                  <g
                    key={cat.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredCat(cat.id)}
                    onMouseLeave={() => setHoveredCat(null)}
                    style={{ zIndex: Math.floor(cat.position.y) }}
                  >
                    {/* Cat sprite */}
                    <g filter="url(#catShadow)">
                      <CatSprite emoji={cat.emoji} x={cat.position.x} y={cat.position.y} state={cat.state} />
                    </g>

                    {/* Need indicators */}
                    <g transform={`translate(${cat.position.x - 48}, ${cat.position.y - 80})`}>
                      <rect x="-4" y="-8" width="104" height="28" rx="14" fill="rgba(0,0,0,0.75)" />

                      {(['hunger', 'play', 'attention'] as const).map((need, i) => {
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

                    {/* Urgent warning */}
                    {urgent.value >= DISASTER_THRESHOLD && (
                      <g transform={`translate(${cat.position.x - 28}, ${cat.position.y - 110})`}>
                        <rect x="0" y="0" width="56" height="24" rx="8" fill="#ef4444">
                          <animate attributeName="opacity" values="1;0.7;1" dur="0.4s" repeatCount="indefinite" />
                        </rect>
                        <rect x="2" y="2" width="52" height="20" rx="6" fill="none" stroke="#fff" strokeWidth="1" />
                        <text x="28" y="16" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">
                          {NEED_ICONS[urgent.type]} {urgent.type.toUpperCase()}!
                        </text>
                      </g>
                    )}

                    {/* Scolded indicator */}
                    {cat.state === 'scolded' && (
                      <g transform={`translate(${cat.position.x - 14}, ${cat.position.y - 75})`}>
                        <circle r="20" fill="#ef4444" opacity="0.3">
                          <animate attributeName="r" values="18;24;18" dur="0.6s" repeatCount="indefinite" />
                        </circle>
                        <text fontSize="32" filter="url(#catShadow)">✋</text>
                      </g>
                    )}

                    {/* Action menu */}
                    <g
                      transform={`translate(${cat.position.x - 65}, ${cat.position.y + 40})`}
                      style={{
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.2s',
                        pointerEvents: isHovered ? 'auto' : 'none',
                      }}
                    >
                      <rect x="-8" y="-8" width="146" height="58" rx="10" fill="rgba(30,30,30,0.95)" stroke="#555" strokeWidth="2" />

                      {/* Feed */}
                      <g onClick={(e) => { e.stopPropagation(); fulfillNeed(cat.id, 'hunger'); }}>
                        <rect x="0" y="0" width="40" height="42" rx="8" fill="#8B4513" className="cursor-pointer hover:fill-a0522d" />
                        <text x="20" y="24" textAnchor="middle" fontSize="18">🍖</text>
                        <text x="20" y="38" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">FEED</text>
                      </g>

                      {/* Play */}
                      <g onClick={(e) => { e.stopPropagation(); fulfillNeed(cat.id, 'play'); }}>
                        <rect x="46" y="0" width="40" height="42" rx="8" fill="#228b22" className="cursor-pointer hover:fill-2e8b57" />
                        <text x="66" y="24" textAnchor="middle" fontSize="18">🎾</text>
                        <text x="66" y="38" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">PLAY</text>
                      </g>

                      {/* Pet */}
                      <g onClick={(e) => { e.stopPropagation(); fulfillNeed(cat.id, 'attention'); }}>
                        <rect x="92" y="0" width="40" height="42" rx="8" fill="#ff69b4" className="cursor-pointer hover:fill-ff1493" />
                        <text x="112" y="24" textAnchor="middle" fontSize="18">💕</text>
                        <text x="112" y="38" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">PET</text>
                      </g>

                      {/* Divider lines */}
                      <line x1="42" y1="4" x2="42" y2="44" stroke="#555" strokeWidth="1" />
                      <line x1="88" y1="4" x2="88" y2="44" stroke="#555" strokeWidth="1" />
                    </g>
                  </g>
                );
              })}

              {/* Popups */}
              {popups.map(popup => (
                <g key={popup.id} transform={`translate(${popup.x}, ${popup.y})`}>
                  <text textAnchor="middle" fontSize="18" fontWeight="bold" fill={popup.value.includes('-') ? '#ef4444' : '#22c55e'} filter="url(#catShadow)">
                    {popup.value}
                  </text>
                </g>
              ))}
            </svg>
          </div>

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

          {/* Instructions */}
          <div className="mt-4 flex flex-wrap gap-6 text-sm text-stone-400 bg-stone-800/80 px-6 py-3 rounded-lg border border-stone-700">
            <span className="flex items-center gap-2"><span className="text-lg">🐱</span> Hover → Actions</span>
            <span className="flex items-center gap-2"><span className="text-lg">🥣</span> Click → Fill bowls</span>
            <span className="flex items-center gap-2"><span className="text-lg">✋</span> Scold → Stop chaos</span>
            <span className="flex items-center gap-2"><span className="text-lg">⚠️</span> Save → Click items</span>
            <span className="flex items-center gap-2"><span className="text-lg">🏷️</span> Toggle → Show Labels</span>
          </div>
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
