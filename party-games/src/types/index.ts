// Player types
export interface Player {
  id: number;
  name: string;
  score: number;
}

// Game types
export type GameType = 'secret-artist' | 'story-remix' | 'fact-fiction' | 'mission-mayhem';

export interface GameInfo {
  id: GameType;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  icon: string;
}

// App state
export type AppScreen = 'menu' | 'player-setup' | 'game-select' | 'game';

export interface AppState {
  screen: AppScreen;
  players: Player[];
  selectedGame: GameType | null;
  gameState: any;
}

// Secret Artist types
export interface SecretArtistState {
  phase: 'setup' | 'drawing' | 'voting' | 'reveal' | 'end';
  prompt: string;
  secretArtistId: number;
  drawings: { [playerId: number]: string };
  currentDrawer: number | null;
  votes: { [voterId: number]: number };
  round: number;
  maxRounds: number;
}

// Story Remix types
export interface StoryRemixState {
  phase: 'writing' | 'reading' | 'voting' | 'end';
  story: StorySegment[];
  currentWriter: number | null;
  submissions: { [playerId: number]: string };
  round: number;
  maxRounds: number;
  favoriteVotes: { [voterId: number]: number };
}

export interface StorySegment {
  playerId: number;
  text: string;
  round: number;
}

// Fact or Fiction types
export interface FactFictionState {
  phase: 'submission' | 'guessing' | 'reveal' | 'end';
  currentSubject: number | null;
  facts: { [playerId: number]: FactSubmission[] };
  guesses: { [guesserId: number]: { [factId: string]: boolean } };
  round: number;
  maxRounds: number;
}

export interface FactSubmission {
  id: string;
  text: string;
  isTrue: boolean;
}

// Mission Mayhem types
export interface MissionMayhemState {
  phase: 'team-select' | 'mission-vote' | 'mission-action' | 'reveal' | 'end';
  teamLeader: number;
  proposedTeam: number[];
  missionVotes: { [playerId: number]: boolean };
  saboteurs: number[];
  missionResults: boolean[];
  actionSubmissions: { [playerId: number]: 'success' | 'fail' };
  round: number;
  maxRounds: number;
  teamSize: number;
}
