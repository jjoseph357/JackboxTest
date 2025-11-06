import React, { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import type { RPSModifiers, MapShape } from '../types';

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
    // Original modifiers
    growthFood: false,
    movingFood: false,
    bullets: false,
    speedBoost: false,
    respawns: false,
    respawnCount: 1,
    // New clone modifiers
    cloneOnKill: false,
    clonePotion: false,
    // Map shape
    mapShape: 'rectangle',
    // Customizable settings (defaults)
    foodCount: 15,
    growthPercentage: 15,
    bulletSpeed: 0.3,
    bulletCount: 3,
    bulletSize: 20,
    foodSize: 15,
    playerSize: 35,
    playerSpeed: 0.18,
    speedBoostMultiplier: 2,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleModifier = (key: keyof RPSModifiers) => {
    if (typeof modifiers[key] === 'boolean') {
      setModifiers(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const updateNumber = (key: keyof RPSModifiers, value: number) => {
    setModifiers(prev => ({ ...prev, [key]: value }));
  };

  const updateMapShape = (shape: MapShape) => {
    setModifiers(prev => ({ ...prev, mapShape: shape }));
  };

  return (
    <div className="modifiers-select">
      <h2 className="modifiers-select__title">🎮 Game Modifiers & Settings</h2>
      <p className="modifiers-select__subtitle">
        Customize your battle experience!
      </p>

      {/* Power-up Modifiers */}
      <h3 style={{ marginTop: '24px', marginBottom: '16px', color: 'var(--primary-light)' }}>Power-Ups</h3>
      <div className="modifiers-select__grid">
        <Card
          className={`modifier-card ${modifiers.growthFood || modifiers.movingFood ? 'modifier-card--active' : ''}`}
          onClick={() => {
            if (!modifiers.growthFood && !modifiers.movingFood) {
              setModifiers(prev => ({ ...prev, growthFood: true }));
            } else if (modifiers.growthFood) {
              setModifiers(prev => ({ ...prev, growthFood: false, movingFood: true }));
            } else {
              setModifiers(prev => ({ ...prev, movingFood: false }));
            }
          }}
        >
          <div className="modifier-card__icon">{modifiers.movingFood ? '🍕' : '🍎'}</div>
          <h3 className="modifier-card__name">
            {!modifiers.growthFood && !modifiers.movingFood ? 'Food' : modifiers.movingFood ? 'Moving Food' : 'Static Food'}
          </h3>
          <p className="modifier-card__description">
            {modifiers.movingFood ? 'Bouncing food moves around!' : 'Eat food to grow bigger!'}
          </p>
        </Card>

        <Card
          className={`modifier-card ${modifiers.speedBoost ? 'modifier-card--active' : ''}`}
          onClick={() => toggleModifier('speedBoost')}
        >
          <div className="modifier-card__icon">⚡</div>
          <h3 className="modifier-card__name">Speed Boost</h3>
          <p className="modifier-card__description">
            Get a speed boost after each elimination!
          </p>
        </Card>

        <Card
          className={`modifier-card ${modifiers.respawns ? 'modifier-card--active' : ''}`}
          onClick={() => toggleModifier('respawns')}
        >
          <div className="modifier-card__icon">🔄</div>
          <h3 className="modifier-card__name">Respawns</h3>
          <p className="modifier-card__description">
            Players can respawn when eliminated
          </p>
          {modifiers.respawns && (
            <div className="modifier-card__config" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <label>Lives:</label>
              <div className="respawn-counter">
                <Button
                  size="small"
                  onClick={() => updateNumber('respawnCount', Math.max(0, modifiers.respawnCount - 1))}
                  disabled={modifiers.respawnCount <= 0}
                >
                  −
                </Button>
                <span className="respawn-count">{modifiers.respawnCount}</span>
                <Button
                  size="small"
                  onClick={() => updateNumber('respawnCount', Math.min(5, modifiers.respawnCount + 1))}
                  disabled={modifiers.respawnCount >= 5}
                >
                  +
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Clone Modifiers */}
      <h3 style={{ marginTop: '24px', marginBottom: '16px', color: 'var(--primary-light)' }}>Cloning</h3>
      <div className="modifiers-select__grid">
        <Card
          className={`modifier-card ${modifiers.cloneOnKill ? 'modifier-card--active' : ''}`}
          onClick={() => toggleModifier('cloneOnKill')}
        >
          <div className="modifier-card__icon">👥</div>
          <h3 className="modifier-card__name">Clone on Kill</h3>
          <p className="modifier-card__description">
            Create a clone after each elimination!
          </p>
        </Card>

        <Card
          className={`modifier-card ${modifiers.clonePotion ? 'modifier-card--active' : ''}`}
          onClick={() => toggleModifier('clonePotion')}
        >
          <div className="modifier-card__icon">🧪</div>
          <h3 className="modifier-card__name">Clone Potions</h3>
          <p className="modifier-card__description">
            Find potions to create clones!
          </p>
        </Card>
      </div>

      {/* Hazards */}
      <h3 style={{ marginTop: '24px', marginBottom: '16px', color: 'var(--primary-light)' }}>Hazards</h3>
      <div className="modifiers-select__grid">
        <Card
          className={`modifier-card ${modifiers.bullets ? 'modifier-card--active' : ''}`}
          onClick={() => toggleModifier('bullets')}
        >
          <div className="modifier-card__icon">💥</div>
          <h3 className="modifier-card__name">Danger Bullets</h3>
          <p className="modifier-card__description">
            Bouncing bullets eliminate on contact!
          </p>
        </Card>
      </div>

      {/* Map Shape */}
      <h3 style={{ marginTop: '24px', marginBottom: '16px', color: 'var(--primary-light)' }}>Map Shape</h3>
      <div className="modifiers-select__grid">
        {(['rectangle', 'L', 'plus', 'circle', 'barricades', 'maze', 'window', 'ring'] as MapShape[]).map(shape => (
          <Card
            key={shape}
            className={`modifier-card ${modifiers.mapShape === shape ? 'modifier-card--active' : ''}`}
            onClick={() => updateMapShape(shape)}
          >
            <div className="modifier-card__icon">
              {shape === 'rectangle' && '▭'}
              {shape === 'L' && '⌐'}
              {shape === 'plus' && '✚'}
              {shape === 'circle' && '⭕'}
              {shape === 'barricades' && '🚧'}
              {shape === 'maze' && '🌀'}
              {shape === 'window' && '🪟'}
              {shape === 'ring' && '💍'}
            </div>
            <h3 className="modifier-card__name">{shape.charAt(0).toUpperCase() + shape.slice(1)}</h3>
          </Card>
        ))}
      </div>

      {/* Advanced Settings Toggle */}
      <div style={{ textAlign: 'center', margin: '32px 0 16px' }}>
        <Button onClick={() => setShowAdvanced(!showAdvanced)} variant="secondary">
          {showAdvanced ? '▲ Hide Advanced Settings' : '▼ Show Advanced Settings'}
        </Button>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--primary-light)' }}>⚙️ Advanced Settings</h3>

          <div className="settings-grid">
            {/* Player Settings */}
            <div className="setting-item">
              <label>Player Size: {modifiers.playerSize}px</label>
              <input
                type="range"
                min="20"
                max="60"
                value={modifiers.playerSize}
                onChange={(e) => updateNumber('playerSize', Number(e.target.value))}
                className="slider"
              />
            </div>

            <div className="setting-item">
              <label>Player Speed: {modifiers.playerSpeed.toFixed(2)}</label>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.01"
                value={modifiers.playerSpeed}
                onChange={(e) => updateNumber('playerSpeed', Number(e.target.value))}
                className="slider"
              />
            </div>

            <div className="setting-item">
              <label>Speed Boost Multiplier: {modifiers.speedBoostMultiplier}x</label>
              <input
                type="range"
                min="1.5"
                max="4"
                step="0.5"
                value={modifiers.speedBoostMultiplier}
                onChange={(e) => updateNumber('speedBoostMultiplier', Number(e.target.value))}
                className="slider"
              />
            </div>

            {/* Food Settings */}
            <div className="setting-item">
              <label>Food Count: {modifiers.foodCount}</label>
              <input
                type="range"
                min="5"
                max="30"
                value={modifiers.foodCount}
                onChange={(e) => updateNumber('foodCount', Number(e.target.value))}
                className="slider"
              />
            </div>

            <div className="setting-item">
              <label>Food Size: {modifiers.foodSize}px</label>
              <input
                type="range"
                min="10"
                max="30"
                value={modifiers.foodSize}
                onChange={(e) => updateNumber('foodSize', Number(e.target.value))}
                className="slider"
              />
            </div>

            <div className="setting-item">
              <label>Growth Per Food: {modifiers.growthPercentage}%</label>
              <input
                type="range"
                min="5"
                max="50"
                value={modifiers.growthPercentage}
                onChange={(e) => updateNumber('growthPercentage', Number(e.target.value))}
                className="slider"
              />
            </div>

            {/* Bullet Settings */}
            <div className="setting-item">
              <label>Bullet Count: {modifiers.bulletCount}</label>
              <input
                type="range"
                min="1"
                max="10"
                value={modifiers.bulletCount}
                onChange={(e) => updateNumber('bulletCount', Number(e.target.value))}
                className="slider"
              />
            </div>

            <div className="setting-item">
              <label>Bullet Size: {modifiers.bulletSize}px</label>
              <input
                type="range"
                min="10"
                max="40"
                value={modifiers.bulletSize}
                onChange={(e) => updateNumber('bulletSize', Number(e.target.value))}
                className="slider"
              />
            </div>

            <div className="setting-item">
              <label>Bullet Speed: {modifiers.bulletSpeed.toFixed(2)}</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={modifiers.bulletSpeed}
                onChange={(e) => updateNumber('bulletSpeed', Number(e.target.value))}
                className="slider"
              />
            </div>
          </div>
        </div>
      )}

      <div className="modifiers-select__actions" style={{ marginTop: '32px' }}>
        <Button onClick={onBack} variant="secondary">
          Back
        </Button>
        <Button onClick={onSkip} variant="secondary">
          Skip All
        </Button>
        <Button onClick={() => onComplete(modifiers)}>
          Start Game
        </Button>
      </div>
    </div>
  );
};
