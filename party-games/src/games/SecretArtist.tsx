import React, { useState, useEffect } from 'react';
import type { Player, SecretArtistState } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { randomItem, shuffle } from '../utils/helpers';
import { drawingPrompts } from '../utils/gameData';

interface SecretArtistProps {
  players: Player[];
  maxRounds: number;
  onGameEnd: (updatedPlayers: Player[]) => void;
}

export const SecretArtist: React.FC<SecretArtistProps> = ({ players, maxRounds, onGameEnd }) => {
  const [state, setState] = useState<SecretArtistState>(() => ({
    phase: 'hostPreview',
    prompt: randomItem(drawingPrompts),
    secretArtistId: players[Math.floor(Math.random() * players.length)].id,
    drawings: {},
    currentDrawer: null,
    votes: {},
    round: 1,
    maxRounds,
  }));

  const [currentRevealPlayer, setCurrentRevealPlayer] = useState(0);
  const [showingPrompts, setShowingPrompts] = useState(true);
  const [votingOrder, setVotingOrder] = useState<number[]>([]);
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [drawingTimer, setDrawingTimer] = useState(90); // 90 seconds to draw

  // Handler to reroll prompts (host preview)
  const handleRerollPrompts = () => {
    setState(prev => ({
      ...prev,
      prompt: randomItem(drawingPrompts),
      secretArtistId: players[Math.floor(Math.random() * players.length)].id,
    }));
  };

  // Handler to start the round from host preview
  const handleStartRound = () => {
    setState(prev => ({ ...prev, phase: 'setup' }));
  };

  // Setup phase - immediately move to drawing (prompt reveal)
  useEffect(() => {
    if (state.phase === 'setup') {
      setState(prev => ({ ...prev, phase: 'drawing' }));
      setCurrentRevealPlayer(0);
      setShowingPrompts(true);
    }
  }, [state.phase]);

  // Drawing phase timer (only when not showing prompts)
  useEffect(() => {
    if (state.phase === 'drawing' && !showingPrompts && drawingTimer > 0) {
      const timer = setTimeout(() => setDrawingTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (state.phase === 'drawing' && !showingPrompts && drawingTimer === 0) {
      handleStartVoting();
    }
  }, [state.phase, showingPrompts, drawingTimer]);

  const handleNextReveal = () => {
    if (currentRevealPlayer < players.length - 1) {
      setCurrentRevealPlayer(prev => prev + 1);
    } else {
      setShowingPrompts(false);
      setDrawingTimer(90);
    }
  };

  const handleStartVoting = () => {
    // Create voting order: all players except the secret artist, in random order
    const eligibleVoters = players
      .filter(p => p.id !== state.secretArtistId)
      .map(p => p.id);
    const randomOrder = shuffle(eligibleVoters);

    setVotingOrder(randomOrder);
    setCurrentVoterIndex(0);
    setState(prev => ({ ...prev, phase: 'voting', votes: {} }));
  };

  const handleVote = (votedForId: number) => {
    const voterId = votingOrder[currentVoterIndex];

    setState(prev => ({
      ...prev,
      votes: { ...prev.votes, [voterId]: votedForId },
    }));

    if (currentVoterIndex < votingOrder.length - 1) {
      setCurrentVoterIndex(prev => prev + 1);
    } else {
      // All votes are in, calculate scores and move to reveal
      calculateScores();
    }
  };

  const calculateScores = () => {
    setState(prev => {
      const newPhase = 'reveal';
      return { ...prev, phase: newPhase };
    });
  };

  const handleNextRound = () => {
    // Calculate and apply scores for this round
    const updatedPlayers = players.map(p => {
      let points = 0;

      // Check each vote
      Object.entries(state.votes).forEach(([voterId, votedForId]) => {
        if (votedForId === state.secretArtistId) {
          // Correct guess - voter gets 1 point
          if (parseInt(voterId) === p.id) {
            points += 1;
          }
        } else {
          // Wrong guess - secret artist gets 1 point
          if (p.id === state.secretArtistId) {
            points += 1;
          }
        }
      });

      return { ...p, score: p.score + points };
    });

    // Update players array with new scores
    players.splice(0, players.length, ...updatedPlayers);

    if (state.round < state.maxRounds) {
      setState({
        phase: 'hostPreview',
        prompt: randomItem(drawingPrompts),
        secretArtistId: players[Math.floor(Math.random() * players.length)].id,
        drawings: {},
        currentDrawer: null,
        votes: {},
        round: state.round + 1,
        maxRounds: state.maxRounds,
      });
      setCurrentRevealPlayer(0);
      setShowingPrompts(true);
      setVotingOrder([]);
      setCurrentVoterIndex(0);
      setDrawingTimer(90);
    } else {
      setState(prev => ({ ...prev, phase: 'end' }));
    }
  };

  const handleEndGame = () => {
    // Scores have already been applied in handleNextRound
    // Just pass the players back to the parent
    onGameEnd(players);
  };

  if (state.phase === 'hostPreview') {
    const secretArtist = players.find(p => p.id === state.secretArtistId);

    return (
      <div className="game">
        <h2 className="game__title">🎨 Secret Artist - Host Preview</h2>
        <p className="game__round">Round {state.round} of {state.maxRounds}</p>
        <Card className="game__info">
          <h3>Preview Prompts</h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
            Review the prompts for this round. If you don't like them, click "Reroll Prompts" to get new ones.
          </p>

          <div style={{ margin: '20px 0', padding: '20px', background: '#f3f4f6', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '18px', marginBottom: '15px' }}>This Round's Prompts:</h4>

            <div style={{ marginBottom: '15px', padding: '15px', background: '#dbeafe', borderRadius: '6px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Normal Prompt (for most players):</p>
              <p style={{ fontSize: '20px', color: '#1e40af' }}>{state.prompt.normal}</p>
            </div>

            <div style={{ marginBottom: '15px', padding: '15px', background: '#fee2e2', borderRadius: '6px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Secret Artist Prompt (for {secretArtist?.name}):</p>
              <p style={{ fontSize: '20px', color: '#dc2626' }}>{state.prompt.secret}</p>
            </div>

            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '15px' }}>
              ℹ️ The Secret Artist will NOT know they have a different prompt.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button onClick={handleRerollPrompts} variant="secondary">
              🎲 Reroll Prompts
            </Button>
            <Button onClick={handleStartRound} size="large">
              ▶️ Start Round
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (state.phase === 'setup') {
    return (
      <div className="game">
        <h2 className="game__title">🎨 Secret Artist</h2>
        <Card className="game__info">
          <h3>Game Rules</h3>
          <p>📝 Each player will receive a prompt and draw it on their WHITEBOARD.</p>
          <p>🎭 ONE player is the Secret Artist - they get a SIMILAR but DIFFERENT prompt!</p>
          <p>🖌️ The Secret Artist doesn't know they're different and draws what they see.</p>
          <p>🗳️ After drawing, players vote one-by-one for who they think the Secret Artist is.</p>
          <p>📊 <strong>Scoring:</strong></p>
          <ul style={{ textAlign: 'left', marginLeft: '20px' }}>
            <li>✅ Guess correctly: You get 1 point</li>
            <li>❌ Guess wrong: Secret Artist gets 1 point</li>
          </ul>
          <p className="game__round">Round {state.round} of {state.maxRounds}</p>
        </Card>
        <p className="game__status">Get your whiteboards ready...</p>
      </div>
    );
  }

  if (state.phase === 'drawing' && showingPrompts) {
    const currentPlayer = players[currentRevealPlayer];
    const isSecretArtist = currentPlayer.id === state.secretArtistId;

    return (
      <div className="game">
        <h2 className="game__title">🎨 Secret Artist</h2>
        <p className="game__round">Round {state.round} of {state.maxRounds}</p>
        <Card className="game__drawing-card">
          <h3>Current Player: {currentPlayer?.name}</h3>
          <p className="game__hint">👀 Other players: Look away!</p>

          <div className="game__prompt" style={{ margin: '40px 0', padding: '30px', fontSize: '24px' }}>
            <p className="game__normal" style={{ fontSize: '32px', fontWeight: 'bold' }}>
              Draw: {isSecretArtist ? state.prompt.secret : state.prompt.normal}
            </p>
          </div>

          <Button onClick={handleNextReveal} size="large">
            {currentRevealPlayer < players.length - 1 ? 'Next Player' : 'Start Drawing!'}
          </Button>

          <p className="game__progress">
            Player {currentRevealPlayer + 1} of {players.length}
          </p>
        </Card>
      </div>
    );
  }

  if (state.phase === 'drawing' && !showingPrompts) {
    const minutes = Math.floor(drawingTimer / 60);
    const seconds = drawingTimer % 60;

    return (
      <div className="game">
        <h2 className="game__title">🎨 Secret Artist - Drawing Time!</h2>
        <p className="game__round">Round {state.round} of {state.maxRounds}</p>
        <Card className="game__drawing-card">
          <h3>🖌️ Draw on your whiteboards!</h3>
          <p style={{ fontSize: '18px', margin: '20px 0' }}>
            Everyone draw your prompt on your physical whiteboard.
          </p>

          <div style={{
            fontSize: '64px',
            fontWeight: 'bold',
            margin: '40px 0',
            color: drawingTimer <= 10 ? '#ef4444' : '#3b82f6'
          }}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>

          <p className="game__hint">Remember your prompt and draw it!</p>
          <p style={{ marginTop: '20px', color: '#6b7280' }}>
            (One player has a slightly different prompt - but they don't know it!)
          </p>

          {drawingTimer > 0 && (
            <div style={{ marginTop: '20px' }}>
              <Button onClick={handleStartVoting} variant="secondary">
                Skip Timer & Start Voting
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  if (state.phase === 'voting') {
    const currentVoterId = votingOrder[currentVoterIndex];
    const currentVoter = players.find(p => p.id === currentVoterId);

    return (
      <div className="game">
        <h2 className="game__title">🎨 Secret Artist - Voting</h2>
        <p className="game__round">Round {state.round} of {state.maxRounds}</p>
        <Card className="game__voting-card">
          <h3>Current Voter: {currentVoter?.name}</h3>
          <p>Look at all the whiteboards. Who do you think is the Secret Artist?</p>
          <p className="game__hint">The prompt was: <strong>{state.prompt.normal}</strong></p>

          <div className="game__vote-buttons" style={{ marginTop: '30px', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
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

          <p className="game__progress" style={{ marginTop: '30px' }}>
            Vote {currentVoterIndex + 1} of {votingOrder.length}
          </p>
        </Card>
      </div>
    );
  }

  if (state.phase === 'reveal') {
    const secretArtist = players.find(p => p.id === state.secretArtistId);

    // Calculate points for this round
    const roundPoints: { [key: number]: number } = {};
    players.forEach(p => { roundPoints[p.id] = 0; });

    Object.entries(state.votes).forEach(([voterId, votedForId]) => {
      if (votedForId === state.secretArtistId) {
        // Correct guess
        roundPoints[parseInt(voterId)] = (roundPoints[parseInt(voterId)] || 0) + 1;
      } else {
        // Wrong guess
        roundPoints[state.secretArtistId] = (roundPoints[state.secretArtistId] || 0) + 1;
      }
    });

    const correctGuesses = Object.values(state.votes).filter(v => v === state.secretArtistId).length;
    const wrongGuesses = Object.values(state.votes).length - correctGuesses;

    return (
      <div className="game">
        <h2 className="game__title">🎨 Secret Artist - Results</h2>
        <p className="game__round">Round {state.round} of {state.maxRounds}</p>
        <Card className="game__results">
          <h3 style={{ fontSize: '28px', marginBottom: '20px' }}>
            The Secret Artist was... {secretArtist?.name}! 🎭
          </h3>

          <div style={{ margin: '30px 0', padding: '20px', background: '#f3f4f6', borderRadius: '8px' }}>
            <h4>Round Results:</h4>
            <p style={{ fontSize: '18px', margin: '10px 0' }}>
              ✅ Correct guesses: {correctGuesses}
            </p>
            <p style={{ fontSize: '18px', margin: '10px 0' }}>
              ❌ Wrong guesses: {wrongGuesses}
            </p>
          </div>

          <div style={{ margin: '20px 0', padding: '20px', background: '#fef3c7', borderRadius: '8px' }}>
            <h4>The Prompts:</h4>
            <p style={{ fontSize: '16px', margin: '10px 0' }}>
              <strong>Everyone drew:</strong> {state.prompt.normal}
            </p>
            <p style={{ fontSize: '16px', margin: '10px 0', color: '#dc2626' }}>
              <strong>Secret Artist drew:</strong> {state.prompt.secret}
            </p>
          </div>

          <h4>Points Earned This Round:</h4>
          <div style={{ marginTop: '15px' }}>
            {players.map(player => {
              const points = roundPoints[player.id] || 0;
              if (points > 0) {
                return (
                  <div key={player.id} style={{
                    padding: '10px',
                    margin: '5px 0',
                    background: player.id === state.secretArtistId ? '#fecaca' : '#86efac',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#000',
                    fontWeight: '500'
                  }}>
                    <span>
                      {player.name}
                      {player.id === state.secretArtistId && ' 🎭'}
                    </span>
                    <span style={{ fontWeight: 'bold' }}>+{points} point{points !== 1 ? 's' : ''}</span>
                  </div>
                );
              }
              return null;
            })}
          </div>

          <h4 style={{ marginTop: '30px' }}>All Votes:</h4>
          <div style={{ marginTop: '15px' }}>
            {Object.entries(state.votes).map(([voterId, votedForId]) => {
              const voter = players.find(p => p.id === parseInt(voterId));
              const votedFor = players.find(p => p.id === votedForId);
              const isCorrect = votedForId === state.secretArtistId;

              return (
                <div key={voterId} style={{ padding: '8px', margin: '3px 0' }}>
                  {voter?.name} voted for {votedFor?.name} {isCorrect ? '✅' : '❌'}
                </div>
              );
            })}
          </div>
        </Card>

        <div style={{ marginTop: '20px' }}>
          <Button onClick={handleNextRound} size="large">
            {state.round < state.maxRounds ? 'Next Round' : 'View Final Scores'}
          </Button>
        </div>
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
        <Button onClick={handleEndGame} size="large">Return to Menu</Button>
      </div>
    );
  }

  return null;
};
