import { useState } from 'react';
import type { AppScreen, GameType, Player } from './types';
import { MainMenu } from './components/MainMenu';
import { PlayerSetup } from './components/PlayerSetup';
import { GameSelect } from './components/GameSelect';
import { SecretArtist } from './games/SecretArtist';
import { StoryRemix } from './games/StoryRemix';
import { FactFiction } from './games/FactFiction';
import { MissionMayhem } from './games/MissionMayhem';
import './App.css';

function App() {
  const [screen, setScreen] = useState<AppScreen>('menu');
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);

  const handleStartGame = () => {
    setScreen('player-setup');
  };

  const handlePlayersSelected = (selectedPlayers: Player[]) => {
    setPlayers(selectedPlayers);
    setScreen('game-select');
  };

  const handleGameSelected = (game: GameType) => {
    setSelectedGame(game);
    setScreen('game');
  };

  const handleGameEnd = (updatedPlayers: Player[]) => {
    setPlayers(updatedPlayers);
    setScreen('menu');
    setSelectedGame(null);
  };

  const handleBackToMenu = () => {
    setScreen('menu');
    setPlayers([]);
    setSelectedGame(null);
  };

  const handleBackToPlayerSetup = () => {
    setScreen('player-setup');
  };

  return (
    <div className="app">
      <div className="app__container">
        {screen === 'menu' && <MainMenu onStart={handleStartGame} />}

        {screen === 'player-setup' && (
          <PlayerSetup onComplete={handlePlayersSelected} onBack={handleBackToMenu} />
        )}

        {screen === 'game-select' && (
          <GameSelect
            playerCount={players.length}
            onSelectGame={handleGameSelected}
            onBack={handleBackToPlayerSetup}
          />
        )}

        {screen === 'game' && selectedGame === 'secret-artist' && (
          <SecretArtist players={players} onGameEnd={handleGameEnd} />
        )}

        {screen === 'game' && selectedGame === 'story-remix' && (
          <StoryRemix players={players} onGameEnd={handleGameEnd} />
        )}

        {screen === 'game' && selectedGame === 'fact-fiction' && (
          <FactFiction players={players} onGameEnd={handleGameEnd} />
        )}

        {screen === 'game' && selectedGame === 'mission-mayhem' && (
          <MissionMayhem players={players} onGameEnd={handleGameEnd} />
        )}
      </div>
    </div>
  );
}

export default App;
