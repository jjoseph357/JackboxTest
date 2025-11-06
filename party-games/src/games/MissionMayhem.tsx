import React, { useState, useEffect } from 'react';
import type { Player, MissionMayhemState } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { randomItems, getMissionTeamSize, getSaboteurCount } from '../utils/helpers';
import { missions } from '../utils/gameData';

interface MissionMayhemProps {
  players: Player[];
  maxRounds: number;
  onGameEnd: (updatedPlayers: Player[]) => void;
}

export const MissionMayhem: React.FC<MissionMayhemProps> = ({ players, maxRounds, onGameEnd }) => {
  const [state, setState] = useState<MissionMayhemState>(() => {
    const saboteurs = randomItems(players, getSaboteurCount(players.length)).map(p => p.id);
    return {
      phase: 'team-select',
      teamLeader: 0,
      proposedTeam: [],
      missionVotes: {},
      saboteurs,
      missionResults: [],
      actionSubmissions: {},
      round: 0,
      maxRounds,
      teamSize: getMissionTeamSize(players.length, 0),
    };
  });

  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [showRole, setShowRole] = useState(false);
  const [currentMission] = useState(missions[state.round] || missions[0]);

  useEffect(() => {
    if (state.phase === 'team-select') {
      setState(prev => ({
        ...prev,
        teamSize: getMissionTeamSize(players.length, prev.round),
      }));
      setSelectedPlayers([]);
    }
  }, [state.phase, state.round, players.length]);

  const handleRevealRole = () => {
    setShowRole(true);
  };

  const togglePlayerSelection = (playerId: number) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else if (selectedPlayers.length < state.teamSize) {
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
  };

  const handleProposeTeam = () => {
    setState(prev => ({
      ...prev,
      proposedTeam: selectedPlayers,
      phase: 'mission-vote',
      missionVotes: {},
    }));
  };

  const handleTeamVote = (approve: boolean) => {
    const voterId = Object.keys(state.missionVotes).length;
    setState(prev => ({
      ...prev,
      missionVotes: { ...prev.missionVotes, [voterId]: approve },
    }));

    if (Object.keys(state.missionVotes).length + 1 >= players.length) {
      const approvals = Object.values({ ...state.missionVotes, [voterId]: approve }).filter(v => v).length;
      if (approvals > players.length / 2) {
        setState(prev => ({ ...prev, phase: 'mission-action', actionSubmissions: {} }));
      } else {
        const nextLeader = (state.teamLeader + 1) % players.length;
        setState(prev => ({
          ...prev,
          phase: 'team-select',
          teamLeader: nextLeader,
          proposedTeam: [],
          missionVotes: {},
        }));
      }
    }
  };

  const handleMissionAction = (action: 'success' | 'fail') => {
    const actorId = Object.keys(state.actionSubmissions).length;
    const playerId = state.proposedTeam[actorId];

    setState(prev => ({
      ...prev,
      actionSubmissions: { ...prev.actionSubmissions, [playerId]: action },
    }));

    if (Object.keys(state.actionSubmissions).length + 1 >= state.proposedTeam.length) {
      const newSubmissions = { ...state.actionSubmissions, [playerId]: action };
      const failures = Object.values(newSubmissions).filter(a => a === 'fail').length;
      const missionSuccess = failures === 0;

      setState(prev => ({
        ...prev,
        missionResults: [...prev.missionResults, missionSuccess],
        phase: 'reveal',
      }));
    }
  };

  const handleNextRound = () => {
    if (state.round < state.maxRounds - 1) {
      const nextLeader = (state.teamLeader + 1) % players.length;
      setState(prev => ({
        ...prev,
        phase: 'team-select',
        teamLeader: nextLeader,
        proposedTeam: [],
        missionVotes: {},
        actionSubmissions: {},
        round: prev.round + 1,
      }));
    } else {
      setState(prev => ({ ...prev, phase: 'end' }));
    }
  };

  const handleEndGame = () => {
    const successes = state.missionResults.filter(r => r).length;
    const teamWins = successes >= 3;

    const updatedPlayers = players.map(p => {
      const isSaboteur = state.saboteurs.includes(p.id);
      const points = (isSaboteur && !teamWins) || (!isSaboteur && teamWins) ? 50 : 0;
      return { ...p, score: p.score + points };
    });

    onGameEnd(updatedPlayers);
  };

  if (state.phase === 'team-select') {
    const leader = players[state.teamLeader];

    if (!showRole) {
      return (
        <div className="game">
          <h2 className="game__title">🕵️ Mission Mayhem</h2>
          <p className="game__round">Mission {state.round + 1} of {state.maxRounds}</p>
          <Card className="game__role-card">
            <h3>Welcome, Agents!</h3>
            <p>Each of you will be assigned a secret role. Click below to reveal your role privately!</p>
            <p className="game__hint">Don't let anyone else see your screen!</p>
            <Button onClick={handleRevealRole}>Reveal My Role</Button>
          </Card>
        </div>
      );
    }

    return (
      <div className="game">
        <h2 className="game__title">🕵️ Mission Mayhem</h2>
        <p className="game__round">Mission {state.round + 1} of {state.maxRounds}</p>
        <Card className="game__leader-card">
          <h3>Team Leader: {leader.name}</h3>
          <p className="game__mission"><strong>Mission:</strong> {currentMission}</p>
          <p>Select {state.teamSize} players for this mission:</p>
          <div className="game__player-select">
            {players.map(player => (
              <Card
                key={player.id}
                className="game__player-option"
                selected={selectedPlayers.includes(player.id)}
                onClick={() => togglePlayerSelection(player.id)}
              >
                {player.name}
              </Card>
            ))}
          </div>
          <p className="game__selection-count">
            Selected: {selectedPlayers.length} / {state.teamSize}
          </p>
          <Button
            onClick={handleProposeTeam}
            disabled={selectedPlayers.length !== state.teamSize}
          >
            Propose Team
          </Button>
        </Card>
      </div>
    );
  }

  if (state.phase === 'mission-vote') {
    const leader = players[state.teamLeader];
    const approvals = Object.values(state.missionVotes).filter(v => v).length;
    const rejections = Object.values(state.missionVotes).filter(v => !v).length;

    return (
      <div className="game">
        <h2 className="game__title">🕵️ Mission Mayhem - Team Vote</h2>
        <p className="game__round">Mission {state.round + 1} of {state.maxRounds}</p>
        <Card className="game__vote-card">
          <h3>{leader.name} proposes this team:</h3>
          <div className="game__proposed-team">
            {state.proposedTeam.map(id => {
              const player = players.find(p => p.id === id);
              return <div key={id} className="game__team-member">{player?.name}</div>;
            })}
          </div>
          <p>Do you approve this team for the mission?</p>
          <div className="game__vote-buttons">
            <Button onClick={() => handleTeamVote(true)} variant="success">
              Approve
            </Button>
            <Button onClick={() => handleTeamVote(false)} variant="danger">
              Reject
            </Button>
          </div>
          <p className="game__vote-status">
            Votes: {Object.keys(state.missionVotes).length} / {players.length}
            {Object.keys(state.missionVotes).length > 0 && ` (${approvals} ✓, ${rejections} ✗)`}
          </p>
        </Card>
      </div>
    );
  }

  if (state.phase === 'mission-action') {
    const actorIndex = Object.keys(state.actionSubmissions).length;
    if (actorIndex >= state.proposedTeam.length) {
      return null;
    }

    const actorId = state.proposedTeam[actorIndex];
    const actor = players.find(p => p.id === actorId);
    const isSaboteur = state.saboteurs.includes(actorId);

    return (
      <div className="game">
        <h2 className="game__title">🕵️ Mission Mayhem - Mission Action</h2>
        <p className="game__round">Mission {state.round + 1} of {state.maxRounds}</p>
        <Card className="game__action-card">
          <h3>Agent: {actor?.name}</h3>
          <p className="game__mission"><strong>Mission:</strong> {currentMission}</p>
          {isSaboteur ? (
            <div>
              <p className="game__saboteur">You are a SABOTEUR!</p>
              <p>You can choose to sabotage this mission or help it succeed to stay hidden.</p>
            </div>
          ) : (
            <div>
              <p className="game__agent">You are a LOYAL AGENT!</p>
              <p>Help the mission succeed!</p>
            </div>
          )}
          <div className="game__action-buttons">
            <Button onClick={() => handleMissionAction('success')} variant="success" size="large">
              Support Mission
            </Button>
            {isSaboteur && (
              <Button onClick={() => handleMissionAction('fail')} variant="danger" size="large">
                Sabotage Mission
              </Button>
            )}
          </div>
          <p className="game__hint">Your choice is anonymous!</p>
        </Card>
        <p className="game__progress">
          Agent {actorIndex + 1} of {state.proposedTeam.length}
        </p>
      </div>
    );
  }

  if (state.phase === 'reveal') {
    const missionSuccess = state.missionResults[state.missionResults.length - 1];
    const failures = Object.values(state.actionSubmissions).filter(a => a === 'fail').length;
    const successes = state.missionResults.filter(r => r).length;
    const teamWinning = successes >= 3;
    const saboWinning = (state.missionResults.length - successes) >= 3;

    return (
      <div className="game">
        <h2 className="game__title">🕵️ Mission Mayhem - Mission Results</h2>
        <p className="game__round">Mission {state.round + 1} of {state.maxRounds}</p>
        <Card className="game__results">
          <h3 className={missionSuccess ? 'game__success' : 'game__failure'}>
            {missionSuccess ? '✅ Mission Successful!' : '❌ Mission Failed!'}
          </h3>
          <p>
            {failures === 0
              ? 'All agents supported the mission!'
              : `${failures} sabotage action${failures !== 1 ? 's' : ''} detected!`}
          </p>
          <h4>Mission Track:</h4>
          <div className="game__mission-track">
            {state.missionResults.map((success, idx) => (
              <span key={idx} className={success ? 'game__track-success' : 'game__track-fail'}>
                {success ? '✅' : '❌'}
              </span>
            ))}
            {Array.from({ length: state.maxRounds - state.missionResults.length }).map((_, idx) => (
              <span key={`empty-${idx}`} className="game__track-empty">⬜</span>
            ))}
          </div>
          <p className="game__status">
            Team: {successes} wins | Saboteurs: {state.missionResults.length - successes} wins
          </p>
          {(teamWinning || saboWinning) && (
            <p className="game__winner">
              {teamWinning ? '🎉 The Team is winning!' : '😈 The Saboteurs are winning!'}
            </p>
          )}
        </Card>
        <Button onClick={handleNextRound}>
          {state.round < state.maxRounds - 1 ? 'Next Mission' : 'View Final Results'}
        </Button>
      </div>
    );
  }

  if (state.phase === 'end') {
    const successes = state.missionResults.filter(r => r).length;
    const teamWins = successes >= 3;

    return (
      <div className="game">
        <h2 className="game__title">🕵️ Mission Mayhem - Game Over!</h2>
        <Card className="game__final-results">
          <h3>{teamWins ? '🎉 The Team Wins!' : '😈 The Saboteurs Win!'}</h3>
          <h4>Mission Results:</h4>
          <div className="game__mission-track">
            {state.missionResults.map((success, idx) => (
              <span key={idx} className={success ? 'game__track-success' : 'game__track-fail'}>
                {success ? '✅' : '❌'}
              </span>
            ))}
          </div>
          <p>Team Successes: {successes} | Sabotage Successes: {state.missionResults.length - successes}</p>

          <h4>The Saboteurs Were:</h4>
          <div className="game__saboteurs-reveal">
            {state.saboteurs.map(id => {
              const player = players.find(p => p.id === id);
              return <div key={id} className="game__saboteur-name">😈 {player?.name}</div>;
            })}
          </div>

          <h4>Final Scores:</h4>
          {players
            .sort((a, b) => b.score - a.score)
            .map((player, index) => {
              const isSaboteur = state.saboteurs.includes(player.id);
              return (
                <div key={player.id} className="game__score-item">
                  <span className="game__rank">#{index + 1}</span>
                  <span className="game__player-name">
                    {player.name} {isSaboteur ? '😈' : '👮'}
                  </span>
                  <span className="game__player-score">{player.score} pts</span>
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
