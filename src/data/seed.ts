import type { Fan, GameMode, GameRecord, Seat, TicketOrder } from '../types';
import { matchSeat } from '../domain/seatMatch';

const seatsFrom = (section: string, row: string, first: number, last: number): Seat[] =>
  Array.from({ length: last - first + 1 }, (_, i) => ({ section, row, seat: String(first + i) }));

const emailFor = (name: string) => `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`;

function order(id: string, holderName: string, section: string, row: string, first: number, last: number, holderSeatNo = first): TicketOrder {
  const seats = seatsFrom(section, row, first, last);
  return { id, holderName, holderEmail: emailFor(holderName), holderSeat: seats.find((s) => s.seat === String(holderSeatNo))!, seats };
}

/** Fake ticketing data: who owns which seats tonight. The first order holds the seat-QR seat. */
export const orders: TicketOrder[] = [
  order('ord-112-F', 'Dana Whitfield', '112', 'F', 4, 7),
  order('ord-101-A', 'Marcus Bell', '101', 'A', 1, 2),
  order('ord-101-C', 'Priya Natarajan', '101', 'C', 5, 8),
  order('ord-104-B', 'Gus Holloway', '104', 'B', 10, 13),
  order('ord-104-E', 'Leah Moreno', '104', 'E', 1, 3),
  order('ord-112-B', 'Ken Okafor', '112', 'B', 8, 9),
  order('ord-112-H', 'Rosa Lindqvist', '112', 'H', 2, 5),
  order('ord-118-A', 'Tom Fairbanks', '118', 'A', 3, 6),
  order('ord-118-D', 'Aisha Grant', '118', 'D', 11, 12),
  order('ord-118-G', 'Ben Castillo', '118', 'G', 6, 9),
  order('ord-203-C', 'Nora Pike', '203', 'C', 1, 4),
  order('ord-203-F', 'Eli Brandt', '203', 'F', 7, 8),
  order('ord-210-A', 'Maya Chen', '210', 'A', 9, 12),
  order('ord-210-D', 'Sam Ortega', '210', 'D', 2, 3),
  order('ord-210-H', 'Ivy Collins', '210', 'H', 5, 7),
  order('ord-101-G', 'Raj Patel', '101', 'G', 13, 14),
];

/** The seat the "scan the code on your seat" button lands on: a guest seat in Dana Whitfield's order. */
export const qrSeat: Seat = { section: '112', row: 'F', seat: '6' };

const FIRST = ['Alex', 'Jamie', 'Casey', 'Riley', 'Morgan', 'Taylor', 'Jordan', 'Avery', 'Quinn', 'Drew', 'Parker', 'Reese', 'Skyler', 'Hayden', 'Rowan', 'Emerson', 'Logan', 'Sasha', 'Blake', 'Cameron', 'Devon', 'Frankie', 'Kendall', 'Shawn'];
const LAST = ['Abbott', 'Brooks', 'Carver', 'Dalton', 'Ellison', 'Foster', 'Gibbs', 'Harlow', 'Ingram', 'Jensen', 'Keller', 'Lowry', 'Mercer', 'Nolan', 'Oakley', 'Prescott', 'Quill', 'Rhodes', 'Sutton', 'Tate', 'Underwood', 'Vance', 'Whitaker', 'Yates'];
const OPPONENTS = ['Bay Point Pilots', 'Iron Valley Miners', 'Northgate Owls', 'Cedar Falls Lumberjacks', 'Ridgeline Foxes'];
const DATES = ['Oct 4', 'Oct 18', 'Nov 1', 'Nov 15', 'Nov 29'];
const MODES: GameMode[] = ['prediction', 'trivia', 'bingo'];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function history(rng: () => number, games: number): GameRecord[] {
  return Array.from({ length: games }, (_, i) => ({
    gameId: `g-${i + 1}`,
    date: DATES[i],
    opponent: OPPONENTS[i],
    points: 40 + Math.floor(rng() * 33) * 5,
  }));
}

/**
 * A believable crowd of earlier sign-ups. Every order holder signs up, then one guest from each of the
 * first 12 orders, then a few fans whose seat matched no order and a few who gave no seat.
 * Deterministic for a given seed.
 */
export function generateCrowd(orders: TicketOrder[], count: number, seed: number): Fan[] {
  const rng = mulberry32(seed);
  const seats: (Seat | null)[] = [];
  for (const o of orders) seats.push(o.holderSeat);
  for (const o of orders.slice(0, 12)) seats.push(o.seats.find((s) => s !== o.holderSeat)!);
  const sections = [...new Set(orders.map((o) => o.holderSeat.section))];
  while (seats.length < count - 4) seats.push({ section: sections[seats.length % sections.length], row: 'K', seat: String(20 + seats.length) });
  while (seats.length < count) seats.push(null);

  // Sign-up order is shuffled so the newest rows on the dashboard look like a real mix of fans.
  const order = Array.from({ length: count }, (_, i) => i + 1);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const used = new Set<string>();
  return seats.slice(0, count).map((seat, i) => {
    const link = matchSeat(orders, seat);
    let name: string;
    if (link.kind === 'holder') name = orders.find((o) => o.id === link.orderId)!.holderName;
    else {
      do name = `${FIRST[Math.floor(rng() * FIRST.length)]} ${LAST[Math.floor(rng() * LAST.length)]}`;
      while (used.has(name));
    }
    used.add(name);
    const plays = MODES.filter(() => rng() < 0.6);
    return {
      id: `fan-${i + 1}`,
      name,
      email: emailFor(name),
      seat,
      link,
      signupOrder: order[i],
      signupBreakId: null,
      gamePoints: 25 + Math.floor(rng() * 45) * 5,
      plays,
      seasonHistory: history(rng, Math.floor(rng() * 5)),
      isPresenter: false,
    };
  });
}

export const RETURNING_FAN_ID = 'fan-returning';

/** The crowd plus one returning fan with a full season of history, for the profile walkthrough. */
export function seedFans(): Fan[] {
  const crowd = generateCrowd(orders, 36, 7);
  const seat: Seat = { section: '104', row: 'B', seat: '12' };
  const returning: Fan = {
    id: RETURNING_FAN_ID,
    name: 'Jordan Reyes',
    email: emailFor('Jordan Reyes'),
    seat,
    link: matchSeat(orders, seat),
    signupOrder: 0,
    signupBreakId: null,
    gamePoints: 120,
    plays: ['prediction', 'trivia'],
    seasonHistory: [
      { gameId: 'g-1', date: DATES[0], opponent: OPPONENTS[0], points: 140 },
      { gameId: 'g-2', date: DATES[1], opponent: OPPONENTS[1], points: 95 },
      { gameId: 'g-3', date: DATES[2], opponent: OPPONENTS[2], points: 210 },
      { gameId: 'g-4', date: DATES[3], opponent: OPPONENTS[3], points: 165 },
      { gameId: 'g-5', date: DATES[4], opponent: OPPONENTS[4], points: 180 },
    ],
    isPresenter: false,
  };
  return [...crowd, returning];
}
