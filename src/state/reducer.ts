import type { BreakSlot, ContentPack, Fan, GameMode, Reward, Seat, SportId, Sponsor, TeamConfig, TicketOrder } from '../types';
import { packs } from '../content';
import { teamConfig } from '../config/team';
import { sponsors, rewards } from '../data/sponsors';
import { orders, seedFans } from '../data/seed';
import { matchSeat, normalizeSeat } from '../domain/seatMatch';
import { buildCard, completedLines } from '../domain/bingo';
import { BINGO_LINE_POINTS, PREDICTION_POINTS, SIGNUP_BONUS, TRIVIA_POINTS_PER_CORRECT, seasonPoints } from '../domain/scoring';

export interface ActivationStats { plays: number; signups: number; redemptions: number }

export interface PresenterPlay {
  prediction: { choice: string; breakId: string; result: 'pending' | 'correct' | 'incorrect' } | null;
  bingoCard: string[];
  bingoMarked: string[];
  bingoJoined: boolean;
  bingoLinesAwarded: number;
  triviaDoneBreakIds: string[];
  redeemed: string[];
}

export interface DemoState {
  sport: SportId;
  pack: ContentPack;
  config: TeamConfig;
  orders: TicketOrder[];
  sponsors: Sponsor[];
  rewards: Reward[];
  fans: Fan[];
  currentFanId: string | null;
  activeBreakIndex: number;
  eventIndex: number;
  lastEventLabel: string | null;
  gameOver: boolean;
  play: PresenterPlay;
  activation: Record<string, ActivationStats>;
  highlightFanId: string | null;
}

export type Action =
  | { type: 'signUp'; name: string; email: string; seat: Seat | null }
  | { type: 'openNextBreak' }
  | { type: 'fireNextEvent' }
  | { type: 'endGame' }
  | { type: 'lockPrediction'; choice: string }
  | { type: 'completeTrivia'; correctCount: number }
  | { type: 'joinBingo' }
  | { type: 'redeemReward'; rewardId: string }
  | { type: 'viewAsFan'; fanId: string }
  | { type: 'switchSport'; sport: SportId }
  | { type: 'reset' };

export const SECTION_BATTLE = 'section-battle';

/** Baselines come from the seeded crowd so dashboard numbers agree with the fans list. */
function baselineActivation(pack: ContentPack, fans: Fan[]): Record<string, ActivationStats> {
  const out: Record<string, ActivationStats> = {};
  pack.breaks.forEach((b, i) => {
    out[b.id] = { plays: fans.filter((f) => f.plays.includes(b.mode)).length, signups: 0, redemptions: 3 + i * 2 };
  });
  out[SECTION_BATTLE] = { plays: 0, signups: 0, redemptions: 0 };
  return out;
}

export function initialState(sport: SportId = 'hockey'): DemoState {
  const pack = packs[sport] ?? packs.hockey;
  const fans = seedFans();
  return {
    sport: pack.sport,
    pack,
    config: teamConfig,
    orders,
    sponsors,
    rewards,
    fans,
    currentFanId: null,
    activeBreakIndex: -1,
    eventIndex: 0,
    lastEventLabel: null,
    gameOver: false,
    play: { prediction: null, bingoCard: buildCard(pack), bingoMarked: [], bingoJoined: false, bingoLinesAwarded: 0, triviaDoneBreakIds: [], redeemed: [] },
    activation: baselineActivation(pack, fans),
    highlightFanId: null,
  };
}

const activeBreakOf = (s: DemoState): BreakSlot | null => (s.activeBreakIndex >= 0 ? s.pack.breaks[s.activeBreakIndex] : null);

function updateFan(s: DemoState, id: string, fn: (f: Fan) => Fan): Fan[] {
  return s.fans.map((f) => (f.id === id ? fn(f) : f));
}

const addPlay = (mode: GameMode) => (f: Fan): Fan => (f.plays.includes(mode) ? f : { ...f, plays: [...f.plays, mode] });
const addPoints = (n: number) => (f: Fan): Fan => ({ ...f, gamePoints: f.gamePoints + n });

function bump(s: DemoState, key: string, field: keyof ActivationStats): Record<string, ActivationStats> {
  const cur = s.activation[key] ?? { plays: 0, signups: 0, redemptions: 0 };
  return { ...s.activation, [key]: { ...cur, [field]: cur[field] + 1 } };
}

/** Award any bingo lines completed since the last award, if the fan has joined bingo. */
function settleBingo(s: DemoState): DemoState {
  if (!s.play.bingoJoined || !s.currentFanId) return s;
  const lines = completedLines(s.play.bingoCard, new Set(s.play.bingoMarked));
  const fresh = lines - s.play.bingoLinesAwarded;
  if (fresh <= 0) return s;
  return { ...s, fans: updateFan(s, s.currentFanId, addPoints(fresh * BINGO_LINE_POINTS)), play: { ...s.play, bingoLinesAwarded: lines } };
}

export function reducer(s: DemoState, a: Action): DemoState {
  switch (a.type) {
    case 'signUp': {
      const link = matchSeat(s.orders, a.seat);
      const brk = activeBreakOf(s);
      const fan: Fan = {
        id: `fan-p-${s.fans.length + 1}`,
        name: a.name.trim(),
        email: a.email.trim(),
        seat: link.kind === 'no-seat' || !a.seat ? null : normalizeSeat(a.seat),
        link,
        signupOrder: s.fans.length + 1,
        signupBreakId: brk?.id ?? null,
        gamePoints: SIGNUP_BONUS,
        plays: [],
        seasonHistory: [],
        isPresenter: true,
      };
      return {
        ...s,
        fans: [...s.fans, fan],
        currentFanId: fan.id,
        highlightFanId: fan.id,
        activation: brk ? bump(s, brk.id, 'signups') : s.activation,
      };
    }
    case 'openNextBreak': {
      if (s.activeBreakIndex + 1 >= s.pack.breaks.length) return s;
      const resolved = s.play.prediction && s.play.prediction.result !== 'pending';
      return { ...s, activeBreakIndex: s.activeBreakIndex + 1, play: resolved ? { ...s.play, prediction: null } : s.play };
    }
    case 'fireNextEvent': {
      if (s.eventIndex >= s.pack.events.length) return s;
      const ev = s.pack.events[s.eventIndex];
      let next: DemoState = {
        ...s,
        eventIndex: s.eventIndex + 1,
        lastEventLabel: ev.label,
        play: { ...s.play, bingoMarked: [...new Set([...s.play.bingoMarked, ...ev.bingoSquareIds])] },
      };
      const p = next.play.prediction;
      if (p && p.result === 'pending' && ev.predictionOutcome !== null) {
        const correct = p.choice === ev.predictionOutcome;
        next = {
          ...next,
          play: { ...next.play, prediction: { ...p, result: correct ? 'correct' : 'incorrect' } },
          fans: correct && next.currentFanId ? updateFan(next, next.currentFanId, addPoints(PREDICTION_POINTS)) : next.fans,
        };
      }
      return settleBingo(next);
    }
    case 'endGame':
      return s.gameOver ? s : { ...s, gameOver: true };
    case 'lockPrediction': {
      const brk = activeBreakOf(s);
      if (!s.currentFanId || brk?.mode !== 'prediction' || s.play.prediction) return s;
      return {
        ...s,
        fans: updateFan(s, s.currentFanId, addPlay('prediction')),
        play: { ...s.play, prediction: { choice: a.choice, breakId: brk.id, result: 'pending' } },
        activation: bump(s, brk.id, 'plays'),
      };
    }
    case 'completeTrivia': {
      const brk = activeBreakOf(s);
      if (!s.currentFanId || brk?.mode !== 'trivia' || s.play.triviaDoneBreakIds.includes(brk.id)) return s;
      const pts = Math.max(0, a.correctCount) * TRIVIA_POINTS_PER_CORRECT;
      return {
        ...s,
        fans: updateFan(s, s.currentFanId, (f) => addPoints(pts)(addPlay('trivia')(f))),
        play: { ...s.play, triviaDoneBreakIds: [...s.play.triviaDoneBreakIds, brk.id] },
        activation: bump(s, brk.id, 'plays'),
      };
    }
    case 'joinBingo': {
      const brk = activeBreakOf(s);
      if (!s.currentFanId || brk?.mode !== 'bingo' || s.play.bingoJoined) return s;
      return settleBingo({
        ...s,
        fans: updateFan(s, s.currentFanId, addPlay('bingo')),
        play: { ...s.play, bingoJoined: true },
        activation: bump(s, brk.id, 'plays'),
      });
    }
    case 'redeemReward': {
      const fan = s.fans.find((f) => f.id === s.currentFanId);
      const reward = s.rewards.find((r) => r.id === a.rewardId);
      if (!fan || !reward || s.play.redeemed.includes(reward.id) || seasonPoints(fan) < reward.unlockAt) return s;
      const brk = s.pack.breaks.find((b) => b.sponsorId === reward.sponsorId);
      return { ...s, play: { ...s.play, redeemed: [...s.play.redeemed, reward.id] }, activation: bump(s, brk?.id ?? SECTION_BATTLE, 'redemptions') };
    }
    case 'viewAsFan':
      return s.fans.some((f) => f.id === a.fanId) ? { ...s, currentFanId: a.fanId } : s;
    case 'switchSport':
      return initialState(a.sport);
    case 'reset':
      return initialState(s.sport);
  }
}
