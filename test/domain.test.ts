import { matchSeat, normalizeSeat } from '../src/domain/seatMatch';
import { levelFor, tierFor, seasonPoints } from '../src/domain/scoring';
import { buildCard, completedLines, SPONSOR_SQUARE_ID } from '../src/domain/bingo';
import { orders } from '../src/data/seed';
import { hockey } from '../src/content/hockey';
import type { Fan } from '../src/types';

const dana = orders.find((o) => o.id === 'ord-112-F')!;

describe('matchSeat', () => {
  test('holder seat', () => {
    expect(matchSeat(orders, dana.holderSeat)).toEqual({ kind: 'holder', orderId: 'ord-112-F' });
  });
  test('guest seat', () => {
    expect(matchSeat(orders, { section: '112', row: 'F', seat: '6' })).toEqual({ kind: 'seat-match', orderId: 'ord-112-F', holderName: 'Dana Whitfield' });
  });
  test('unknown seat', () => {
    expect(matchSeat(orders, { section: '999', row: 'Z', seat: '1' })).toEqual({ kind: 'no-match' });
  });
  test('null seat', () => {
    expect(matchSeat(orders, null)).toEqual({ kind: 'no-seat' });
  });
  test('normalizes whitespace and case', () => {
    expect(matchSeat(orders, { section: ' 112 ', row: 'f', seat: '06' })).toEqual(matchSeat(orders, { section: '112', row: 'F', seat: '6' }));
    expect(normalizeSeat({ section: ' 0112', row: ' f ', seat: '06 ' })).toEqual({ section: '112', row: 'F', seat: '6' });
  });
  test('matchSeat with any blank field is no-seat', () => {
    expect(matchSeat(orders, { section: '112', row: ' ', seat: '6' })).toEqual({ kind: 'no-seat' });
  });
});

describe('scoring', () => {
  test('levels', () => {
    expect(levelFor(0)).toBe(1);
    expect(levelFor(249)).toBe(1);
    expect(levelFor(250)).toBe(2);
  });
  test('tiers', () => {
    expect(tierFor(2)).toBe('Rookie');
    expect(tierFor(3)).toBe('Regular');
    expect(tierFor(9)).toBe('Veteran');
    expect(tierFor(10)).toBe('Legend');
  });
  test('seasonPoints sums history and tonight', () => {
    const fan = { gamePoints: 30, seasonHistory: [{ points: 100 }, { points: 20 }] } as unknown as Fan;
    expect(seasonPoints(fan)).toBe(150);
  });
});

describe('bingo', () => {
  const card = buildCard(hockey);
  test('card has 9 squares with sponsor in the center', () => {
    expect(card).toHaveLength(9);
    expect(card[4]).toBe(SPONSOR_SQUARE_ID);
    expect(new Set(card).size).toBe(9);
    for (const id of card) if (id !== SPONSOR_SQUARE_ID) expect(hockey.bingoSquares.map((b) => b.id)).toContain(id);
  });
  test('completedLines counts lines with the sponsor square free', () => {
    expect(completedLines(card, new Set())).toBe(0);
    expect(completedLines(card, new Set([card[3], card[5]]))).toBe(1);
    expect(completedLines(card, new Set([card[3], card[5], card[1], card[7]]))).toBe(2);
  });
});
