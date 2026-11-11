import type { BreakSlot, Fan } from '../types';
import type { DemoState } from './reducer';
import { seasonPoints } from '../domain/scoring';

export const currentFan = (s: DemoState): Fan | null => s.fans.find((f) => f.id === s.currentFanId) ?? null;

export const activeBreak = (s: DemoState): BreakSlot | null => (s.activeBreakIndex >= 0 ? s.pack.breaks[s.activeBreakIndex] : null);

export function identityHeadline(s: DemoState) {
  return {
    signedUp: s.fans.length,
    shadowFans: s.fans.filter((f) => f.link.kind !== 'holder').length,
    seatMatched: s.fans.filter((f) => f.link.kind === 'seat-match').length,
    noSeat: s.fans.filter((f) => f.link.kind === 'no-seat').length,
  };
}

/** Tonight's points by section. Fans who gave no seat don't count toward any section. */
export function sectionStandings(s: DemoState): { section: string; points: number; fans: number }[] {
  const by = new Map<string, { section: string; points: number; fans: number }>();
  for (const f of s.fans) {
    if (!f.seat) continue;
    const row = by.get(f.seat.section) ?? { section: f.seat.section, points: 0, fans: 0 };
    row.points += f.gamePoints;
    row.fans += 1;
    by.set(f.seat.section, row);
  }
  return [...by.values()].sort((a, b) => b.points - a.points || a.section.localeCompare(b.section));
}

export const overallLeaderboard = (s: DemoState) =>
  s.fans.map((fan) => ({ fan, points: seasonPoints(fan) })).sort((a, b) => b.points - a.points);

export const tonightLeaderboard = (s: DemoState) =>
  s.fans.map((fan) => ({ fan, points: fan.gamePoints })).sort((a, b) => b.points - a.points);

const orderIdOf = (f: Fan): string | null => (f.link.kind === 'holder' || f.link.kind === 'seat-match' ? f.link.orderId : null);

/** Everyone who signed up from the same ticket order as this fan, including the fan. */
export function crewFor(s: DemoState, fanId: string): Fan[] {
  const me = s.fans.find((f) => f.id === fanId);
  const orderId = me ? orderIdOf(me) : null;
  if (!orderId) return [];
  return s.fans.filter((f) => orderIdOf(f) === orderId);
}

export const fansNewestFirst = (s: DemoState): Fan[] => [...s.fans].sort((a, b) => b.signupOrder - a.signupOrder);
