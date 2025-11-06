import React, { useState, useEffect, useRef } from 'react';
import type { Player, RPSBRState, RPSObject, RPSChoice, RPSModifiers, FoodParticle, Bullet, ClonePotion } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { generateId } from '../utils/helpers';

interface RPSBRProps {
  players: Player[];
  modifiers: RPSModifiers;
  onGameEnd: (updatedPlayers: Player[]) => void;
}

const GRID_SIZE = 1200;
// const OBJECT_SIZE = 35;
// const BASE_SPEED = 0.18;
const BATTLE_DURATION = 90000; // 60 seconds
const SPEED_BOOST_DURATION = 3000; // 3 seconds
// const SPEED_BOOST_MULTIPLIER = 1.5;
// const FOOD_SIZE = 15;
// const BULLET_SIZE = 20;
// const BULLET_SPEED = 0.3;

// Mobile detection
const isMobile = () => {
  return /iPad|iPhone|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
};

// Performance settings based on device
const MOBILE_OPTIMIZATIONS = isMobile();
const RENDER_CLOUDS = !MOBILE_OPTIMIZATIONS;
const RENDER_GRID = !MOBILE_OPTIMIZATIONS;
const TEXT_SHADOWS = !MOBILE_OPTIMIZATIONS;

// Sound effects (basic implementation)
const playSound = (type: 'eliminate' | 'collect' | 'boost' | 'respawn' | 'bullet') => {
  // In a real implementation, you would load and play actual audio files
  console.log(`🔊 ${type} sound`);
};

export const RPSBR: React.FC<RPSBRProps> = ({ players, modifiers, onGameEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const battleEndedRef = useRef(false);

  const [state, setState] = useState<RPSBRState>(() => ({
    phase: 'placement',
    tournamentRound: 1,
    activePlayers: players.map(p => p.id),
    eliminatedPlayers: [],
    objects: [],
    placements: {},
    currentPlacer: 0,
    battleTime: 0,
    playerStats: Object.fromEntries(players.map(p => [p.id, { kills: 0, roundsWon: 0, respawnsUsed: 0 }])),
    foodParticles: [],
    bullets: [],
    clonePotions: [],
    modifiers,
  }));

  const [selectedType, setSelectedType] = useState<RPSChoice>('rock');
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number } | null>(null);

  // Helper functions
  const getWinner = (type1: RPSChoice, type2: RPSChoice): RPSChoice | null => {
    if (type1 === type2) return null;
    if (type1 === 'rock' && type2 === 'scissors') return 'rock';
    if (type1 === 'scissors' && type2 === 'paper') return 'scissors';
    if (type1 === 'paper' && type2 === 'rock') return 'paper';
    if (type2 === 'rock' && type1 === 'scissors') return 'rock';
    if (type2 === 'scissors' && type1 === 'paper') return 'scissors';
    if (type2 === 'paper' && type1 === 'rock') return 'paper';
    return null;
  };

  const getTargetType = (type: RPSChoice): RPSChoice => {
    if (type === 'rock') return 'scissors';
    if (type === 'scissors') return 'paper';
    return 'rock';
  };

  const findNearestTarget = (obj: RPSObject, allObjects: RPSObject[]): RPSObject | null => {
    const targetType = getTargetType(obj.type);
    const targets = allObjects.filter(o => o.alive && o.type === targetType);

    if (targets.length === 0) return null;

    let nearest = targets[0];
    let minDist = Infinity;

    for (const target of targets) {
      const dx = target.x - obj.x;
      const dy = target.y - obj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        nearest = target;
      }
    }

    return nearest;
  };

  const checkCollision = (obj1: { x: number; y: number; size: number }, obj2: { x: number; y: number; size: number }): boolean => {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.size + obj2.size) / 2;
  };

  // Check if position is valid for current map shape
  const isValidPosition = (x: number, y: number, objSize: number): boolean => {
    const half = objSize / 2;
    const center = GRID_SIZE / 2;

    switch (modifiers.mapShape) {
      case 'rectangle':
        return x >= half && x <= GRID_SIZE - half && y >= half && y <= GRID_SIZE - half;

      case 'circle':
        const distFromCenter = Math.sqrt((x - center) ** 2 + (y - center) ** 2);
        return distFromCenter + half <= center - 50;

      case 'L':
        // Block top-right corner
        if (x > center && y < center) return false;
        return x >= half && x <= GRID_SIZE - half && y >= half && y <= GRID_SIZE - half;

      case 'plus':
        // Cross shape - block all four corners
        const margin = GRID_SIZE / 3;
        if (x < margin && y < margin) return false; // top-left
        if (x > GRID_SIZE - margin && y < margin) return false; // top-right
        if (x < margin && y > GRID_SIZE - margin) return false; // bottom-left
        if (x > GRID_SIZE - margin && y > GRID_SIZE - margin) return false; // bottom-right
        return x >= half && x <= GRID_SIZE - half && y >= half && y <= GRID_SIZE - half;

      case 'ring':
        const ringDist = Math.sqrt((x - center) ** 2 + (y - center) ** 2);
        const outerRadius = center - 50;
        const innerRadius = center / 2;
        return ringDist + half >= innerRadius && ringDist + half <= outerRadius;

      case 'window':
        // Frame with thick borders
        const frameThickness = 150;
        const isInFrame = x >= half && x <= GRID_SIZE - half && y >= half && y <= GRID_SIZE - half;
        const isInHole = x > frameThickness && x < GRID_SIZE - frameThickness &&
                        y > frameThickness && y < GRID_SIZE - frameThickness;
        return isInFrame && !isInHole;

      case 'barricades':
        // Check if not inside barricades (blocks in center)
        const barrierSize = 100;
        const centerBarrier1 = Math.abs(x - center) < barrierSize / 2 && Math.abs(y - center) < barrierSize / 2;
        const centerBarrier2 = Math.abs(x - center - 200) < barrierSize / 2 && Math.abs(y - center) < barrierSize / 2;
        const centerBarrier3 = Math.abs(x - center + 200) < barrierSize / 2 && Math.abs(y - center) < barrierSize / 2;
        return !centerBarrier1 && !centerBarrier2 && !centerBarrier3 &&
               x >= half && x <= GRID_SIZE - half && y >= half && y <= GRID_SIZE - half;

      case 'maze':
        // Simple maze pattern
        const wallThickness = 40;
        const spacing = 200;
        for (let i = 1; i < 5; i++) {
          const wallX = i * spacing;
          if (Math.abs(x - wallX) < wallThickness && (i % 2 === 0 ? y < GRID_SIZE / 2 : y > GRID_SIZE / 2)) {
            return false;
          }
        }
        return x >= half && x <= GRID_SIZE - half && y >= half && y <= GRID_SIZE - half;

      default:
        return x >= half && x <= GRID_SIZE - half && y >= half && y <= GRID_SIZE - half;
    }
  };

  // Constrain position to valid map area
  const constrainToMap = (x: number, y: number, objSize: number): { x: number; y: number } => {
    const half = objSize / 2;

    // Simple boundary constraint - more complex shapes will push objects to nearest valid position
    let newX = Math.max(half, Math.min(GRID_SIZE - half, x));
    let newY = Math.max(half, Math.min(GRID_SIZE - half, y));

    // For non-rectangle shapes, try to find nearest valid position
    if (modifiers.mapShape !== 'rectangle' && !isValidPosition(newX, newY, objSize)) {
      // Simple push-back towards center
      const center = GRID_SIZE / 2;
      const dx = newX - center;
      const dy = newY - center;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        const pushBackAmount = 10;
        newX -= (dx / dist) * pushBackAmount;
        newY -= (dy / dist) * pushBackAmount;
      }
    }

    return { x: newX, y: newY };
  };

  // Create a clone of an object
  const createClone = (original: RPSObject): RPSObject => {
    // Spawn clone near original
    const angle = Math.random() * Math.PI * 2;
    const distance = 60;
    let x = original.x + Math.cos(angle) * distance;
    let y = original.y + Math.sin(angle) * distance;

    // Constrain to map
    const constrained = constrainToMap(x, y, original.size);
    x = constrained.x;
    y = constrained.y;

    return {
      id: generateId(),
      playerId: original.playerId,
      type: original.type,
      x,
      y,
      vx: 0,
      vy: 0,
      size: original.baseSize, // Clones start at base size
      baseSize: original.baseSize,
      alive: true,
      kills: 0,
      speedBoost: 0,
      respawnsLeft: modifiers.respawns ? modifiers.respawnCount : 0,
      isClone: true,
    };
  };

  // Initialize food and bullets
  const initializeModifierObjects = () => {
    const food: FoodParticle[] = [];
    const bullets: Bullet[] = [];
    const clonePotions: ClonePotion[] = [];

    if (modifiers.growthFood || modifiers.movingFood) {
      // Use custom food count, but apply mobile optimization if needed
      const desiredCount = modifiers.foodCount;
      const count = MOBILE_OPTIMIZATIONS
        ? Math.min(desiredCount, modifiers.movingFood ? 5 : 8)
        : desiredCount;

      // Calculate growth amount based on percentage
      const growthAmount = modifiers.playerSize * (modifiers.growthPercentage / 100);

      for (let i = 0; i < count; i++) {
        food.push({
          id: generateId(),
          x: Math.random() * (GRID_SIZE - 40) + 20,
          y: Math.random() * (GRID_SIZE - 40) + 20,
          vx: modifiers.movingFood ? (Math.random() - 0.5) * 0.4 : 0,
          vy: modifiers.movingFood ? (Math.random() - 0.5) * 0.4 : 0,
          size: modifiers.foodSize,
          growth: growthAmount,
        });
      }
    }

    if (modifiers.bullets) {
      // Use custom bullet count, but apply mobile optimization if needed
      const count = MOBILE_OPTIMIZATIONS
        ? Math.min(modifiers.bulletCount, 2)
        : modifiers.bulletCount;

      for (let i = 0; i < count; i++) {
        bullets.push({
          id: generateId(),
          x: Math.random() * (GRID_SIZE - 40) + 20,
          y: Math.random() * (GRID_SIZE - 40) + 20,
          vx: (Math.random() - 0.5) * modifiers.bulletSpeed * 2,
          vy: (Math.random() - 0.5) * modifiers.bulletSpeed * 2,
          size: modifiers.bulletSize,
        });
      }
    }

    // Initialize clone potions if enabled
    if (modifiers.clonePotion) {
      const potionCount = 3;
      for (let i = 0; i < potionCount; i++) {
        clonePotions.push({
          id: generateId(),
          x: Math.random() * (GRID_SIZE - 100) + 50,
          y: Math.random() * (GRID_SIZE - 100) + 50,
          size: 25,
        });
      }
    }

    setState(prev => ({ ...prev, foodParticles: food, bullets, clonePotions }));
  };

  // Canvas click handler for placement
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (state.phase !== 'placement') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (GRID_SIZE / rect.width);
    const y = (e.clientY - rect.top) * (GRID_SIZE / rect.height);

    setSelectedPosition({ x, y });
  };

  const handlePlacement = () => {
    if (!selectedPosition || state.currentPlacer === null) return;

    const playerId = state.activePlayers[state.currentPlacer];
    const isLastPlayer = state.currentPlacer === state.activePlayers.length - 1;

    // Create the updated placements including current player
    const updatedPlacements = {
      ...state.placements,
      [playerId]: { type: selectedType, x: selectedPosition.x, y: selectedPosition.y },
    };

    setState(prev => ({
      ...prev,
      placements: updatedPlacements,
      currentPlacer: isLastPlayer ? null : prev.currentPlacer! + 1,
      phase: isLastPlayer ? 'ready-to-battle' : prev.phase,
    }));

    setSelectedPosition(null);
  };

  const startBattle = (placements: typeof state.placements = state.placements) => {
    const objects: RPSObject[] = Object.entries(placements).map(([playerIdStr, placement]) => ({
      id: generateId(),
      playerId: parseInt(playerIdStr),
      type: placement.type,
      x: placement.x,
      y: placement.y,
      vx: 0,
      vy: 0,
      size: modifiers.playerSize,
      baseSize: modifiers.playerSize,
      alive: true,
      kills: 0,
      speedBoost: 0,
      respawnsLeft: modifiers.respawns ? modifiers.respawnCount : 0,
      isClone: false,
    }));

    battleEndedRef.current = false;
    initializeModifierObjects();

    setState(prev => ({
      ...prev,
      phase: 'battle',
      objects,
      battleTime: Date.now(),
    }));
  };

  const respawnObject = (obj: RPSObject) => {
    if (!modifiers.respawns || obj.respawnsLeft <= 0) return false;

    playSound('respawn');

    // Find a safe spawn location
    const x = Math.random() * (GRID_SIZE - 100) + 50;
    const y = Math.random() * (GRID_SIZE - 100) + 50;

    obj.x = x;
    obj.y = y;
    obj.alive = true;
    obj.respawnsLeft--;
    obj.size = obj.baseSize; // Reset size
    obj.speedBoost = 0;

    setState(prev => ({
      ...prev,
      playerStats: {
        ...prev.playerStats,
        [obj.playerId]: {
          ...prev.playerStats[obj.playerId],
          respawnsUsed: prev.playerStats[obj.playerId].respawnsUsed + 1,
        },
      },
    }));

    return true;
  };

  const endRound = (finalObjects: RPSObject[]) => {
    if (battleEndedRef.current) return;
    battleEndedRef.current = true;

    // Cancel animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }

    const aliveObjects = finalObjects.filter(o => o.alive);
    const winningTypes = new Set(aliveObjects.map(o => o.type));

    // Update stats with kills - THIS IS THE FIX for elimination counter
    const updatedStats = { ...state.playerStats };
    for (const obj of finalObjects) {
      // Make sure we're tracking total kills across all rounds
      updatedStats[obj.playerId].kills = Math.max(
        updatedStats[obj.playerId].kills,
        obj.kills + (updatedStats[obj.playerId].kills || 0)
      );
    }

    // Determine advancing players
    let advancingPlayers: number[];
    if (aliveObjects.length === 0) {
      advancingPlayers = state.activePlayers;
    } else if (winningTypes.size === 1) {
      const winningType = Array.from(winningTypes)[0];
      advancingPlayers = state.activePlayers.filter(pid => {
        const placement = state.placements[pid];
        return placement && placement.type === winningType;
      });
    } else {
      advancingPlayers = Array.from(new Set(aliveObjects.map(o => o.playerId)));
    }

    // Mark rounds won
    for (const pid of advancingPlayers) {
      updatedStats[pid].roundsWon++;
    }

    // Check if we have a winner
    if (advancingPlayers.length === 1) {
      const eliminated = state.activePlayers.filter(id => !advancingPlayers.includes(id));
      setState(prev => ({
        ...prev,
        phase: 'game-end',
        activePlayers: advancingPlayers,
        eliminatedPlayers: [
          ...prev.eliminatedPlayers,
          ...eliminated.map((playerId, idx) => ({
            playerId,
            placement: prev.eliminatedPlayers.length + eliminated.length - idx
          })),
        ],
        playerStats: updatedStats,
      }));
    } else {
      const eliminated = state.activePlayers.filter(id => !advancingPlayers.includes(id));
      setState(prev => ({
        ...prev,
        phase: 'round-end',
        activePlayers: advancingPlayers,
        eliminatedPlayers: [
          ...prev.eliminatedPlayers,
          ...eliminated.map((playerId, idx) => ({
            playerId,
            placement: prev.eliminatedPlayers.length + eliminated.length - idx
          })),
        ],
        playerStats: updatedStats,
      }));
    }
  };

  // Battle phase update loop
  useEffect(() => {
    if (state.phase !== 'battle') {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      return;
    }

    const updateBattle = () => {
      if (battleEndedRef.current) return;

      setState(prev => {
        const now = Date.now();
        const newObjects = [...prev.objects];
        const aliveObjects = newObjects.filter(o => o.alive);

        // Check if battle is over
        const types = new Set(aliveObjects.map(o => o.type));
        const battleTimedOut = now - prev.battleTime > BATTLE_DURATION;

        if (types.size <= 1 || battleTimedOut) {
          setTimeout(() => endRound(newObjects), 500);
          return prev;
        }

        // Update food particles
        const newFood = [...prev.foodParticles];
        for (const food of newFood) {
          if (modifiers.movingFood) {
            food.x += food.vx;
            food.y += food.vy;

            // Bounce off walls
            if (food.x < food.size || food.x > GRID_SIZE - food.size) food.vx *= -1;
            if (food.y < food.size || food.y > GRID_SIZE - food.size) food.vy *= -1;

            food.x = Math.max(food.size, Math.min(GRID_SIZE - food.size, food.x));
            food.y = Math.max(food.size, Math.min(GRID_SIZE - food.size, food.y));
          }
        }

        // Update bullets
        const newBullets = [...prev.bullets];
        for (const bullet of newBullets) {
          bullet.x += bullet.vx;
          bullet.y += bullet.vy;

          // Bounce off walls
          if (bullet.x < bullet.size || bullet.x > GRID_SIZE - bullet.size) bullet.vx *= -1;
          if (bullet.y < bullet.size || bullet.y > GRID_SIZE - bullet.size) bullet.vy *= -1;

          bullet.x = Math.max(bullet.size, Math.min(GRID_SIZE - bullet.size, bullet.x));
          bullet.y = Math.max(bullet.size, Math.min(GRID_SIZE - bullet.size, bullet.y));
        }

        // Clone potions array (avoid mutating prev state)
        const newClonePotions = [...prev.clonePotions];

        // Move each object toward nearest target
        for (const obj of aliveObjects) {
          const target = findNearestTarget(obj, aliveObjects);
          if (target) {
            const dx = target.x - obj.x;
            const dy = target.y - obj.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0) {
              let speed = modifiers.playerSpeed;

              // Apply speed boost if active
              if (modifiers.speedBoost && obj.speedBoost > now) {
                speed *= modifiers.speedBoostMultiplier;
              } else if (obj.speedBoost > 0 && obj.speedBoost <= now) {
                obj.speedBoost = 0; // Clear expired boost
              }

              obj.x += (dx / dist) * speed;
              obj.y += (dy / dist) * speed;
            }
          }

          // Keep in bounds and constrain to map shape
          const constrained = constrainToMap(obj.x, obj.y, obj.size);
          obj.x = constrained.x;
          obj.y = constrained.y;

          // Check food collisions
          if (modifiers.growthFood || modifiers.movingFood) {
            for (let i = newFood.length - 1; i >= 0; i--) {
              const food = newFood[i];
              if (checkCollision(obj, food)) {
                obj.size = Math.min(obj.size + food.growth, modifiers.playerSize * 2);
                obj.baseSize = obj.size;
                newFood.splice(i, 1);
                playSound('collect');
              }
            }
          }

          // Check clone potion collisions
          if (modifiers.clonePotion) {
            for (let i = newClonePotions.length - 1; i >= 0; i--) {
              const potion = newClonePotions[i];
              if (checkCollision(obj, potion)) {
                // Create a clone
                const clone = createClone(obj);
                newObjects.push(clone);
                newClonePotions.splice(i, 1);
                playSound('boost');
              }
            }
          }

          // Check bullet collisions
          if (modifiers.bullets) {
            for (const bullet of newBullets) {
              if (checkCollision(obj, bullet)) {
                obj.alive = false;
                playSound('bullet');

                // Try to respawn
                if (!respawnObject(obj)) {
                  // Object is truly dead
                }
                break;
              }
            }
          }
        }

        // Check object collisions
        for (let i = 0; i < aliveObjects.length; i++) {
          for (let j = i + 1; j < aliveObjects.length; j++) {
            const obj1 = aliveObjects[i];
            const obj2 = aliveObjects[j];

            if (!obj1.alive || !obj2.alive) continue;

            if (checkCollision(obj1, obj2)) {
              const winner = getWinner(obj1.type, obj2.type);
              if (winner === obj1.type) {
                obj2.alive = false;
                obj1.kills++;
                playSound('eliminate');

                if (modifiers.speedBoost) {
                  obj1.speedBoost = now + SPEED_BOOST_DURATION;
                  playSound('boost');
                }

                // Create clone on kill if enabled
                if (modifiers.cloneOnKill) {
                  const clone = createClone(obj1);
                  newObjects.push(clone);
                }

                // Try to respawn the loser
                respawnObject(obj2);
              } else if (winner === obj2.type) {
                obj1.alive = false;
                obj2.kills++;
                playSound('eliminate');

                if (modifiers.speedBoost) {
                  obj2.speedBoost = now + SPEED_BOOST_DURATION;
                  playSound('boost');
                }

                // Create clone on kill if enabled
                if (modifiers.cloneOnKill) {
                  const clone = createClone(obj2);
                  newObjects.push(clone);
                }

                // Try to respawn the loser
                respawnObject(obj1);
              }
            }
          }
        }

        return { ...prev, objects: newObjects, foodParticles: newFood, bullets: newBullets, clonePotions: newClonePotions };
      });

      animationRef.current = requestAnimationFrame(updateBattle);
    };

    animationRef.current = requestAnimationFrame(updateBattle);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };
  }, [state.phase, state.battleTime, modifiers]);

  const handleNextRound = () => {
    setSelectedPosition(null);
    setSelectedType('rock');

    setState(prev => ({
      ...prev,
      phase: 'placement',
      tournamentRound: prev.tournamentRound + 1,
      objects: [],
      placements: {},
      currentPlacer: 0,
      battleTime: 0,
      foodParticles: [],
      bullets: [],
      clonePotions: [],
    }));
  };

  const handleGameEnd = () => {
    const updatedPlayers = players.map(p => {
      const eliminated = state.eliminatedPlayers.find(e => e.playerId === p.id);
      const stats = state.playerStats[p.id];

      let score = 0;
      if (state.activePlayers.includes(p.id)) {
        score = 1000;
      } else if (eliminated) {
        score = Math.max(0, 900 - (eliminated.placement - 1) * 100);
      }

      score += stats.kills * 50;

      return { ...p, score: p.score + score };
    });

    onGameEnd(updatedPlayers);
  };

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, GRID_SIZE, GRID_SIZE);

    // Draw fun background with points of interest
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, GRID_SIZE);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98D8C8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);

    // Add some clouds (desktop only for performance)
    if (RENDER_CLOUDS) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(200, 150, 60, 0, Math.PI * 2);
      ctx.arc(250, 140, 70, 0, Math.PI * 2);
      ctx.arc(300, 150, 60, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(800, 100, 50, 0, Math.PI * 2);
      ctx.arc(850, 95, 60, 0, Math.PI * 2);
      ctx.arc(900, 100, 50, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(600, 900, 70, 0, Math.PI * 2);
      ctx.arc(660, 890, 80, 0, Math.PI * 2);
      ctx.arc(720, 900, 70, 0, Math.PI * 2);
      ctx.fill();
    }

    // Grid lines (desktop only for performance)
    if (RENDER_GRID) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= GRID_SIZE; i += 100) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, GRID_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(GRID_SIZE, i);
        ctx.stroke();
      }
    }

    // Draw food particles
    for (const food of state.foodParticles) {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(food.x, food.y, food.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFA500';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = `${food.size * 1.5}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🍎', food.x, food.y);
    }

    // Draw bullets
    for (const bullet of state.bullets) {
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = `${bullet.size * 1.5}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💥', bullet.x, bullet.y);
    }

    // Draw clone potions
    for (const potion of state.clonePotions) {
      ctx.fillStyle = '#9B59B6';
      ctx.beginPath();
      ctx.arc(potion.x, potion.y, potion.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8E44AD';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = `${potion.size * 1.5}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🧪', potion.x, potion.y);
    }

    // Draw map shape boundaries/obstacles
    ctx.fillStyle = 'rgba(50, 50, 50, 0.7)';
    const center = GRID_SIZE / 2;
    const margin = GRID_SIZE / 3;

    switch (modifiers.mapShape) {
      case 'circle':
        // Draw outer boundary ring
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.8)';
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.arc(center, center, center - 50, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'L':
        // Block top-right corner
        ctx.fillRect(center, 0, GRID_SIZE / 2, GRID_SIZE / 2);
        break;

      case 'plus':
        // Block all four corners
        ctx.fillRect(0, 0, margin, margin);
        ctx.fillRect(GRID_SIZE - margin, 0, margin, margin);
        ctx.fillRect(0, GRID_SIZE - margin, margin, margin);
        ctx.fillRect(GRID_SIZE - margin, GRID_SIZE - margin, margin, margin);
        break;

      case 'ring':
        // Draw donut shape
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.8)';
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.arc(center, center, center - 50, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(center, center, center / 2, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'window':
        // Frame with hollow center
        const frameThickness = 150;
        ctx.fillRect(frameThickness, frameThickness, GRID_SIZE - frameThickness * 2, GRID_SIZE - frameThickness * 2);
        break;

      case 'barricades':
        // Obstacles in the middle
        const barrierSize = 100;
        ctx.fillRect(center - barrierSize / 2, center - barrierSize / 2, barrierSize, barrierSize);
        ctx.fillRect(center + 200 - barrierSize / 2, center - barrierSize / 2, barrierSize, barrierSize);
        ctx.fillRect(center - 200 - barrierSize / 2, center - barrierSize / 2, barrierSize, barrierSize);
        break;

      case 'maze':
        // Maze walls
        const wallThickness = 40;
        const spacing = 200;
        for (let i = 1; i < 5; i++) {
          const wallX = i * spacing;
          if (i % 2 === 0) {
            ctx.fillRect(wallX - wallThickness / 2, 0, wallThickness, GRID_SIZE / 2);
          } else {
            ctx.fillRect(wallX - wallThickness / 2, GRID_SIZE / 2, wallThickness, GRID_SIZE / 2);
          }
        }
        break;
    }

    // Previously placed objects are now hidden until battle starts
    // This prevents players from seeing where others have placed their objects

    // Draw placement preview
    if (state.phase === 'placement' && selectedPosition) {
      ctx.fillStyle = 'rgba(99, 102, 241, 0.5)';
      ctx.beginPath();
      ctx.arc(selectedPosition.x, selectedPosition.y, modifiers.playerSize / 2, 0, Math.PI * 2);
      ctx.fill();

      const emoji = selectedType === 'rock' ? '⚫' : selectedType === 'paper' ? '📄' : '✂️';
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, selectedPosition.x, selectedPosition.y);

      // Preview nametag
      const currentPlayer = players.find(p => p.id === state.activePlayers[state.currentPlacer || 0]);
      if (currentPlayer) {
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#fff';
        if (TEXT_SHADOWS) {
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 3;
          ctx.strokeText(currentPlayer.name, selectedPosition.x, selectedPosition.y - modifiers.playerSize);
        }
        ctx.fillText(currentPlayer.name, selectedPosition.x, selectedPosition.y - modifiers.playerSize);
      }
    }

    // Draw battle objects
    if (state.phase === 'battle' || state.phase === 'round-end') {
      for (const obj of state.objects) {
        if (!obj.alive) continue;

        const emoji = obj.type === 'rock' ? '⚫' : obj.type === 'paper' ? '📄' : '✂️';

        // Draw glow if speed boosted
        if (modifiers.speedBoost && obj.speedBoost > Date.now()) {
          ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
          ctx.beginPath();
          ctx.arc(obj.x, obj.y, obj.size / 2 + 10, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw object circle
        const colorMap = {
          rock: '#94a3b8',
          paper: '#f8fafc',
          scissors: '#64748b',
        };
        ctx.fillStyle = colorMap[obj.type];
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw emoji scaled to size
        const fontSize = Math.floor(obj.size * 0.75);
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, obj.x, obj.y);

        // Draw player nametag
        const player = players.find(p => p.id === obj.playerId);
        if (player) {
          ctx.font = 'bold 12px Arial';
          ctx.fillStyle = '#fff';
          if (TEXT_SHADOWS) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.strokeText(player.name, obj.x, obj.y - obj.size / 2 - 10);
          }
          ctx.fillText(player.name, obj.x, obj.y - obj.size / 2 - 10);

          // Show respawns left if modifier enabled
          if (modifiers.respawns && obj.respawnsLeft > 0) {
            ctx.font = 'bold 10px Arial';
            ctx.fillStyle = '#00FF00';
            if (TEXT_SHADOWS) {
              ctx.strokeText(`♥ ${obj.respawnsLeft}`, obj.x, obj.y + obj.size / 2 + 10);
            }
            ctx.fillText(`♥ ${obj.respawnsLeft}`, obj.x, obj.y + obj.size / 2 + 10);
          }
        }
      }
    }
  }, [state, selectedPosition, selectedType, players, modifiers]);

  // UI Rendering
  if (state.phase === 'placement' && state.currentPlacer !== null) {
    const currentPlayer = players.find(p => p.id === state.activePlayers[state.currentPlacer!]);

    return (
      <div className="game">
        <h2 className="game__title">✊📄✂️ RPS Battle Royale</h2>
        <p className="game__round">Tournament Round {state.tournamentRound}</p>
        <Card className="game__placement-card">
          <h3>Current Player: {currentPlayer?.name}</h3>
          <p>Select your weapon and click on the battlefield to place it!</p>
          <p className="game__hint">Other players: Look away! 👀</p>

          <div className="rps__type-select">
            <Button
              variant={selectedType === 'rock' ? 'primary' : 'secondary'}
              onClick={() => setSelectedType('rock')}
            >
              ⚫ Rock
            </Button>
            <Button
              variant={selectedType === 'paper' ? 'primary' : 'secondary'}
              onClick={() => setSelectedType('paper')}
            >
              📄 Paper
            </Button>
            <Button
              variant={selectedType === 'scissors' ? 'primary' : 'secondary'}
              onClick={() => setSelectedType('scissors')}
            >
              ✂️ Scissors
            </Button>
          </div>

          <canvas
            ref={canvasRef}
            width={GRID_SIZE}
            height={GRID_SIZE}
            onClick={handleCanvasClick}
            className="rps__canvas"
          />

          {selectedPosition && (
            <Button onClick={handlePlacement} size="large">
              Confirm Placement
            </Button>
          )}

          <p className="game__progress">
            Player {state.currentPlacer + 1} of {state.activePlayers.length}
          </p>
        </Card>
      </div>
    );
  }

  if (state.phase === 'ready-to-battle') {
    return (
      <div className="game">
        <h2 className="game__title">✊📄✂️ RPS Battle Royale</h2>
        <p className="game__round">Tournament Round {state.tournamentRound}</p>
        <Card>
          <h3>All players have placed their objects!</h3>
          <p style={{ textAlign: 'center', margin: '24px 0', fontSize: '18px', color: 'var(--text-secondary)' }}>
            {state.activePlayers.length} player{state.activePlayers.length !== 1 ? 's' : ''} ready to battle
          </p>

          <canvas
            ref={canvasRef}
            width={GRID_SIZE}
            height={GRID_SIZE}
            className="rps__canvas"
          />

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
            <Button onClick={() => startBattle()} size="large">
              Start Battle!
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (state.phase === 'battle') {
    const aliveCount = state.objects.filter(o => o.alive).length;

    return (
      <div className="game">
        <h2 className="game__title">✊📄✂️ RPS Battle Royale</h2>
        <p className="game__round">Tournament Round {state.tournamentRound} - BATTLE!</p>
        <Card className="game__battle-card">
          <h3>Watch the chaos unfold!</h3>

          <canvas
            ref={canvasRef}
            width={GRID_SIZE}
            height={GRID_SIZE}
            className="rps__canvas"
          />

          <div className="rps__battle-info">
            <p>Objects remaining: {aliveCount}</p>
            {modifiers.respawns && <p className="game__modifier-active">🔄 Respawns Active</p>}
            {modifiers.speedBoost && <p className="game__modifier-active">⚡ Speed Boost On Kill</p>}
            {(modifiers.growthFood || modifiers.movingFood) && (
              <p className="game__modifier-active">🍎 Food Active ({state.foodParticles.length} remaining)</p>
            )}
            {modifiers.bullets && <p className="game__modifier-active">💥 Danger Bullets Active</p>}
          </div>
        </Card>
      </div>
    );
  }

  if (state.phase === 'round-end') {
    const survivingTypes = new Set(state.objects.filter(o => o.alive).map(o => o.type));
    const advancingPlayerObjs = players.filter(p => state.activePlayers.includes(p.id));

    return (
      <div className="game">
        <h2 className="game__title">✊📄✂️ RPS Battle Royale</h2>
        <p className="game__round">Round {state.tournamentRound} Results</p>
        <Card className="game__results">
          <h3>Round Over!</h3>
          <p className="game__survivor-count">
            {state.activePlayers.length} player{state.activePlayers.length !== 1 ? 's' : ''} advance to the next round
          </p>

          {survivingTypes.size > 0 && (
            <div className="rps__surviving-types">
              <p>Winning type(s):</p>
              {Array.from(survivingTypes).map(type => (
                <span key={type} className="rps__type-badge">
                  {type === 'rock' ? '⚫ Rock' : type === 'paper' ? '📄 Paper' : '✂️ Scissors'}
                </span>
              ))}
            </div>
          )}

          <h4>Advancing Players:</h4>
          <div className="rps__advancing-list">
            {advancingPlayerObjs.map(player => {
              const stats = state.playerStats[player.id];
              return (
                <div key={player.id} className="rps__player-item">
                  {player.name} - {stats.kills} eliminations
                  {modifiers.respawns && stats.respawnsUsed > 0 && (
                    <span className="rps__respawns-used"> ({stats.respawnsUsed} respawns used)</span>
                  )}
                </div>
              );
            })}
          </div>

          <Button onClick={handleNextRound} size="large">
            Next Round
          </Button>
        </Card>
      </div>
    );
  }

  if (state.phase === 'game-end') {
    const winner = players.find(p => state.activePlayers.includes(p.id));
    const leaderboard = [...players].sort((a, b) => {
      const aElim = state.eliminatedPlayers.find(e => e.playerId === a.id);
      const bElim = state.eliminatedPlayers.find(e => e.playerId === b.id);

      if (state.activePlayers.includes(a.id)) return -1;
      if (state.activePlayers.includes(b.id)) return 1;

      if (aElim && bElim) {
        return aElim.placement - bElim.placement;
      }

      return 0;
    });

    return (
      <div className="game">
        <h2 className="game__title">✊📄✂️ RPS Battle Royale</h2>
        <Card className="game__final-results">
          <h3 className="rps__winner">🏆 {winner?.name} Wins!</h3>
          <p>The ultimate champion has emerged victorious!</p>

          <h4>Final Leaderboard</h4>
          <div className="rps__leaderboard">
            {leaderboard.map((player, index) => {
              const stats = state.playerStats[player.id];
              const isWinner = state.activePlayers.includes(player.id);

              return (
                <div key={player.id} className={`rps__leaderboard-item ${isWinner ? 'rps__leaderboard-item--winner' : ''}`}>
                  <span className="rps__placement">#{index + 1}</span>
                  <span className="rps__player-name">{player.name}</span>
                  <span className="rps__stats">
                    {stats.kills} elimination{stats.kills !== 1 ? 's' : ''}
                    {modifiers.respawns && stats.respawnsUsed > 0 && (
                      <span className="rps__stat-detail"> • {stats.respawnsUsed} respawn{stats.respawnsUsed !== 1 ? 's' : ''}</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          <Button onClick={handleGameEnd} size="large">
            Return to Menu
          </Button>
        </Card>
      </div>
    );
  }

  return null;
};
