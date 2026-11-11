import { initialState, reducer, type Action, type DemoState } from '../src/state/reducer';
import { currentFan, identityHeadline } from '../src/state/selectors';
import { qrSeat, RETURNING_FAN_ID } from '../src/data/seed';
import { packs } from '../src/content';
import { buildCard, completedLines } from '../src/domain/bingo';

const run = (s: DemoState, ...a: Action[]) => a.reduce(reducer, s);
const join: Action = { type: 'signUp', name: 'Pat Demo', email: 'pat@example.com', seat: qrSeat };
const fan = (s: DemoState, id: string) => s.fans.find((f) => f.id === id)!;

describe('viewing the returning fan mid-game', () => {
  test('a locked prediction still pays the presenter fan, not the returning fan', () => {
    const s0 = run(initialState(), join, { type: 'openNextBreak' }, { type: 'lockPrediction', choice: initialState().pack.events[0].predictionOutcome! });
    const me = s0.currentFanId!;
    const s = run(s0, { type: 'viewAsFan', fanId: RETURNING_FAN_ID }, { type: 'fireNextEvent' });
    expect(fan(s, RETURNING_FAN_ID).gamePoints).toBe(fan(s0, RETURNING_FAN_ID).gamePoints);
    expect(fan(s, me).gamePoints).toBe(25 + 50);
  });

  test('the returning fan cannot play the presenter fan\'s games', () => {
    const s0 = run(initialState(), join, { type: 'openNextBreak' }, { type: 'viewAsFan', fanId: RETURNING_FAN_ID });
    expect(reducer(s0, { type: 'lockPrediction', choice: 'Goal' })).toBe(s0);
  });

  test('switching back returns to the presenter fan', () => {
    const s0 = run(initialState(), join);
    const me = s0.currentFanId!;
    const s = run(s0, { type: 'viewAsFan', fanId: RETURNING_FAN_ID }, { type: 'viewAsFan', fanId: s0.presenterFanId! });
    expect(s.currentFanId).toBe(me);
  });

  test('redeemed rewards belong to the fan who redeemed them', () => {
    const s0 = run(initialState(), join);
    const r = s0.rewards[0];
    const s = run(s0, { type: 'viewAsFan', fanId: RETURNING_FAN_ID }, { type: 'redeemReward', rewardId: r.id });
    expect(s.play.redeemed[RETURNING_FAN_ID]).toEqual([r.id]);
    expect(s.play.redeemed[s0.currentFanId!] ?? []).toEqual([]);
  });
});

test('shadow fans counts seat-match sign-ups only', () => {
  const s = initialState();
  const h = identityHeadline(s);
  expect(h.shadowFans).toBe(s.fans.filter((f) => f.link.kind === 'seat-match').length);
  expect(h.unlinked).toBe(s.fans.filter((f) => f.link.kind === 'no-match' || f.link.kind === 'no-seat').length);
  expect(h.holders + h.shadowFans + h.unlinked).toBe(h.signedUp);
});

describe.each(Object.values(packs))('bingo card for $sport', (pack) => {
  test('the card mixes in squares no scripted play marks', () => {
    const eventSquares = new Set(pack.events.flatMap((e) => e.bingoSquareIds));
    const card = buildCard(pack);
    expect(card.filter((id) => id !== 'sponsor-free' && !eventSquares.has(id)).length).toBe(3);
  });
  test('running every play completes exactly 2 lines', () => {
    const marked = new Set(pack.events.flatMap((e) => e.bingoSquareIds));
    expect(completedLines(buildCard(pack), marked)).toBe(2);
  });
});
