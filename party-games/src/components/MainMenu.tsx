import React from 'react';
import { Button } from './Button';

interface MainMenuProps {
  onStart: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
  return (
    <div className="main-menu">
      <div className="main-menu__content">
        <h1 className="main-menu__title">🎮 Party Games</h1>
        <p className="main-menu__subtitle">
          The Ultimate Collection of Party Games for Everyone!
        </p>
        <div className="main-menu__features">
          <div className="feature">
            <span className="feature__icon">👥</span>
            <span className="feature__text">Up to 16 Players</span>
          </div>
          <div className="feature">
            <span className="feature__icon">🎯</span>
            <span className="feature__text">4 Unique Games</span>
          </div>
          <div className="feature">
            <span className="feature__icon">🎨</span>
            <span className="feature__text">All Ages Welcome</span>
          </div>
        </div>
        <Button onClick={onStart} size="large" fullWidth>
          Start Playing
        </Button>
      </div>
    </div>
  );
};
