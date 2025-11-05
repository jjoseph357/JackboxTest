import React, { useState, useEffect } from 'react';
import type { Player, SecretArtistState } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { randomItem, shuffle } from '../utils/helpers';
import { drawingPrompts } from '../utils/gameData';

interface SecretArtistProps {
  players: Player[];
  onGameEnd: (updatedPlayers: Player[]) => void;
}

export const SecretArtist: React.FC<SecretArtistProps> = ({ players, onGameEnd }) => {
  const [state, setState] = useState<SecretArtistState>(() => ({
    phase: 'setup',
    prompt: randomItem(drawingPrompts),
    secretArtistId: Math.floor(Math.random() * players.length),
    drawings: {},
    currentDrawer: null,
    votes: {},
    round: 1,
    maxRounds: 3,
  }));

  const [playerOrder, setPlayerOrder] = useState<number[]>([]);
  const [revealSecret, setRevealSecret] = useState(false);
  const [drawing, setDrawing] = useState('');

  useEffect(() => {
    if (state.phase === 'setup') {
      setPlayerOrder(shuffle(players.map(p => p.id)));
      setTimeout(() => {
        setState(prev => ({ ...prev, phase: 'drawing', currentDrawer: 0 }));
      }, 5000);
    }
  }, [state.phase, players]);

  const handleRevealPrompt = () => {
    setRevealSecret(true);
  };

  const handleDrawingSubmit = () => {
    if (state.currentDrawer === null) return;

    const playerId = playerOrder[state.currentDrawer];
    setState(prev => ({
      ...prev,
      drawings: { ...prev.drawings, [playerId]: drawing },
    }));
    setDrawing('');

    if (state.currentDrawer < playerOrder.length - 1) {
      setState(prev => ({
        ...prev,
        currentDrawer: prev.currentDrawer! + 1,
      }));
    } else {
      setState(prev => ({ ...prev, phase: 'voting', currentDrawer: null }));
    }
  };

  const handleVote = (votedForId: number) => {
    setState(prev => ({
      ...prev,
      votes: { ...prev.votes, [prev.votes ? Object.keys(prev.votes).length : 0]: votedForId },
    }));

    if (Object.keys(state.votes).length + 1 >= players.length - 1) {
      setState(prev => ({ ...prev, phase: 'reveal' }));
    }
  };

  const handleNextRound = () => {
    if (state.round < state.maxRounds) {
      setState({
        phase: 'setup',
        prompt: randomItem(drawingPrompts),
        secretArtistId: Math.floor(Math.random() * players.length),
        drawings: {},
        currentDrawer: null,
        votes: {},
        round: state.round + 1,
        maxRounds: state.maxRounds,
      });
      setRevealSecret(false);
    } else {
      setState(prev => ({ ...prev, phase: 'end' }));
    }
  };

  const handleEndGame = () => {
    const updatedPlayers = players.map(p => {
      const votesReceived = Object.values(state.votes).filter(v => v === p.id).length;
      const isSecretArtist = p.id === state.secretArtistId;
      const points = isSecretArtist ? (votesReceived > players.length / 2 ? 0 : 10) : votesReceived;
      return { ...p, score: p.score + points };
    });
    onGameEnd(updatedPlayers);
  };

  if (state.phase === 'setup') {
    return (
      <div className="game">
        <h2 className="game__title">🎨 Secret Artist</h2>
        <Card className="game__info">
          <h3>Game Rules</h3>
          <p>Each player will draw the same prompt, except for ONE player - the Secret Artist!</p>
          <p>The Secret Artist doesn't know what to draw and must blend in.</p>
          <p>After everyone draws, vote for who you think the Secret Artist is!</p>
          <p className="game__round">Round {state.round} of {state.maxRounds}</p>
        </Card>
        <p className="game__status">Starting game...</p>
      </div>
    );
  }

  if (state.phase === 'drawing' && state.currentDrawer !== null) {
    const currentPlayerId = playerOrder[state.currentDrawer];
    const currentPlayer = players.find(p => p.id === currentPlayerId);
    const isSecretArtist = currentPlayerId === state.secretArtistId;

    return (
      <div className="game">
        <h2 className="game__title">🎨 Secret Artist</h2>
        <p className="game__round">Round {state.round} of {state.maxRounds}</p>
        <Card className="game__drawing-card">
          <h3>Current Drawer: {currentPlayer?.name}</h3>
          {!revealSecret && (
            <div>
              <p>Ready to see your prompt?</p>
              <Button onClick={handleRevealPrompt}>Show My Prompt</Button>
            </div>
          )}
          {revealSecret && (
            <div>
              <div className="game__prompt">
                {isSecretArtist ? (
                  <p className="game__secret">You are the SECRET ARTIST! Draw something to blend in!</p>
                ) : (
                  <p className="game__normal">Draw: <strong>{state.prompt}</strong></p>
                )}
              </div>
              <p>Describe what you drew (host will write it down):</p>
              <textarea
                className="game__textarea"
                value={drawing}
                onChange={(e) => setDrawing(e.target.value)}
                placeholder="Describe your drawing in a few words..."
                rows={4}
              />
              <Button onClick={handleDrawingSubmit} disabled={!drawing.trim()}>
                Submit Drawing
              </Button>
            </div>
          )}
        </Card>
        <p className="game__progress">
          Player {state.currentDrawer + 1} of {playerOrder.length}
        </p>
      </div>
    );
  }

  if (state.phase === 'voting') {
    return (
      <div className="game">
        <h2 className="game__title">🎨 Secret Artist - Voting</h2>
        <p className="game__round">Round {state.round} of {state.maxRounds}</p>
        <Card className="game__voting-card">
          <h3>All Drawings Complete!</h3>
          <p>Who do you think is the Secret Artist?</p>
          <p className="game__hint">The prompt was: <strong>{state.prompt}</strong></p>
          <div className="game__drawings">
            {players.map(player => (
              <div key={player.id} className="game__drawing-item">
                <strong>{player.name}:</strong> {state.drawings[player.id] || 'No drawing'}
              </div>
            ))}
          </div>
          <div className="game__vote-buttons">
            {players.map(player => (
              <Button
                key={player.id}
                onClick={() => handleVote(player.id)}
                variant="secondary"
              >
                {player.name}
              </Button>
            ))}
          </div>
        </Card>
        <p className="game__status">
          Votes: {Object.keys(state.votes).length} / {players.length}
        </p>
      </div>
    );
  }

  if (state.phase === 'reveal') {
    const secretArtist = players.find(p => p.id === state.secretArtistId);
    const voteCount: { [key: number]: number } = {};
    Object.values(state.votes).forEach(votedId => {
      voteCount[votedId] = (voteCount[votedId] || 0) + 1;
    });
    const mostVoted = Object.entries(voteCount).sort((a, b) => b[1] - a[1])[0];
    const caught = mostVoted && parseInt(mostVoted[0]) === state.secretArtistId;

    return (
      <div className="game">
        <h2 className="game__title">🎨 Secret Artist - Results</h2>
        <p className="game__round">Round {state.round} of {state.maxRounds}</p>
        <Card className="game__results">
          <h3>The Secret Artist was... {secretArtist?.name}!</h3>
          <p className={caught ? 'game__caught' : 'game__escaped'}>
            {caught ? '🎉 The Secret Artist was caught!' : '😈 The Secret Artist escaped!'}
          </p>
          <h4>Vote Results:</h4>
          {Object.entries(voteCount).map(([playerId, count]) => {
            const player = players.find(p => p.id === parseInt(playerId));
            return (
              <div key={playerId} className="game__vote-result">
                {player?.name}: {count} vote{count !== 1 ? 's' : ''}
              </div>
            );
          })}
        </Card>
        <Button onClick={handleNextRound}>
          {state.round < state.maxRounds ? 'Next Round' : 'View Final Scores'}
        </Button>
      </div>
    );
  }

  if (state.phase === 'end') {
    return (
      <div className="game">
        <h2 className="game__title">🎨 Secret Artist - Game Over!</h2>
        <Card className="game__final-scores">
          <h3>Final Scores</h3>
          {players
            .sort((a, b) => b.score - a.score)
            .map((player, index) => (
              <div key={player.id} className="game__score-item">
                <span className="game__rank">#{index + 1}</span>
                <span className="game__player-name">{player.name}</span>
                <span className="game__player-score">{player.score} pts</span>
              </div>
            ))}
        </Card>
        <Button onClick={handleEndGame}>Return to Menu</Button>
      </div>
    );
  }

  return null;
};
