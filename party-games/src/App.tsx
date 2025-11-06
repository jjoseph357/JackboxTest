import { useState } from 'react';
import type { AppScreen, GameType, Player, RPSModifiers } from './types';
import { MainMenu } from './components/MainMenu';
import { PlayerSetup } from './components/PlayerSetup';
import { GameSelect } from './components/GameSelect';
import { RoundSelect } from './components/RoundSelect';
import { ModifiersSelect } from './components/ModifiersSelect';
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
  const [rpsModifiers, setRpsModifiers] = useState<RPSModifiers>({
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
    // For RPS BR, show modifiers selection
    if (selectedGame === 'rps-br') {
      setScreen('modifiers-select');
    } else {
      setScreen('game');
    }
  };

  const handleModifiersSelected = (modifiers: RPSModifiers) => {
    setRpsModifiers(modifiers);
    setScreen('game');
  };

  const handleSkipModifiers = () => {
    setRpsModifiers({
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
    setScreen('game');
  };

  const handleBackToRoundSelect = () => {
    setScreen('round-select');
  };

  const handleGameEnd = (updatedPlayers: Player[]) => {
    // Reset scores but keep player names
    const playersWithResetScores = updatedPlayers.map(p => ({ ...p, score: 0 }));
    setPlayers(playersWithResetScores);
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
          <PlayerSetup
            onComplete={handlePlayersSelected}
            onBack={handleBackToMenu}
            initialPlayers={players}
          />
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

        {screen === 'modifiers-select' && selectedGame === 'rps-br' && (
          <ModifiersSelect
            onComplete={handleModifiersSelected}
            onSkip={handleSkipModifiers}
            onBack={handleBackToRoundSelect}
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
          <RPSBR players={players} modifiers={rpsModifiers} onGameEnd={handleGameEnd} />
        )}
      </div>
    </div>
  );
}

export default App;
