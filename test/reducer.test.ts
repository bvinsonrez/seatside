import { initialState, reducer, type DemoState, type Action } from '../src/state/reducer';
import { identityHeadline, sectionStandings, fansNewestFirst, currentFan } from '../src/state/selectors';
import { qrSeat, orders } from '../src/data/seed';
import { SPONSOR_SQUARE_ID } from '../src/domain/bingo';

const run = (s: DemoState, ...actions: Action[]) => actions.reduce(reducer, s);
const join = (seat = qrSeat as typeof qrSeat | null): Action => ({ type: 'signUp', name: 'Pat Demo', email: 'pat@example.com', seat });
const dana = orders.find((o) => o.id === 'ord-112-F')!;

test('signUp with qrSeat links as seat-match to the order holder and sets highlightFanId', () => {
  const before = identityHeadline(initialState());
  const s = run(initialState(), join());
  const fan = currentFan(s)!;
  expect(fan.link).toEqual({ kind: 'seat-match', orderId: 'ord-112-F', holderName: 'Dana Whitfield' });
  expect(fan.isPresenter).toBe(true);
  expect(fan.gamePoints).toBe(25);
  expect(s.highlightFanId).toBe(fan.id);
  expect(identityHeadline(s).shadowFans).toBe(before.shadowFans + 1);
  expect(identityHeadline(s).holders).toBe(before.holders);
});

test('signUp from holder seat', () => {
  const before = identityHeadline(initialState()).shadowFans;
  const s = run(initialState(), join(dana.holderSeat));
  expect(currentFan(s)!.link.kind).toBe('holder');
  expect(identityHeadline(s).shadowFans).toBe(before);
});

test('signUp with no seat', () => {
  const s0 = initialState();
  const totals = sectionStandings(s0).reduce((n, r) => n + r.fans, 0);
  const s = run(s0, join(null));
  expect(currentFan(s)!.link.kind).toBe('no-seat');
  expect(currentFan(s)!.seat).toBeNull();
  expect(fansNewestFirst(s)[0].id).toBe(s.currentFanId);
  expect(sectionStandings(s).reduce((n, r) => n + r.fans, 0)).toBe(totals);
});

test('signUp with a partly filled seat is no-seat', () => {
  const s = run(initialState(), join({ section: '112', row: '', seat: '' }));
  expect(currentFan(s)!.link.kind).toBe('no-seat');
  expect(currentFan(s)!.seat).toBeNull();
});

test('signUp during an open break adds 1 to that break\'s signups', () => {
  const s = run(initialState(), { type: 'openNextBreak' }, join());
  expect(s.activation['brk-1'].signups).toBe(initialState().activation['brk-1'].signups + 1);
  expect(currentFan(s)!.signupBreakId).toBe('brk-1');
});

test('lockPrediction then fireNextEvent with matching outcome adds 50 and result correct', () => {
  const s0 = initialState();
  const outcome = s0.pack.events[0].predictionOutcome!;
  const s = run(s0, join(), { type: 'openNextBreak' }, { type: 'lockPrediction', choice: outcome }, { type: 'fireNextEvent' });
  expect(s.play.prediction!.result).toBe('correct');
  expect(currentFan(s)!.gamePoints).toBe(25 + 50);
  expect(currentFan(s)!.plays).toContain('prediction');
  expect(s.activation['brk-1'].plays).toBe(s0.activation['brk-1'].plays + 1);
});

test('wrong prediction scores nothing', () => {
  const s0 = initialState();
  const wrong = s0.pack.predictionOptions.find((o) => o !== s0.pack.events[0].predictionOutcome)!;
  const s = run(s0, join(), { type: 'openNextBreak' }, { type: 'lockPrediction', choice: wrong }, { type: 'fireNextEvent' });
  expect(s.play.prediction!.result).toBe('incorrect');
  expect(currentFan(s)!.gamePoints).toBe(25);
});

test('fireNextEvent with no locked prediction', () => {
  const s0 = run(initialState(), join());
  const s = reducer(s0, { type: 'fireNextEvent' });
  expect(currentFan(s)!.gamePoints).toBe(25);
  expect(s.eventIndex).toBe(1);
  expect(s.lastEventLabel).toBe(s0.pack.events[0].label);
});

test('fireNextEvent past end is a no-op', () => {
  let s = initialState();
  for (let i = 0; i < s.pack.events.length; i++) s = reducer(s, { type: 'fireNextEvent' });
  expect(reducer(s, { type: 'fireNextEvent' })).toBe(s);
});

test('openNextBreak past the last break is a no-op', () => {
  let s = initialState();
  for (let i = 0; i < s.pack.breaks.length; i++) s = reducer(s, { type: 'openNextBreak' });
  expect(reducer(s, { type: 'openNextBreak' })).toBe(s);
});

test('completeTrivia twice for the same break only scores once', () => {
  const s = run(initialState(), join(), { type: 'openNextBreak' }, { type: 'openNextBreak' },
    { type: 'completeTrivia', correctCount: 3 }, { type: 'completeTrivia', correctCount: 3 });
  expect(currentFan(s)!.gamePoints).toBe(25 + 60);
});

test('completeTrivia outside a trivia break is a no-op', () => {
  const s0 = run(initialState(), join(), { type: 'openNextBreak' });
  expect(reducer(s0, { type: 'completeTrivia', correctCount: 3 })).toBe(s0);
});

test('bingo line awarded once', () => {
  let s = run(initialState(), join(), { type: 'openNextBreak' }, { type: 'openNextBreak' }, { type: 'openNextBreak' }, { type: 'joinBingo' });
  // middle row = card[3], sponsor, card[5]; fire every event and count lines awarded
  for (let i = 0; i < s.pack.events.length; i++) s = reducer(s, { type: 'fireNextEvent' });
  const lines = s.play.bingoLinesAwarded;
  expect(lines).toBeGreaterThan(0);
  expect(currentFan(s)!.gamePoints).toBe(25 + lines * 100);
  expect(s.play.bingoCard[4]).toBe(SPONSOR_SQUARE_ID);
});

test('bingo points need the fan to have joined bingo', () => {
  let s = run(initialState(), join());
  for (let i = 0; i < s.pack.events.length; i++) s = reducer(s, { type: 'fireNextEvent' });
  expect(currentFan(s)!.gamePoints).toBe(25);
  expect(s.play.bingoMarked.length).toBeGreaterThan(0);
});

test('redeemReward below unlockAt is a no-op', () => {
  const s0 = run(initialState(), join());
  const big = s0.rewards[s0.rewards.length - 1];
  expect(reducer(s0, { type: 'redeemReward', rewardId: big.id })).toBe(s0);
});

test('redeemReward twice counts one redemption', () => {
  const s0 = run(initialState(), { type: 'viewAsFan', fanId: 'fan-returning' });
  const r = s0.rewards[0];
  const s = run(s0, { type: 'redeemReward', rewardId: r.id }, { type: 'redeemReward', rewardId: r.id });
  expect(s.play.redeemed['fan-returning']).toEqual([r.id]);
  const total = (st: DemoState) => Object.values(st.activation).reduce((n, a) => n + a.redemptions, 0);
  expect(total(s)).toBe(total(s0) + 1);
});

test('actions that need a fan are no-ops before sign-up', () => {
  const s0 = run(initialState(), { type: 'openNextBreak' });
  expect(reducer(s0, { type: 'lockPrediction', choice: 'Goal' })).toBe(s0);
});

test('reset returns a state deep-equal to initialState(sport)', () => {
  const s = run(initialState(), join(), { type: 'openNextBreak' }, { type: 'fireNextEvent' }, { type: 'endGame' }, { type: 'reset' });
  expect(s).toEqual(initialState('hockey'));
});
