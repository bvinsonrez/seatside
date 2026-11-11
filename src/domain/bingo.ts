import type { ContentPack } from '../types';

export const SPONSOR_SQUARE_ID = 'sponsor-free';

/** 3 by 3 card, row-major. The center is the sponsor's free square. */
export function buildCard(pack: ContentPack): string[] {
  const ids = pack.bingoSquares.slice(0, 8).map((b) => b.id);
  return [...ids.slice(0, 4), SPONSOR_SQUARE_ID, ...ids.slice(4)];
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
