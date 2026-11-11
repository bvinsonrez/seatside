import { CheckCircle2, Lock } from 'lucide-react';
import { useDemo } from '../state/DemoContext';
import { currentFan } from '../state/selectors';
import { levelFor, seasonPoints, tierFor } from '../domain/scoring';
import SponsorTag from './SponsorTag';
import ScreenTitle from './ScreenTitle';

export default function RewardsScreen() {
  const { state, dispatch } = useDemo();
  const fan = currentFan(state)!;
  const pts = seasonPoints(fan);
  const level = levelFor(pts);
  const next = state.rewards.find((r) => r.unlockAt > pts);
  const prevAt = [...state.rewards].reverse().find((r) => r.unlockAt <= pts)?.unlockAt ?? 0;
  const pct = next ? Math.round(((pts - prevAt) / (next.unlockAt - prevAt)) * 100) : 100;

  return (
    <div>
      <ScreenTitle title="Rewards" sub={`Level ${level} ${tierFor(level)}`} />
      <div className="space-y-3 p-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Season points</p>
          <p className="text-3xl font-black">{pts}</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-[var(--team-primary)]" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-500">{next ? `${next.unlockAt - pts} points to ${next.name}` : 'Every reward unlocked'}</p>
        </div>
        {state.rewards.map((r) => {
          const unlocked = pts >= r.unlockAt;
          const redeemed = (state.play.redeemed[fan.id] ?? []).includes(r.id);
          return (
            <div key={r.id} data-testid="reward-card" className={`rounded-2xl bg-white p-4 shadow-sm ${unlocked ? '' : 'opacity-70'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold">{r.name}</p>
                  <SponsorTag sponsorId={r.sponsorId} prefix="From" />
                </div>
                <span className="shrink-0 text-xs font-bold text-slate-500">{r.unlockAt} pts</span>
              </div>
              <div className="mt-3">
                {redeemed ? (
                  <p className="flex items-center gap-1 text-sm font-bold text-emerald-600"><CheckCircle2 size={16} /> Redeemed, show this at the stand</p>
                ) : unlocked ? (
                  <button onClick={() => dispatch({ type: 'redeemReward', rewardId: r.id })} className="w-full rounded-xl bg-[var(--team-primary)] py-2.5 text-sm font-bold text-white">
                    Redeem
                  </button>
                ) : (
                  <p className="flex items-center gap-1 text-sm text-slate-500"><Lock size={14} /> {r.unlockAt - pts} more points</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
