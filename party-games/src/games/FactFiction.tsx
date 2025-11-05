import React, { useState } from 'react';
import type { Player, FactFictionState, FactSubmission } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { generateId, randomItem } from '../utils/helpers';
import { factCategories } from '../utils/gameData';

interface FactFictionProps {
  players: Player[];
  onGameEnd: (updatedPlayers: Player[]) => void;
}

export const FactFiction: React.FC<FactFictionProps> = ({ players, onGameEnd }) => {
  const [state, setState] = useState<FactFictionState>(() => ({
    phase: 'submission',
    currentSubject: 0,
    facts: {},
    guesses: {},
    round: 1,
    maxRounds: Math.min(players.length, 5),
  }));

  const [trueFact, setTrueFact] = useState('');
  const [falseFact1, setFalseFact1] = useState('');
  const [falseFact2, setFalseFact2] = useState('');
  const [currentCategory] = useState(randomItem(factCategories));

  const handleSubmitFacts = () => {
    if (!trueFact.trim() || !falseFact1.trim() || !falseFact2.trim()) return;
    if (state.currentSubject === null) return;

    const playerId = state.currentSubject;
    const submissions: FactSubmission[] = [
      { id: generateId(), text: trueFact, isTrue: true },
      { id: generateId(), text: falseFact1, isTrue: false },
      { id: generateId(), text: falseFact2, isTrue: false },
    ];

    // Shuffle the facts
    const shuffled = submissions.sort(() => Math.random() - 0.5);

    setState(prev => ({
      ...prev,
      facts: { ...prev.facts, [playerId]: shuffled },
      phase: 'guessing',
    }));

    setTrueFact('');
    setFalseFact1('');
    setFalseFact2('');
  };

  const handleGuess = (factId: string, isTrue: boolean) => {
    const guesserCount = Object.keys(state.guesses).length;
    setState(prev => ({
      ...prev,
      guesses: {
        ...prev.guesses,
        [guesserCount]: { ...prev.guesses[guesserCount], [factId]: isTrue },
      },
    }));

    // Check if all non-subject players have guessed all facts
    const currentSubjectId = state.currentSubject;
    const currentFacts = state.facts[currentSubjectId!] || [];
    const totalGuessesNeeded = (players.length - 1) * currentFacts.length;
    const currentGuesses = Object.values(state.guesses).reduce(
      (sum, playerGuesses) => sum + Object.keys(playerGuesses).length,
      0
    );

    if (currentGuesses + 1 >= totalGuessesNeeded) {
      setState(prev => ({ ...prev, phase: 'reveal' }));
    }
  };

  const handleNextRound = () => {
    if (state.round < state.maxRounds) {
      const nextSubject = (state.currentSubject! + 1) % players.length;
      setState({
        phase: 'submission',
        currentSubject: nextSubject,
        facts: state.facts,
        guesses: {},
        round: state.round + 1,
        maxRounds: state.maxRounds,
      });
    } else {
      setState(prev => ({ ...prev, phase: 'end' }));
    }
  };

  const handleEndGame = () => {
    // Calculate scores based on correct guesses
    const updatedPlayers = players.map(p => {
      let score = 0;
      Object.entries(state.facts).forEach(([subjectId, facts]) => {
        if (parseInt(subjectId) !== p.id) {
          // Points for correct guesses
          facts.forEach(fact => {
            Object.values(state.guesses).forEach(playerGuesses => {
              if (playerGuesses[fact.id] === fact.isTrue) {
                score += 5;
              }
            });
          });
        } else {
          // Points for fooling others
          facts.filter(f => !f.isTrue).forEach(fact => {
            Object.values(state.guesses).forEach(playerGuesses => {
              if (playerGuesses[fact.id] === true) {
                score += 10;
              }
            });
          });
        }
      });
      return { ...p, score: p.score + score };
    });

    onGameEnd(updatedPlayers);
  };

  if (state.phase === 'submission' && state.currentSubject !== null) {
    const currentPlayer = players[state.currentSubject];

    return (
      <div className="game">
        <h2 className="game__title">🤔 Fact or Fiction</h2>
        <p className="game__round">Round {state.round} of {state.maxRounds}</p>
        <Card className="game__submission-card">
          <h3>Current Player: {currentPlayer.name}</h3>
          <p className="game__category"><strong>Category:</strong> {currentCategory}</p>
          <p>Submit one TRUE fact and two FALSE facts about yourself:</p>

          <div className="game__input-group">
            <label>True Fact:</label>
            <textarea
              className="game__textarea"
              value={trueFact}
              onChange={(e) => setTrueFact(e.target.value)}
              placeholder="Enter a true fact..."
              rows={2}
              maxLength={150}
            />
          </div>

          <div className="game__input-group">
            <label>False Fact #1:</label>
            <textarea
              className="game__textarea"
              value={falseFact1}
              onChange={(e) => setFalseFact1(e.target.value)}
              placeholder="Make up something believable..."
              rows={2}
              maxLength={150}
            />
          </div>

          <div className="game__input-group">
            <label>False Fact #2:</label>
            <textarea
              className="game__textarea"
              value={falseFact2}
              onChange={(e) => setFalseFact2(e.target.value)}
              placeholder="Make up another believable fact..."
              rows={2}
              maxLength={150}
            />
          </div>

          <Button
            onClick={handleSubmitFacts}
            disabled={!trueFact.trim() || !falseFact1.trim() || !falseFact2.trim()}
          >
            Submit Facts
          </Button>
        </Card>
      </div>
    );
  }

  if (state.phase === 'guessing' && state.currentSubject !== null) {
    const currentPlayer = players[state.currentSubject];
    const facts = state.facts[state.currentSubject] || [];

    return (
      <div className="game">
        <h2 className="game__title">🤔 Fact or Fiction - Guessing</h2>
        <p className="game__round">Round {state.round} of {state.maxRounds}</p>
        <Card className="game__guessing-card">
          <h3>About {currentPlayer.name}:</h3>
          <p>Which of these facts are TRUE? (You can vote for multiple)</p>
          <div className="game__facts-list">
            {facts.map((fact) => (
              <Card key={fact.id} className="game__fact-card">
                <p className="game__fact-text">{fact.text}</p>
                <div className="game__fact-buttons">
                  <Button
                    onClick={() => handleGuess(fact.id, true)}
                    variant="success"
                    size="small"
                  >
                    TRUE
                  </Button>
                  <Button
                    onClick={() => handleGuess(fact.id, false)}
                    variant="danger"
                    size="small"
                  >
                    FALSE
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>
        <p className="game__hint">Everyone except {currentPlayer.name} should vote!</p>
      </div>
    );
  }

  if (state.phase === 'reveal' && state.currentSubject !== null) {
    const currentPlayer = players[state.currentSubject];
    const facts = state.facts[state.currentSubject] || [];

    return (
      <div className="game">
        <h2 className="game__title">🤔 Fact or Fiction - Results</h2>
        <p className="game__round">Round {state.round} of {state.maxRounds}</p>
        <Card className="game__reveal-card">
          <h3>The Truth About {currentPlayer.name}</h3>
          <div className="game__reveals">
            {facts.map((fact) => (
              <div key={fact.id} className={`game__reveal-item ${fact.isTrue ? 'game__reveal--true' : 'game__reveal--false'}`}>
                <p className="game__fact-text">{fact.text}</p>
                <p className="game__fact-verdict">
                  {fact.isTrue ? '✅ TRUE!' : '❌ FALSE!'}
                </p>
              </div>
            ))}
          </div>
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
        <h2 className="game__title">🤔 Fact or Fiction - Game Over!</h2>
        <Card className="game__final-scores">
          <h3>Final Scores</h3>
          <p>Points earned for correct guesses and fooling others!</p>
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
