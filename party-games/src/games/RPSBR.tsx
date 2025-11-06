import React, { useState, useEffect, useRef } from 'react';
import type { Player, RPSBRState, RPSObject, RPSChoice } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { generateId } from '../utils/helpers';

interface RPSBRProps {
  players: Player[];
  onGameEnd: (updatedPlayers: Player[]) => void;
}

const GRID_SIZE = 800;
const OBJECT_SIZE = 40;
const MOVEMENT_SPEED = 0.5;
const BATTLE_DURATION = 30000; // 30 seconds

export const RPSBR: React.FC<RPSBRProps> = ({ players, onGameEnd }) => {
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
    playerStats: Object.fromEntries(players.map(p => [p.id, { kills: 0, roundsWon: 0 }])),
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

  const checkCollision = (obj1: RPSObject, obj2: RPSObject): boolean => {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.size + obj2.size) / 2;
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

    setState(prev => ({
      ...prev,
      placements: {
        ...prev.placements,
        [playerId]: { type: selectedType, x: selectedPosition.x, y: selectedPosition.y },
      },
      currentPlacer: isLastPlayer ? null : prev.currentPlacer! + 1,
    }));

    setSelectedPosition(null);

    // If all players have placed, start battle
    if (isLastPlayer) {
      setTimeout(() => {
        startBattle();
      }, 100);
    }
  };

  const startBattle = () => {
    const objects: RPSObject[] = Object.entries(state.placements).map(([playerIdStr, placement]) => ({
      id: generateId(),
      playerId: parseInt(playerIdStr),
      type: placement.type,
      x: placement.x,
      y: placement.y,
      size: OBJECT_SIZE,
      alive: true,
      kills: 0,
    }));

    battleEndedRef.current = false;

    setState(prev => ({
      ...prev,
      phase: 'battle',
      objects,
      battleTime: Date.now(),
    }));
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

    // Update stats with kills
    const updatedStats = { ...state.playerStats };
    for (const obj of finalObjects) {
      if (obj.kills > 0) {
        updatedStats[obj.playerId].kills += obj.kills;
      }
    }

    // Determine advancing players
    let advancingPlayers: number[];
    if (aliveObjects.length === 0) {
      // Everyone died, all advance
      advancingPlayers = state.activePlayers;
    } else if (winningTypes.size === 1) {
      // One type won - all players who chose that type advance
      const winningType = Array.from(winningTypes)[0];
      advancingPlayers = state.activePlayers.filter(pid => {
        const placement = state.placements[pid];
        return placement && placement.type === winningType;
      });
    } else {
      // Multiple types survived
      advancingPlayers = Array.from(new Set(aliveObjects.map(o => o.playerId)));
    }

    // Mark rounds won
    for (const pid of advancingPlayers) {
      updatedStats[pid].roundsWon++;
    }

    // Check if we have a winner
    if (advancingPlayers.length === 1) {
      // Game over!
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
      // Next round
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
        const newObjects = [...prev.objects];
        const aliveObjects = newObjects.filter(o => o.alive);

        // Check if battle is over
        const types = new Set(aliveObjects.map(o => o.type));
        const battleTimedOut = Date.now() - prev.battleTime > BATTLE_DURATION;

        if (types.size <= 1 || battleTimedOut) {
          // Battle ended - call endRound and stop animation
          setTimeout(() => endRound(newObjects), 500);
          return prev;
        }

        // Move each object toward nearest target
        for (const obj of aliveObjects) {
          const target = findNearestTarget(obj, aliveObjects);
          if (target) {
            const dx = target.x - obj.x;
            const dy = target.y - obj.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0) {
              obj.x += (dx / dist) * MOVEMENT_SPEED;
              obj.y += (dy / dist) * MOVEMENT_SPEED;
            }
          }

          // Keep in bounds
          obj.x = Math.max(OBJECT_SIZE / 2, Math.min(GRID_SIZE - OBJECT_SIZE / 2, obj.x));
          obj.y = Math.max(OBJECT_SIZE / 2, Math.min(GRID_SIZE - OBJECT_SIZE / 2, obj.y));
        }

        // Check collisions
        for (let i = 0; i < aliveObjects.length; i++) {
          for (let j = i + 1; j < aliveObjects.length; j++) {
            const obj1 = aliveObjects[i];
            const obj2 = aliveObjects[j];

            if (checkCollision(obj1, obj2)) {
              const winner = getWinner(obj1.type, obj2.type);
              if (winner === obj1.type) {
                obj2.alive = false;
                obj1.kills++;
              } else if (winner === obj2.type) {
                obj1.alive = false;
                obj2.kills++;
              }
            }
          }
        }

        return { ...prev, objects: newObjects };
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
  }, [state.phase, state.battleTime]);

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
    }));
  };

  const handleGameEnd = () => {
    // Calculate final scores based on placement
    const updatedPlayers = players.map(p => {
      const eliminated = state.eliminatedPlayers.find(e => e.playerId === p.id);
      const stats = state.playerStats[p.id];

      let score = 0;
      if (state.activePlayers.includes(p.id)) {
        // Winner
        score = 1000;
      } else if (eliminated) {
        // Placement-based score
        score = Math.max(0, 900 - (eliminated.placement - 1) * 100);
      }

      // Add kill bonus
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

    // Clear canvas
    ctx.clearRect(0, 0, GRID_SIZE, GRID_SIZE);

    // Draw grid background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);

    // Draw grid lines
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, GRID_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(GRID_SIZE, i);
      ctx.stroke();
    }

    if (state.phase === 'placement' && selectedPosition) {
      // Draw placement preview
      ctx.fillStyle = 'rgba(99, 102, 241, 0.5)';
      ctx.beginPath();
      ctx.arc(selectedPosition.x, selectedPosition.y, OBJECT_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw emoji
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const emoji = selectedType === 'rock' ? '🪨' : selectedType === 'paper' ? '📄' : '✂️';
      ctx.fillText(emoji, selectedPosition.x, selectedPosition.y);
    }

    if (state.phase === 'battle' || state.phase === 'round-end') {
      // Draw all objects
      for (const obj of state.objects) {
        if (!obj.alive) continue;

        const emoji = obj.type === 'rock' ? '🪨' : obj.type === 'paper' ? '📄' : '✂️';

        // Draw object circle
        ctx.fillStyle = obj.type === 'rock' ? '#94a3b8' : obj.type === 'paper' ? '#f8fafc' : '#64748b';
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw emoji
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, obj.x, obj.y);

        // Draw player name
        const player = players.find(p => p.id === obj.playerId);
        if (player) {
          ctx.font = '10px Arial';
          ctx.fillStyle = '#fff';
          ctx.fillText(player.name, obj.x, obj.y + obj.size / 2 + 10);
        }
      }
    }
  }, [state, selectedPosition, selectedType, players]);

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
              🪨 Rock
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

  if (state.phase === 'battle') {
    const aliveCount = state.objects.filter(o => o.alive).length;
    const timeLeft = Math.max(0, BATTLE_DURATION - (Date.now() - state.battleTime));

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
            <p>Time left: {Math.ceil(timeLeft / 1000)}s</p>
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
                  {type === 'rock' ? '🪨 Rock' : type === 'paper' ? '📄 Paper' : '✂️ Scissors'}
                </span>
              ))}
            </div>
          )}

          <h4>Advancing Players:</h4>
          <div className="rps__advancing-list">
            {advancingPlayerObjs.map(player => (
              <div key={player.id} className="rps__player-item">
                {player.name}
              </div>
            ))}
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

      // Winner first
      if (state.activePlayers.includes(a.id)) return -1;
      if (state.activePlayers.includes(b.id)) return 1;

      // Then by placement (lower placement number = better)
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
                  <span className="rps__stats">{stats.kills} eliminations</span>
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
