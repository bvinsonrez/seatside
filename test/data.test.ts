import { packs } from '../src/content';
import { sponsors, rewards } from '../src/data/sponsors';
import { orders, qrSeat, generateCrowd, seedFans, RETURNING_FAN_ID } from '../src/data/seed';
import type { Seat } from '../src/types';

const key = (s: Seat) => `${s.section}|${s.row}|${s.seat}`;
const sponsorIds = new Set(sponsors.map((s) => s.id));

describe.each(Object.values(packs))('content pack $sport', (pack) => {
  test('every break sponsorId exists in sponsors', () => {
    for (const b of pack.breaks) expect(sponsorIds.has(b.sponsorId)).toBe(true);
  });
  test('every event bingoSquareId exists in the pack', () => {
    const ids = new Set(pack.bingoSquares.map((b) => b.id));
    for (const e of pack.events) for (const id of e.bingoSquareIds) expect(ids.has(id)).toBe(true);
  });
  test('every predictionOutcome is one of predictionOptions', () => {
    for (const e of pack.events) if (e.predictionOutcome !== null) expect(pack.predictionOptions).toContain(e.predictionOutcome);
  });
  test('every trivia answerIndex is in range', () => {
    for (const q of pack.trivia) {
      expect(q.answerIndex).toBeGreaterThanOrEqual(0);
      expect(q.answerIndex).toBeLessThan(q.choices.length);
    }
  });
  test('pack has the planned sizes', () => {
    expect(pack.trivia.length).toBeGreaterThanOrEqual(6);
    expect(pack.bingoSquares.length).toBe(12);
    expect(pack.predictionOptions.length).toBe(4);
    expect(pack.breaks.map((b) => b.mode).sort()).toEqual(['bingo', 'prediction', 'trivia']);
    expect(new Set(pack.breaks.map((b) => b.sponsorId)).size).toBe(3);
    expect(pack.events.length).toBe(8);
  });
});

test('every reward sponsorId exists', () => {
  for (const r of rewards) expect(sponsorIds.has(r.sponsorId)).toBe(true);
  expect(rewards.map((r) => r.unlockAt)).toEqual([100, 250, 500, 1000]);
});

test('no seat appears in two orders', () => {
  const seen = new Set<string>();
  for (const o of orders) for (const s of o.seats) {
    expect(seen.has(key(s))).toBe(false);
    seen.add(key(s));
  }
});

test("each order's seats include its holderSeat", () => {
  for (const o of orders) expect(o.seats.map(key)).toContain(key(o.holderSeat));
});

test("qrSeat is in exactly one order and is not that order's holderSeat", () => {
  const hits = orders.filter((o) => o.seats.some((s) => key(s) === key(qrSeat)));
  expect(hits).toHaveLength(1);
  expect(key(hits[0].holderSeat)).not.toBe(key(qrSeat));
});

test('generateCrowd is deterministic', () => {
  expect(generateCrowd(orders, 36, 7)).toEqual(generateCrowd(orders, 36, 7));
});

test('crowd covers at least 5 sections and includes holder, seat-match, and no-seat links', () => {
  const crowd = generateCrowd(orders, 36, 7);
  expect(crowd).toHaveLength(36);
  const sections = new Set(crowd.filter((f) => f.seat).map((f) => f.seat!.section));
  expect(sections.size).toBeGreaterThanOrEqual(5);
  const kinds = new Set(crowd.map((f) => f.link.kind));
  for (const k of ['holder', 'seat-match', 'no-seat']) expect(kinds.has(k as never)).toBe(true);
  expect(crowd.every((f) => !f.isPresenter)).toBe(true);
});

test("the qrSeat order's holder and one guest are in seedFans()", () => {
  const order = orders.find((o) => o.seats.some((s) => key(s) === key(qrSeat)))!;
  const fans = seedFans();
  const inOrder = fans.filter((f) => f.link.kind !== 'no-match' && f.link.kind !== 'no-seat' && f.link.orderId === order.id);
  expect(inOrder.some((f) => f.link.kind === 'holder')).toBe(true);
  expect(inOrder.some((f) => f.link.kind === 'seat-match')).toBe(true);
  expect(fans.some((f) => f.seat && key(f.seat) === key(qrSeat))).toBe(false);
});

test('returning fan has 5 seasonHistory records', () => {
  const fan = seedFans().find((f) => f.id === RETURNING_FAN_ID)!;
  expect(fan.seasonHistory).toHaveLength(5);
});

test('all emails end with @example.com', () => {
  for (const f of seedFans()) expect(f.email.endsWith('@example.com')).toBe(true);
  for (const o of orders) expect(o.holderEmail.endsWith('@example.com')).toBe(true);
});

test('seat links in the crowd match the order data', () => {
  for (const f of seedFans()) {
    if (f.link.kind === 'holder') {
      const o = orders.find((x) => x.id === (f.link as { orderId: string }).orderId)!;
      expect(key(o.holderSeat)).toBe(key(f.seat!));
    }
    if (f.link.kind === 'no-seat') expect(f.seat).toBeNull();
  }
});

test('both sport packs are registered', () => {
  expect(Object.keys(packs).sort()).toEqual(['basketball', 'hockey']);
});

test('the newest seeded sign-ups mix link kinds', () => {
  const newest = [...seedFans()].sort((a, b) => b.signupOrder - a.signupOrder).slice(0, 8);
  const kinds = new Set(newest.map((f) => f.link.kind));
  expect(kinds.has('seat-match')).toBe(true);
  expect(kinds.has('holder')).toBe(true);
});
