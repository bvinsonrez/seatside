import type { ContentPack } from '../types';

export const SPONSOR_SQUARE_ID = 'sponsor-free';

/**
 * 3 by 3 card, row-major, sponsor free square in the center. Five squares come from the scripted plays
 * and three never get marked, laid out so a full run of plays completes exactly two lines
 * (left column and one diagonal) instead of a blackout.
 */
export function buildCard(pack: ContentPack): string[] {
  const played = [...new Set(pack.events.flatMap((e) => e.bingoSquareIds))];
  const quiet = pack.bingoSquares.map((b) => b.id).filter((id) => !played.includes(id));
  const [e0, e1, e2, e3, e4] = played;
  const [n0, n1, n2] = quiet;
  return [e0, e1, n0, e2, SPONSOR_SQUARE_ID, n1, e3, n2, e4];
}

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function completedLines(card: string[], marked: Set<string>): number {
  const on = (i: number) => card[i] === SPONSOR_SQUARE_ID || marked.has(card[i]);
  return LINES.filter((line) => line.every(on)).length;
}
