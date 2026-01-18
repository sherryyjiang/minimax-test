'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

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
  type: 'food_bowl' | 'water_bowl' | 'play' | 'vase' | 'plant' | 'lamp' | 'cat_tree' | 'window' | 'sofa' | 'rug';
  emoji: string;
  furnitureEmoji: string;
  position: { x: number; y: number };
  width: number;
  height: number;
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
const CAT_SPEED = 1.2;
const WANDER_SPEED = 0.3;
const NEED_INCREMENT = 0.5;
const DISASTER_THRESHOLD = 65;
const SCOLD_DURATION = 2000;
const SCOLD_RECOVERY = 5000;

// Cat personalities with colors
const CATS = [
  { name: 'Mochi', emoji: '🐱', color: 'from-orange-300 to-orange-400', personality: 'balanced' },
  { name: 'Luna', emoji: '🐈', color: 'from-gray-300 to-gray-400', personality: 'calm' },
  { name: 'Oliver', emoji: '😺', color: 'from-yellow-300 to-yellow-400', personality: 'playful' },
  { name: 'Bella', emoji: '😸', color: 'from-pink-300 to-pink-400', personality: 'energetic' },
  { name: 'Leo', emoji: '😼', color: 'from-amber-300 to-amber-400', personality: 'mischievous' },
  { name: 'Milo', emoji: '😽', color: 'from-cream-300 to-cream-400', personality: 'clingy' },
];

// Room layout with furniture
const ROOM_ZONES: Zone[] = [
  // Window with plant
  { id: 'window', type: 'window', emoji: '🪟', furnitureEmoji: '🪴', position: { x: 100, y: 60 }, width: 80, height: 50 },
  { id: 'plant1', type: 'plant', emoji: '🌿', furnitureEmoji: '', position: { x: 70, y: 100 }, width: 40, height: 40 },
  { id: 'plant2', type: 'plant', emoji: '🌵', furnitureEmoji: '', position: { x: 160, y: 100 }, width: 40, height: 40 },

  // Cat tree (play zone)
  { id: 'cattree', type: 'cat_tree', emoji: '🧶', furnitureEmoji: '🏰', position: { x: 350, y: 80 }, width: 60, height: 60 },

  // Sofa
  { id: 'sofa', type: 'sofa', emoji: '🛋️', furnitureEmoji: '', position: { x: 550, y: 50 }, width: 120, height: 50 },

  // Rug in center
  { id: 'rug', type: 'rug', emoji: '', furnitureEmoji: '🟫', position: { x: 300, y: 250 }, width: 150, height: 80 },

  // Food area
  { id: 'food_bowl', type: 'food_bowl', emoji: '🍖', furnitureEmoji: '🥣', position: { x: 80, y: 380 }, width: 50, height: 40, isEmpty: true, fillLevel: 0 },
  { id: 'water_bowl', type: 'water_bowl', emoji: '💧', furnitureEmoji: '🥛', position: { x: 150, y: 380 }, width: 50, height: 40, isEmpty: false, fillLevel: 100 },

  // Bookshelf with vase
  { id: 'shelf', type: 'window', emoji: '📚', furnitureEmoji: '', position: { x: 600, y: 180 }, width: 70, height: 40 },
  { id: 'vase', type: 'vase', emoji: '🏺', furnitureEmoji: '', position: { x: 610, y: 130 }, width: 40, height: 40, isWobbling: false, isFallen: false },

  // Lamp
  { id: 'lamp', type: 'lamp', emoji: '💡', furnitureEmoji: '🪔', position: { x: 500, y: 200 }, width: 40, height: 40, isWobbling: false, isFallen: false },

  // More zones
  { id: 'toy1', type: 'play', emoji: '🎾', furnitureEmoji: '', position: { x: 350, y: 350 }, width: 35, height: 35 },
  { id: 'toy2', type: 'play', emoji: '🧶', furnitureEmoji: '', position: { x: 450, y: 400 }, width: 35, height: 35 },

  // Second vase on shelf
  { id: 'vase2', type: 'vase', emoji: '⚱️', furnitureEmoji: '', position: { x: 620, y: 140 }, width: 40, height: 40, isWobbling: false, isFallen: false },

  // Table with mug
  { id: 'table', type: 'sofa', emoji: '🪑', furnitureEmoji: '', position: { x: 250, y: 150 }, width: 50, height: 40 },
  { id: 'mug', type: 'lamp', emoji: '☕', furnitureEmoji: '', position: { x: 255, y: 120 }, width: 30, height: 30, isWobbling: false, isFallen: false },
];

// Get random spawn position
const getRandomSpawnPosition = (): { x: number; y: number } => {
  const spawnAreas = [
    { x: 250, y: 300 },  // Center rug
    { x: 400, y: 350 },  // Near toys
    { x: 150, y: 300 },  // Near food
    { x: 500, y: 300 },  // Near sofa
    { x: 350, y: 200 },  // Center room
  ];
  const area = spawnAreas[Math.floor(Math.random() * spawnAreas.length)];
  return {
    x: area.x + (Math.random() - 0.5) * 100,
    y: area.y + (Math.random() - 0.5) * 60,
  };
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

  // Get need color
  const getNeedColor = (value: number): string => {
    if (value < 30) return 'bg-green-400';
    if (value < 50) return 'bg-yellow-400';
    if (value < DISASTER_THRESHOLD) return 'bg-orange-400';
    return 'bg-red-500 animate-pulse';
  };

  // Get need icon
  const getNeedIcon = (type: string): string => {
    switch (type) {
      case 'hunger': return '🍖';
      case 'play': return '🧶';
      case 'attention': return '💕';
      default: return '❓';
    }
  };

  // Fill food bowl
  const fillFoodBowl = () => {
    setZones(prev => prev.map(z => {
      if (z.id === 'food_bowl') {
        addPopup(z.position.x + 25, z.position.y - 10, '+5 🍖');
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
        addPopup(z.position.x + 25, z.position.y - 10, '+3 💧');
        setScore(s => Math.min(s + 3, 200));
        return { ...z, isEmpty: false, fillLevel: 100 };
      }
      return z;
    }));
  };

  // Scold cat
  const scoldCat = (catId: string) => {
    setCats(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      addPopup(cat.position.x, cat.position.y - 40, 'No No! ✋');
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

      addPopup(cat.position.x, cat.position.y - 30, actionText);
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
        addPopup(pos.x, pos.y - 20, `+1 ${catTemplate.emoji}`);
        catIdRef.current++;
      }
    }, 25000);

    return () => clearInterval(interval);
  }, [gameStarted, gameOver, addPopup]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = () => {
      setCats(prevCats => {
        let newScore = score;
        let disasterOccurred = false;

        const updatedCats = prevCats.map(cat => {
          // Check if scolded - skip movement
          if (cat.state === 'scolded') {
            if (Date.now() - cat.lastMoveTime > SCOLD_DURATION) {
              return { ...cat, state: 'idle', target: null };
            }
            return cat;
          }

          // Increase needs
          const newNeeds = {
            hunger: Math.min(100, cat.needs.hunger + NEED_INCREMENT),
            play: Math.min(100, cat.needs.play + NEED_INCREMENT),
            attention: Math.min(100, cat.needs.attention + NEED_INCREMENT),
          };

          // Check most urgent need
          const urgent = getMostUrgentNeed({ ...cat, needs: newNeeds });
          let newPosition = { ...cat.position };
          let newTarget = cat.target;
          let newVelocity = { ...cat.velocity };
          const now = Date.now();

          // If idle and enough time passed, wander randomly
          if (cat.state === 'idle' && now - cat.lastMoveTime > 3000 && Math.random() < 0.02) {
            const wanderAngle = Math.random() * Math.PI * 2;
            newVelocity = {
              x: Math.cos(wanderAngle) * WANDER_SPEED,
              y: Math.sin(wanderAngle) * WANDER_SPEED,
            };
            newTarget = null;
          }

          // If urgent need, move toward zone
          if (urgent.value > DISASTER_THRESHOLD && cat.state === 'idle' && urgent.zone) {
            if (!cat.target) {
              // Add some randomness so cats don't all go to exact same spot
              const offsetX = (Math.random() - 0.5) * 40;
              const offsetY = (Math.random() - 0.5) * 30;
              newTarget = {
                x: urgent.zone.position.x + urgent.zone.width / 2 + offsetX,
                y: urgent.zone.position.y + urgent.zone.height / 2 + offsetY,
              };
            }
          }

          // Move toward target
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
              // Reached target - check interactions
              const zone = zones.find(z =>
                Math.abs(z.position.x - newTarget.x + (z.width || 0)/2) < 50 &&
                Math.abs(z.position.y - newTarget.y + (z.height || 0)/2) < 50
              );

              if (zone && zone.type === 'vase' || zone.type === 'lamp' || zone.type === 'mug') {
                setZones(prevZ => prevZ.map(z => {
                  if (z.id === zone.id && !z.isWobbling && !z.isFallen) {
                    return { ...z, isWobbling: true };
                  }
                  return z;
                }));
              }

              // If reached food bowl and it's filled, eat
              if (zone?.type === 'food_bowl' && !zone.isEmpty) {
                newNeeds.hunger = Math.max(0, newNeeds.hunger - 40);
                setZones(prevZ => prevZ.map(z => {
                  if (z.id === 'food_bowl') {
                    const newLevel = (z.fillLevel || 0) - 30;
                    if (newLevel <= 0) return { ...z, fillLevel: 0, isEmpty: true };
                    return { ...z, fillLevel: newLevel };
                  }
                  return z;
                }));
                newTarget = null;
              } else if (zone?.type === 'food_bowl' && zone.isEmpty) {
                // Wait at empty bowl
                newTarget = null;
              }

              if (!newTarget) {
                newVelocity = { x: 0, y: 0 };
              }
            }
          }

          // Apply wandering velocity
          if (newVelocity.x !== 0 || newVelocity.y !== 0) {
            newPosition = {
              x: Math.max(30, Math.min(GAME_WIDTH - 30, cat.position.x + newVelocity.x)),
              y: Math.max(30, Math.min(GAME_HEIGHT - 30, cat.position.y + newVelocity.y)),
            };
            // Decay velocity
            newVelocity = {
              x: newVelocity.x * 0.98,
              y: newVelocity.y * 0.98,
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

        // Check wobbling zones
        zones.forEach(zone => {
          if (zone.isWobbling && !zone.isFallen) {
            if (Math.random() < 0.015) {
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

        // Check game over
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-stone-200 to-stone-300 p-4">
      {/* Title */}
      <div className="mb-4 text-center">
        <h1 className="text-4xl font-bold text-stone-800 drop-shadow-sm">🐱 Cat Chaos Mansion</h1>
        <p className="text-stone-600 text-sm">Keep your cats happy and your valuables safe!</p>
      </div>

      {!gameStarted ? (
        <div className="flex flex-col items-center gap-4 bg-white/80 p-8 rounded-2xl shadow-xl">
          <div className="text-6xl mb-4">🏠🐱</div>
          <p className="text-stone-700 text-center max-w-md">
            Your cats are hungry, bored, and needy! Feed them 🍖, play with them 🎾,
            give them attention 💕, and protect your stuff from their chaos!
          </p>
          <ul className="text-stone-600 text-sm text-left space-y-1">
            <li>🌱 Fill food bowl before cats arrive!</li>
            <li>✋ Say &quot;No No!&quot; to stop cats from knocking things</li>
            <li>🎾 Click toys to play, cats near cat tree want to play!</li>
          </ul>
          <button
            onClick={startGame}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xl font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg transform hover:scale-105"
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          {/* HUD */}
          <div className="flex gap-6 mb-3 bg-white/90 px-6 py-2 rounded-full shadow-md">
            <div className={`text-2xl font-bold ${score <= 25 ? 'text-red-600 animate-pulse' : 'text-stone-800'}`}>
              ⭐ {score}
            </div>
            <div className="text-stone-600 flex items-center gap-2">
              <span>🐱</span>
              <span className="font-semibold">{cats.length}</span>
            </div>
            <div className="text-amber-600 text-sm flex items-center">
              💡 Fill bowls + Secure items = Points!
            </div>
          </div>

          {/* Game Area - The Room */}
          <div
            className={`relative rounded-2xl shadow-2xl overflow-hidden border-8 border-stone-400 ${disasterMode ? 'animate-shake' : ''}`}
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          >
            {/* Floor pattern */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, #d4c4a8 2px, transparent 2px),
                                  radial-gradient(circle at 75% 75%, #c9b896 2px, transparent 2px)`,
                backgroundSize: '40px 40px',
              }}
            />

            {/* Floor color */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100" />

            {/* Walls hint */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-stone-300 to-transparent opacity-50" />

            {/* Room Elements - Furniture Layer */}
            {zones.map(zone => {
              // Skip interactive zones - render them separately
              if (zone.type === 'food_bowl' || zone.type === 'water_bowl' || zone.isWobbling !== undefined) return null;

              return (
                <div
                  key={zone.id}
                  className="absolute"
                  style={{
                    left: zone.position.x,
                    top: zone.position.y,
                  }}
                >
                  <span className="text-4xl filter drop-shadow-lg">{zone.emoji}</span>
                </div>
              );
            })}

            {/* Food & Water Bowls */}
            {zones.filter(z => z.type === 'food_bowl' || z.type === 'water_bowl').map(zone => (
              <div
                key={zone.id}
                onClick={() => zone.type === 'food_bowl' ? fillFoodBowl() : fillWaterBowl()}
                className="absolute cursor-pointer group"
                style={{
                  left: zone.position.x,
                  top: zone.position.y,
                }}
              >
                {/* Bowl */}
                <div className={`w-14 h-8 rounded-full ${zone.type === 'food_bowl' ? 'bg-amber-700' : 'bg-blue-300'} shadow-lg border-2 border-stone-400 relative overflow-hidden`}>
                  {/* Fill level */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 transition-all ${
                      zone.type === 'food_bowl' ? 'bg-amber-500' : 'bg-blue-400'
                    }`}
                    style={{ height: `${zone.fillLevel || 0}%` }}
                  />
                  {/* Food/Water content */}
                  <span className="absolute inset-0 flex items-center justify-center text-lg">
                    {zone.type === 'food_bowl' ? (zone.isEmpty ? '🥣' : '🍖') : '💧'}
                  </span>
                </div>

                {/* Empty indicator */}
                {zone.isEmpty && (
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs bg-red-500 text-white px-2 py-0.5 rounded animate-pulse whitespace-nowrap">
                    Empty!
                  </span>
                )}

                {/* Fill hint on hover */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-xs px-2 py-1 rounded shadow whitespace-nowrap">
                  Click to fill
                </div>
              </div>
            ))}

            {/* Interactive Objects (vases, mugs, etc.) */}
            {zones.filter(z => z.isWobbling !== undefined).map(zone => (
              <div
                key={zone.id}
                onClick={() => zone.isWobbling && setZones(prev => prev.map(z => z.id === zone.id ? { ...z, isWobbling: false } : z))}
                className={`absolute cursor-pointer transition-all ${
                  zone.isWobbling
                    ? 'animate-wobble'
                    : zone.isFallen
                    ? 'opacity-40 transform rotate-90 translate-y-2'
                    : ''
                }`}
                style={{
                  left: zone.position.x,
                  top: zone.position.y,
                }}
              >
                <span className={`text-4xl filter drop-shadow-lg ${zone.isFallen ? 'grayscale' : ''}`}>
                  {zone.emoji}
                </span>

                {/* Warning when wobbling */}
                {zone.isWobbling && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                    <span className="text-red-500 text-xs font-bold animate-bounce">⚠️</span>
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded animate-pulse whitespace-nowrap">
                      Save!
                    </span>
                  </div>
                )}

                {/* Broken effect when fallen */}
                {zone.isFallen && (
                  <span className="absolute -top-4 left-full text-lg">💔</span>
                )}
              </div>
            ))}

            {/* Play zones */}
            {zones.filter(z => z.type === 'play').map(zone => (
              <div
                key={zone.id}
                className="absolute opacity-60"
                style={{
                  left: zone.position.x,
                  top: zone.position.y,
                }}
              >
                <span className="text-3xl animate-bounce" style={{ animationDelay: `${Math.random() * 1000}ms` }}>
                  {zone.emoji}
                </span>
              </div>
            ))}

            {/* Cat Tree */}
            {zones.filter(z => z.type === 'cat_tree').map(zone => (
              <div
                key={zone.id}
                className="absolute"
                style={{
                  left: zone.position.x,
                  top: zone.position.y,
                }}
              >
                <span className="text-5xl filter drop-shadow-lg">🏰</span>
              </div>
            ))}

            {/* Cats */}
            {cats.map(cat => {
              const urgent = getMostUrgentNeed({ ...cat, needs: {
                hunger: cat.needs.hunger,
                play: cat.needs.play,
                attention: cat.needs.attention,
              }});

              const isHovered = hoveredCat === cat.id;

              return (
                <div
                  key={cat.id}
                  className="absolute cursor-pointer group"
                  onMouseEnter={() => setHoveredCat(cat.id)}
                  onMouseLeave={() => setHoveredCat(null)}
                  style={{
                    left: cat.position.x - 22,
                    top: cat.position.y - 22,
                    zIndex: Math.floor(cat.position.y),
                  }}
                >
                  {/* Cat shadow */}
                  <div
                    className="absolute inset-0 bg-black/20 rounded-full transform scale-110 translate-y-1"
                    style={{ width: 36, height: 20, left: 4, top: 28 }}
                  />

                  {/* Cat emoji with personality */}
                  <div
                    className={`relative transition-all ${
                      cat.state === 'eating' ? 'scale-110' :
                      cat.state === 'playing' ? 'animate-bounce' :
                      cat.state === 'purring' ? 'animate-pulse' :
                      cat.state === 'scolded' ? 'grayscale opacity-50' :
                      'hover:scale-105'
                    } ${cat.velocity.x !== 0 || cat.velocity.y !== 0 ? 'animate-walk' : ''}`}
                  >
                    <span className="text-5xl filter drop-shadow-md">
                      {cat.emoji}
                    </span>
                  </div>

                  {/* Need bars */}
                  <div className={`absolute -top-14 left-1/2 transform -translate-x-1/2 flex gap-1.5 transition-all ${isHovered ? 'opacity-100' : 'opacity-70'} ${urgent.value >= DISASTER_THRESHOLD ? 'scale-110' : ''}`}>
                    {(['hunger', 'play', 'attention'] as const).map(need => (
                      <div key={need} className="relative">
                        <div className="w-5 h-3 bg-stone-700 rounded-full overflow-hidden shadow-sm">
                          <div
                            className={`h-full transition-all ${getNeedColor(cat.needs[need])}`}
                            style={{ width: `${cat.needs[need]}%` }}
                          />
                        </div>
                        <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs">
                          {getNeedIcon(need)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Urgent warning */}
                  {urgent.value >= DISASTER_THRESHOLD && (
                    <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded animate-pulse whitespace-nowrap shadow-lg">
                      {getNeedIcon(urgent.type)} {urgent.type.toUpperCase()}!
                    </div>
                  )}

                  {/* Scolded indicator */}
                  {cat.state === 'scolded' && (
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 text-2xl animate-ping">
                      ✋
                    </div>
                  )}

                  {/* Action menu on hover */}
                  <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 transition-all ${
                    isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                  } z-20`}>
                    <div className="bg-white rounded-xl shadow-xl p-2 flex gap-1 border-2 border-stone-200">
                      <button
                        onClick={(e) => { e.stopPropagation(); fulfillNeed(cat.id, 'hunger'); }}
                        className="p-2 hover:bg-amber-100 rounded-lg transition-colors flex flex-col items-center"
                        title="Feed"
                      >
                        <span className="text-xl">🍖</span>
                        <span className="text-xs text-amber-700">Feed</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); fulfillNeed(cat.id, 'play'); }}
                        className="p-2 hover:bg-green-100 rounded-lg transition-colors flex flex-col items-center"
                        title="Play"
                      >
                        <span className="text-xl">🎾</span>
                        <span className="text-xs text-green-700">Play</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); fulfillNeed(cat.id, 'attention'); }}
                        className="p-2 hover:bg-pink-100 rounded-lg transition-colors flex flex-col items-center"
                        title="Pet"
                      >
                        <span className="text-xl">💕</span>
                        <span className="text-xs text-pink-700">Pet</span>
                      </button>
                      <div className="w-px bg-stone-200 mx-1" />
                      <button
                        onClick={(e) => { e.stopPropagation(); scoldCat(cat.id); }}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors flex flex-col items-center"
                        title="No No!"
                      >
                        <span className="text-xl">✋</span>
                        <span className="text-xs text-red-700">No!</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Popups */}
            {popups.map(popup => (
              <div
                key={popup.id}
                className="absolute pointer-events-none font-bold text-lg animate-float-up z-50"
                style={{
                  left: popup.x,
                  top: popup.y,
                }}
              >
                <span className={popup.value.includes('-') ? 'text-red-500' : 'text-green-500'}>
                  {popup.value}
                </span>
              </div>
            ))}
          </div>

          {/* Game Over */}
          {gameOver && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 text-center shadow-2xl animate-bounce">
                <div className="text-6xl mb-4">😿</div>
                <h2 className="text-3xl font-bold text-stone-800 mb-2">Game Over!</h2>
                <p className="text-stone-600 mb-4">Final Score: <span className="font-bold text-amber-600">{score}</span></p>
                <p className="text-stone-500 mb-6">
                  You managed {cats.length} cat{cats.length > 1 ? 's' : ''}!
                </p>
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
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-stone-600 bg-white/60 px-4 py-2 rounded-lg">
            <span className="flex items-center gap-1"><span className="text-lg">🐱</span> Hover → Actions</span>
            <span className="flex items-center gap-1"><span className="text-lg">🥣</span> Click → Fill bowls</span>
            <span className="flex items-center gap-1"><span className="text-lg">✋</span> Scold → Stop chaos</span>
            <span className="flex items-center gap-1"><span className="text-lg">⚠️</span> Save → Click wobbling items</span>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes float-up {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-40px) scale(1.2); }
        }
        .animate-float-up {
          animation: float-up 1.2s ease-out forwards;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px) rotate(-1deg); }
          40% { transform: translateX(8px) rotate(1deg); }
          60% { transform: translateX(-6px) rotate(-1deg); }
          80% { transform: translateX(6px) rotate(1deg); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }

        @keyframes wobble {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        .animate-wobble {
          animation: wobble 0.3s ease-in-out infinite;
        }

        @keyframes walk {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .animate-walk {
          animation: walk 0.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
