import React, { useState, useEffect } from 'react';
import type { Player, StoryRemixState, StorySegment } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { randomItem } from '../utils/helpers';
import { storyPrompts, storyTwists } from '../utils/gameData';

interface StoryRemixProps {
  players: Player[];
  onGameEnd: (updatedPlayers: Player[]) => void;
}

export const StoryRemix: React.FC<StoryRemixProps> = ({ players, onGameEnd }) => {
  const [state, setState] = useState<StoryRemixState>(() => ({
    phase: 'writing',
    story: [{
      playerId: -1,
      text: randomItem(storyPrompts),
      round: 0,
    }],
    currentWriter: 0,
    submissions: {},
    round: 1,
    maxRounds: players.length,
    favoriteVotes: {},
  }));

  const [input, setInput] = useState('');
  const [showTwist, setShowTwist] = useState(false);
  const [currentTwist, setCurrentTwist] = useState('');

  useEffect(() => {
    if (state.phase === 'writing' && state.round % 3 === 0) {
      setCurrentTwist(randomItem(storyTwists));
      setShowTwist(true);
    } else {
      setShowTwist(false);
    }
  }, [state.round, state.phase]);

  const handleSubmit = () => {
    if (!input.trim() || state.currentWriter === null) return;

    const playerId = state.currentWriter;
    const newSegment: StorySegment = {
      playerId,
      text: input,
      round: state.round,
    };

    setState(prev => ({
      ...prev,
      story: [...prev.story, newSegment],
      submissions: { ...prev.submissions, [playerId]: input },
    }));
    setInput('');

    if (state.round < state.maxRounds) {
      const nextWriter = (state.currentWriter + 1) % players.length;
      setState(prev => ({
        ...prev,
        currentWriter: nextWriter,
        round: prev.round + 1,
      }));
    } else {
      setState(prev => ({ ...prev, phase: 'reading', currentWriter: null }));
    }
  };

  const handleVote = (segmentRound: number) => {
    setState(prev => ({
      ...prev,
      favoriteVotes: { ...prev.favoriteVotes, [Object.keys(prev.favoriteVotes).length]: segmentRound },
    }));

    if (Object.keys(state.favoriteVotes).length + 1 >= players.length) {
      setState(prev => ({ ...prev, phase: 'voting' }));
    }
  };

  const handleEndGame = () => {
    const voteCounts: { [round: number]: number } = {};
    Object.values(state.favoriteVotes).forEach(round => {
      voteCounts[round] = (voteCounts[round] || 0) + 1;
    });

    const updatedPlayers = players.map(p => {
      const playerSegments = state.story.filter(seg => seg.playerId === p.id);
      const votes = playerSegments.reduce((sum, seg) => sum + (voteCounts[seg.round] || 0), 0);
      return { ...p, score: p.score + votes * 10 };
    });

    onGameEnd(updatedPlayers);
  };

  if (state.phase === 'writing' && state.currentWriter !== null) {
    const currentPlayer = players[state.currentWriter];

    return (
      <div className="game">
        <h2 className="game__title">📖 Story Remix</h2>
        <p className="game__round">Round {state.round} of {state.maxRounds}</p>
        <Card className="game__writing-card">
          <h3>Current Writer: {currentPlayer.name}</h3>
          <div className="game__story-so-far">
            <h4>Story So Far:</h4>
            <div className="game__story-text">
              {state.story.map((segment, idx) => (
                <p key={idx}>
                  {segment.text}
                </p>
              ))}
            </div>
          </div>
          {showTwist && (
            <div className="game__twist">
              <strong>🎲 Plot Twist!</strong> {currentTwist}
            </div>
          )}
          <p>Add the next sentence to the story:</p>
          <textarea
            className="game__textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Continue the story..."
            rows={3}
            maxLength={200}
          />
          <Button onClick={handleSubmit} disabled={!input.trim()}>
            Submit
          </Button>
        </Card>
      </div>
    );
  }

  if (state.phase === 'reading') {
    return (
      <div className="game">
        <h2 className="game__title">📖 Story Remix - The Complete Story</h2>
        <Card className="game__reading-card">
          <h3>Here's the story you all created!</h3>
          <div className="game__final-story">
            {state.story.map((segment, idx) => (
              <p key={idx} className={idx === 0 ? 'game__story-intro' : ''}>
                {segment.text}
                {segment.playerId >= 0 && (
                  <span className="game__author"> — {players.find(p => p.id === segment.playerId)?.name}</span>
                )}
              </p>
            ))}
          </div>
          <h4>Vote for your favorite contribution!</h4>
          <div className="game__vote-buttons">
            {state.story.slice(1).map((segment, idx) => (
              <Button
                key={idx}
                onClick={() => handleVote(segment.round)}
                variant="secondary"
                size="small"
              >
                Round {segment.round} ({players.find(p => p.id === segment.playerId)?.name})
              </Button>
            ))}
          </div>
        </Card>
        <p className="game__status">
          Votes: {Object.keys(state.favoriteVotes).length} / {players.length}
        </p>
      </div>
    );
  }

  if (state.phase === 'voting') {
    const voteCounts: { [round: number]: number } = {};
    Object.values(state.favoriteVotes).forEach(round => {
      voteCounts[round] = (voteCounts[round] || 0) + 1;
    });

    return (
      <div className="game">
        <h2 className="game__title">📖 Story Remix - Results</h2>
        <Card className="game__results">
          <h3>Vote Results</h3>
          {state.story.slice(1).map((segment, idx) => {
            const votes = voteCounts[segment.round] || 0;
            const author = players.find(p => p.id === segment.playerId);
            return (
              <div key={idx} className="game__vote-result">
                <div className="game__segment">"{segment.text}"</div>
                <div className="game__segment-info">
                  {author?.name}: {votes} vote{votes !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </Card>
        <Button onClick={handleEndGame}>Return to Menu</Button>
      </div>
    );
  }

  return null;
};
