import { useDemo } from '../state/DemoContext';
import { activeBreak } from '../state/selectors';
import { sponsorById } from '../data/sponsors';
import SectionBattleCard from './SectionBattleCard';
import type { GameMode } from '../types';

const MODE_NAME: Record<GameMode, string> = { prediction: 'Prediction', trivia: 'Trivia', bingo: 'Bingo' };

function Stat({ id, label, value }: { id: string; label: string; value: number }) {
  return (
    <div data-testid={`stat-${id}`} data-value={value}>
      <p className="text-xl font-black tabular-nums text-slate-900">{value}</p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  );
}

export default function SponsorResults() {
  const { state } = useDemo();
  const live = activeBreak(state);
  return (
    <section>
      <h3 className="mb-2 font-bold text-white">Sponsor activations</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {state.pack.breaks.map((b) => {
          const a = state.activation[b.id];
          const isLive = live?.id === b.id;
          return (
            <div key={b.id} data-testid={`sponsor-card-${b.id}`} className={`rounded-2xl bg-white p-4 shadow-sm ${isLive ? 'ring-2 ring-[var(--team-secondary)]' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900">{sponsorById(b.sponsorId).name}</p>
                  <p className="text-xs text-slate-500">{b.label} ({MODE_NAME[b.mode]})</p>
                </div>
                {isLive ? (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700">Live</span>
                ) : (
                  <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] uppercase text-slate-400">Sample sponsor</span>
                )}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Stat id="plays" label="Plays" value={a.plays} />
                <Stat id="signups" label="Sign-ups during" value={a.signups} />
                <Stat id="redemptions" label="Redemptions" value={a.redemptions} />
              </div>
            </div>
          );
        })}
        <SectionBattleCard />
      </div>
    </section>
  );
}
