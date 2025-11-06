import React, { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import type { RPSModifiers } from '../types';

interface ModifiersSelectProps {
  onComplete: (modifiers: RPSModifiers) => void;
  onSkip: () => void;
  onBack: () => void;
}

export const ModifiersSelect: React.FC<ModifiersSelectProps> = ({
  onComplete,
  onSkip,
  onBack,
}) => {
  const [modifiers, setModifiers] = useState<RPSModifiers>({
    growthFood: false,
    movingFood: false,
    bullets: false,
    speedBoost: false,
    respawns: false,
    respawnCount: 1,
  });

  const toggleModifier = (key: keyof Omit<RPSModifiers, 'respawnCount'>) => {
    setModifiers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateRespawnCount = (value: string) => {
    const num = parseInt(value) || 0;
    const clamped = Math.max(0, Math.min(5, num));
    setModifiers(prev => ({ ...prev, respawnCount: clamped }));
  };

  return (
    <div className="modifiers-select">
      <h2 className="modifiers-select__title">🎮 Game Modifiers</h2>
      <p className="modifiers-select__subtitle">
        Enable fun modifiers to spice up the battle! (Optional)
      </p>

      <div className="modifiers-select__grid">
        <Card
          className={`modifier-card ${modifiers.growthFood ? 'modifier-card--active' : ''}`}
          onClick={() => toggleModifier('growthFood')}
        >
          <div className="modifier-card__icon">🍎</div>
          <h3 className="modifier-card__name">Growth Food</h3>
          <p className="modifier-card__description">
            Static food particles appear. Run over them to grow bigger!
          </p>
        </Card>

        <Card
          className={`modifier-card ${modifiers.movingFood ? 'modifier-card--active' : ''}`}
          onClick={() => toggleModifier('movingFood')}
        >
          <div className="modifier-card__icon">🍕</div>
          <h3 className="modifier-card__name">Moving Food</h3>
          <p className="modifier-card__description">
            Bouncing food particles move around the arena!
          </p>
        </Card>

        <Card
          className={`modifier-card ${modifiers.bullets ? 'modifier-card--active' : ''}`}
          onClick={() => toggleModifier('bullets')}
        >
          <div className="modifier-card__icon">💥</div>
          <h3 className="modifier-card__name">Danger Bullets</h3>
          <p className="modifier-card__description">
            Slow-moving bullets bounce around. Don't get hit!
          </p>
        </Card>

        <Card
          className={`modifier-card ${modifiers.speedBoost ? 'modifier-card--active' : ''}`}
          onClick={() => toggleModifier('speedBoost')}
        >
          <div className="modifier-card__icon">⚡</div>
          <h3 className="modifier-card__name">Kill Streak Boost</h3>
          <p className="modifier-card__description">
            Get a temporary speed boost after each elimination!
          </p>
        </Card>

        <Card
          className={`modifier-card ${modifiers.respawns ? 'modifier-card--active' : ''}`}
          onClick={() => toggleModifier('respawns')}
        >
          <div className="modifier-card__icon">🔄</div>
          <h3 className="modifier-card__name">Respawns</h3>
          <p className="modifier-card__description">
            Players can respawn when eliminated (configurable)
          </p>
          {modifiers.respawns && (
            <div className="modifier-card__config" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <label>Respawns per player:</label>
              <div className="respawn-counter">
                <Button
                  size="small"
                  onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
                    e?.stopPropagation();
                    updateRespawnCount(String(modifiers.respawnCount - 1));
                  }}
                  disabled={modifiers.respawnCount <= 0}
                >
                  −
                </Button>
                <span className="respawn-count">{modifiers.respawnCount}</span>
                <Button
                  size="small"
                  onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
                    e?.stopPropagation();
                    updateRespawnCount(String(modifiers.respawnCount + 1));
                  }}
                  disabled={modifiers.respawnCount >= 5}
                >
                  +
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="modifiers-select__actions">
        <Button onClick={onBack} variant="secondary">
          Back
        </Button>
        <Button onClick={onSkip} variant="secondary">
          No Modifiers
        </Button>
        <Button onClick={() => onComplete(modifiers)}>
          Start Game
        </Button>
      </div>
    </div>
  );
};
