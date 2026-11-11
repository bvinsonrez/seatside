import type { Fan } from '../types';

export const SIGNUP_BONUS = 25;
export const PREDICTION_POINTS = 50;
export const TRIVIA_POINTS_PER_CORRECT = 20;
export const BINGO_LINE_POINTS = 100;

export type Tier = 'Rookie' | 'Regular' | 'Veteran' | 'Legend';

export const levelFor = (seasonPoints: number): number => Math.floor(seasonPoints / 250) + 1;

export function tierFor(level: number): Tier {
  if (level >= 10) return 'Legend';
  if (level >= 6) return 'Veteran';
  if (level >= 3) return 'Regular';
  return 'Rookie';
}

export const seasonPoints = (fan: Fan): number => fan.seasonHistory.reduce((sum, g) => sum + g.points, 0) + fan.gamePoints;
