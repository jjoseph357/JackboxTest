import React from 'react';
import type { Player } from '../types';

interface PlayerListProps {
  players: Player[];
  highlightIds?: number[];
  showScores?: boolean;
}

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  highlightIds = [],
  showScores = false,
}) => {
  return (
    <div className="player-list">
      {players.map((player) => (
        <div
          key={player.id}
          className={`player-list__item ${
            highlightIds.includes(player.id) ? 'player-list__item--highlighted' : ''
          }`}
        >
          <span className="player-list__name">{player.name}</span>
          {showScores && (
            <span className="player-list__score">{player.score} pts</span>
          )}
        </div>
      ))}
    </div>
  );
};
