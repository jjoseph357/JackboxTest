import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import type { Player } from '../types';

interface PlayerSetupProps {
  onComplete: (players: Player[]) => void;
  onBack: () => void;
}

export const PlayerSetup: React.FC<PlayerSetupProps> = ({ onComplete, onBack }) => {
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [players, setPlayers] = useState<Player[]>([]);
  const [showNames, setShowNames] = useState(false);

  const handlePlayerCountChange = (count: string) => {
    const num = parseInt(count) || 2;
    const clamped = Math.max(2, Math.min(16, num));
    setPlayerCount(clamped);
  };

  const handleContinue = () => {
    if (!showNames) {
      const initialPlayers: Player[] = Array.from({ length: playerCount }, (_, i) => ({
        id: i,
        name: `Player ${i + 1}`,
        score: 0,
      }));
      setPlayers(initialPlayers);
      setShowNames(true);
    } else {
      onComplete(players);
    }
  };

  const updatePlayerName = (id: number, name: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, name: name || `Player ${id + 1}` } : p));
  };

  if (!showNames) {
    return (
      <div className="player-setup">
        <h2 className="player-setup__title">How many players?</h2>
        <div className="player-setup__counter">
          <Button
            onClick={() => handlePlayerCountChange(String(playerCount - 1))}
            disabled={playerCount <= 2}
            size="large"
          >
            −
          </Button>
          <div className="player-setup__count">{playerCount}</div>
          <Button
            onClick={() => handlePlayerCountChange(String(playerCount + 1))}
            disabled={playerCount >= 16}
            size="large"
          >
            +
          </Button>
        </div>
        <Input
          type="number"
          value={String(playerCount)}
          onChange={handlePlayerCountChange}
          placeholder="Number of players"
        />
        <div className="player-setup__actions">
          <Button onClick={onBack} variant="secondary">
            Back
          </Button>
          <Button onClick={handleContinue}>Continue</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="player-setup">
      <h2 className="player-setup__title">Enter Player Names (Optional)</h2>
      <div className="player-setup__names">
        {players.map((player) => (
          <Card key={player.id} className="player-setup__name-card">
            <Input
              value={player.name}
              onChange={(name) => updatePlayerName(player.id, name)}
              placeholder={`Player ${player.id + 1}`}
            />
          </Card>
        ))}
      </div>
      <div className="player-setup__actions">
        <Button onClick={() => setShowNames(false)} variant="secondary">
          Back
        </Button>
        <Button onClick={handleContinue}>Continue</Button>
      </div>
    </div>
  );
};
