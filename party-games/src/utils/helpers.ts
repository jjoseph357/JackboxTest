import type { Player } from '../types';

// Generate player names if not provided
export const generatePlayers = (count: number, existingPlayers: Player[] = []): Player[] => {
  const players: Player[] = [...existingPlayers];

  for (let i = existingPlayers.length; i < count; i++) {
    players.push({
      id: i,
      name: `Player ${i + 1}`,
      score: 0,
    });
  }

  return players.slice(0, count);
};

// Shuffle array
export const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Get random item from array
export const randomItem = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Get random items from array (without duplicates)
export const randomItems = <T,>(array: T[], count: number): T[] => {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(count, array.length));
};

// Generate unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Format player list for display
export const formatPlayerList = (players: Player[], playerIds: number[]): string => {
  return playerIds
    .map(id => players.find(p => p.id === id)?.name || 'Unknown')
    .join(', ');
};

// Calculate team size for Mission Mayhem based on player count and round
export const getMissionTeamSize = (playerCount: number, round: number): number => {
  const teamSizes: { [key: number]: number[] } = {
    5: [2, 3, 2, 3, 3],
    6: [2, 3, 4, 3, 4],
    7: [2, 3, 3, 4, 4],
    8: [3, 4, 4, 5, 5],
    9: [3, 4, 4, 5, 5],
    10: [3, 4, 4, 5, 5],
    11: [3, 4, 4, 5, 5],
    12: [3, 4, 4, 5, 5],
    13: [3, 4, 4, 5, 5],
    14: [3, 4, 4, 5, 5],
    15: [3, 4, 4, 5, 5],
    16: [3, 4, 4, 5, 5],
  };

  const sizes = teamSizes[playerCount] || teamSizes[10];
  return sizes[round] || sizes[0];
};

// Calculate number of saboteurs for Mission Mayhem
export const getSaboteurCount = (playerCount: number): number => {
  if (playerCount <= 6) return 2;
  if (playerCount <= 9) return 3;
  return 4;
};
