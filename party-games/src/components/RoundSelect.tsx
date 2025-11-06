import React, { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import type { GameType } from '../types';

interface RoundSelectProps {
  playerCount: number;
  selectedGame: GameType;
  gameName: string;
  onComplete: (rounds: number) => void;
  onBack: () => void;
}

export const RoundSelect: React.FC<RoundSelectProps> = ({
  playerCount,
  selectedGame,
  gameName,
  onComplete,
  onBack,
}) => {
  const getDefaultRounds = () => {
    switch (selectedGame) {
      case 'secret-artist':
        return 3;
      case 'story-remix':
        return playerCount;
      case 'fact-fiction':
        return Math.min(playerCount, 5);
      case 'mission-mayhem':
        return 5;
      case 'rps-br':
        return 1; // RPS BR continues until one winner
      default:
        return playerCount;
    }
  };

  const [rounds, setRounds] = useState<number>(getDefaultRounds());

  const handleRoundChange = (value: string) => {
    const num = parseInt(value) || 1;
    const clamped = Math.max(1, Math.min(20, num));
    setRounds(clamped);
  };

  const getRoundLabel = () => {
    if (selectedGame === 'rps-br') {
      return 'This game continues until there is one winner!';
    }
    return 'rounds';
  };

  return (
    <div className="round-select">
      <h2 className="round-select__title">How many {getRoundLabel()}?</h2>
      <Card className="round-select__card">
        <p className="round-select__game">Game: <strong>{gameName}</strong></p>
        {selectedGame !== 'rps-br' ? (
          <>
            <div className="round-select__counter">
              <Button
                onClick={() => handleRoundChange(String(rounds - 1))}
                disabled={rounds <= 1}
                size="large"
              >
                −
              </Button>
              <div className="round-select__count">{rounds}</div>
              <Button
                onClick={() => handleRoundChange(String(rounds + 1))}
                disabled={rounds >= 20}
                size="large"
              >
                +
              </Button>
            </div>
            <p className="round-select__info">
              Choose between 1 and 20 rounds
            </p>
          </>
        ) : (
          <div className="round-select__info-box">
            <p>🏆 Battle Royale Mode</p>
            <p>The game will continue through multiple elimination rounds until only one player remains!</p>
          </div>
        )}
      </Card>
      <div className="round-select__actions">
        <Button onClick={onBack} variant="secondary">
          Back
        </Button>
        <Button onClick={() => onComplete(rounds)}>
          Start Game
        </Button>
      </div>
    </div>
  );
};
