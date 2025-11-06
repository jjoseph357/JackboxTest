import { useState } from 'react';
import type { AppScreen, GameType, Player } from './types';
import { MainMenu } from './components/MainMenu';
import { PlayerSetup } from './components/PlayerSetup';
import { GameSelect } from './components/GameSelect';
import { RoundSelect } from './components/RoundSelect';
import { SecretArtist } from './games/SecretArtist';
import { StoryRemix } from './games/StoryRemix';
import { FactFiction } from './games/FactFiction';
import { MissionMayhem } from './games/MissionMayhem';
import { RPSBR } from './games/RPSBR';
import './App.css';

const gameNames: Record<GameType, string> = {
  'secret-artist': '🎨 Secret Artist',
  'story-remix': '📖 Story Remix',
  'fact-fiction': '🤔 Fact or Fiction',
  'mission-mayhem': '🕵️ Mission Mayhem',
  'rps-br': '✊📄✂️ Rock Paper Scissors BR',
};

function App() {
  const [screen, setScreen] = useState<AppScreen>('menu');
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [maxRounds, setMaxRounds] = useState<number>(3);

  const handleStartGame = () => {
    setScreen('player-setup');
  };

  const handlePlayersSelected = (selectedPlayers: Player[]) => {
    setPlayers(selectedPlayers);
    setScreen('game-select');
  };

  const handleGameSelected = (game: GameType) => {
    setSelectedGame(game);
    setScreen('round-select');
  };

  const handleRoundsSelected = (rounds: number) => {
    setMaxRounds(rounds);
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
    setMaxRounds(3);
  };

  const handleBackToPlayerSetup = () => {
    setScreen('player-setup');
  };

  const handleBackToGameSelect = () => {
    setScreen('game-select');
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

        {screen === 'round-select' && selectedGame && (
          <RoundSelect
            playerCount={players.length}
            selectedGame={selectedGame}
            gameName={gameNames[selectedGame]}
            onComplete={handleRoundsSelected}
            onBack={handleBackToGameSelect}
          />
        )}

        {screen === 'game' && selectedGame === 'secret-artist' && (
          <SecretArtist players={players} maxRounds={maxRounds} onGameEnd={handleGameEnd} />
        )}

        {screen === 'game' && selectedGame === 'story-remix' && (
          <StoryRemix players={players} maxRounds={maxRounds} onGameEnd={handleGameEnd} />
        )}

        {screen === 'game' && selectedGame === 'fact-fiction' && (
          <FactFiction players={players} maxRounds={maxRounds} onGameEnd={handleGameEnd} />
        )}

        {screen === 'game' && selectedGame === 'mission-mayhem' && (
          <MissionMayhem players={players} maxRounds={maxRounds} onGameEnd={handleGameEnd} />
        )}

        {screen === 'game' && selectedGame === 'rps-br' && (
          <RPSBR players={players} onGameEnd={handleGameEnd} />
        )}
      </div>
    </div>
  );
}

export default App;
