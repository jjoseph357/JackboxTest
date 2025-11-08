import React from 'react';
import { Button } from './Button';
import { Card } from './Card';
import type { GameType, GameInfo } from '../types';

interface GameSelectProps {
  playerCount: number;
  onSelectGame: (game: GameType) => void;
  onBack: () => void;
}

const games: GameInfo[] = [
  {
    id: 'secret-artist',
    name: '🎨 Secret Artist',
    description: 'One player is the secret artist who doesn\'t know what to draw! Can you find them?',
    minPlayers: 3,
    maxPlayers: 20,
    icon: '🎨',
  },
  {
    id: 'story-remix',
    name: '📖 Story Remix',
    description: 'Collaborate to create a wild story one sentence at a time with unexpected twists!',
    minPlayers: 3,
    maxPlayers: 20,
    icon: '📖',
  },
  {
    id: 'fact-fiction',
    name: '🤔 Fact or Fiction',
    description: 'Share facts about yourself - some true, some false. Can your friends tell the difference?',
    minPlayers: 3,
    maxPlayers: 20,
    icon: '🤔',
  },
  {
    id: 'mission-mayhem',
    name: '🕵️ Mission Mayhem',
    description: 'Complete team missions, but beware! Hidden saboteurs are working against you.',
    minPlayers: 5,
    maxPlayers: 20,
    icon: '🕵️',
  },
  {
    id: 'rps-br',
    name: '✊📄✂️ RPS Battle Royale',
    description: 'Place rock, paper, or scissors on the battlefield! Objects chase their prey in an epic battle royale until one player remains!',
    minPlayers: 2,
    maxPlayers: 20,
    icon: '✊',
  },
];

export const GameSelect: React.FC<GameSelectProps> = ({
  playerCount,
  onSelectGame,
  onBack,
}) => {
  return (
    <div className="game-select">
      <h2 className="game-select__title">Choose a Game</h2>
      <div className="game-select__grid">
        {games.map((game) => {
          const canPlay = playerCount >= game.minPlayers && playerCount <= game.maxPlayers;
          return (
            <Card
              key={game.id}
              className={`game-select__card ${!canPlay ? 'game-select__card--disabled' : ''}`}
              onClick={canPlay ? () => onSelectGame(game.id) : undefined}
            >
              <div className="game-select__icon">{game.icon}</div>
              <h3 className="game-select__name">{game.name}</h3>
              <p className="game-select__description">{game.description}</p>
              <p className="game-select__players">
                {game.minPlayers}-{game.maxPlayers} players
              </p>
              {!canPlay && (
                <p className="game-select__error">
                  Need {game.minPlayers}-{game.maxPlayers} players
                </p>
              )}
            </Card>
          );
        })}
      </div>
      <div className="game-select__actions">
        <Button onClick={onBack} variant="secondary">
          Back
        </Button>
      </div>
    </div>
  );
};
