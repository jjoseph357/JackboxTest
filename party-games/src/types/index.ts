// Player types
export interface Player {
  id: number;
  name: string;
  score: number;
}

// Game types
export type GameType = 'secret-artist' | 'story-remix' | 'fact-fiction' | 'mission-mayhem' | 'rps-br';

export interface GameInfo {
  id: GameType;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  icon: string;
  defaultRounds?: number;
}

// App state
export type AppScreen = 'menu' | 'player-setup' | 'game-select' | 'round-select' | 'modifiers-select' | 'game';

export interface AppState {
  screen: AppScreen;
  players: Player[];
  selectedGame: GameType | null;
  maxRounds: number;
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

// Rock Paper Scissors BR types
export type RPSChoice = 'rock' | 'paper' | 'scissors';

export interface RPSModifiers {
  growthFood: boolean;
  movingFood: boolean;
  bullets: boolean;
  speedBoost: boolean;
  respawns: boolean;
  respawnCount: number;
}

export interface RPSObject {
  id: string;
  playerId: number;
  type: RPSChoice;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  alive: boolean;
  kills: number;
  speedBoost: number;
  respawnsLeft: number;
}

export interface FoodParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  growth: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

export interface RPSBRState {
  phase: 'placement' | 'ready-to-battle' | 'battle' | 'round-end' | 'game-end';
  tournamentRound: number;
  activePlayers: number[];
  eliminatedPlayers: { playerId: number; placement: number }[];
  objects: RPSObject[];
  placements: { [playerId: number]: { type: RPSChoice; x: number; y: number } };
  currentPlacer: number | null;
  battleTime: number;
  playerStats: { [playerId: number]: { kills: number; roundsWon: number; respawnsUsed: number } };
  foodParticles: FoodParticle[];
  bullets: Bullet[];
  modifiers: RPSModifiers;
}
