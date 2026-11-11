import { useState } from 'react';
import { useDemo } from '../state/DemoContext';
import { crewFor, currentFan, overallLeaderboard, sectionStandings, tonightLeaderboard } from '../state/selectors';
import SponsorTag from './SponsorTag';
import ScreenTitle from './ScreenTitle';
import type { Fan } from '../types';

type Tab = 'Section battle' | 'Tonight' | 'Season' | 'Crew';
const TABS: Tab[] = ['Section battle', 'Tonight', 'Season', 'Crew'];

function Row({ rank, name, sub, points, mine }: { rank: number; name: string; sub?: string; points: number; mine: boolean }) {
  return (
    <li
      data-testid={mine ? 'rank-row-mine' : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${mine ? 'bg-[var(--team-primary)] text-white' : 'bg-white shadow-sm'}`}
    >
      <span className={`w-6 text-center text-sm font-black ${mine ? '' : 'text-slate-400'}`}>{rank}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{name}</span>
        {sub && <span className={`block text-[11px] ${mine ? 'text-white/75' : 'text-slate-500'}`}>{sub}</span>}
      </span>
      <span className="font-bold">{points}</span>
    </li>
  );
}

const top = (rows: { fan: Fan; points: number }[], meId: string) => {
  const idx = rows.findIndex((r) => r.fan.id === meId);
  const list = rows.slice(0, 8).map((r, i) => ({ ...r, rank: i + 1 }));
  if (idx >= 8) list.push({ ...rows[idx], rank: idx + 1 });
  return list;
};

export default function RanksScreen() {
  const { state } = useDemo();
  const me = currentFan(state)!;
  const [tab, setTab] = useState<Tab>('Section battle');
  const sections = sectionStandings(state);
  const crew = crewFor(state, me.id).map((fan) => ({ fan, points: fan.gamePoints })).sort((a, b) => b.points - a.points);

  return (
    <div>
      <ScreenTitle title="Ranks" sub={`${state.config.home.name} vs ${state.config.away.name}`} />
      <div role="tablist" className="flex gap-1 overflow-x-auto bg-white px-3 py-2 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${tab === t ? 'bg-[var(--team-primary)] text-white' : 'text-slate-500'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="space-y-3 p-4">
        {tab === 'Section battle' && (
          <>
            <div className="rounded-2xl bg-[var(--team-secondary)]/20 p-3">
              <p className="text-sm font-bold">{state.config.sectionBattle.prize}</p>
              <SponsorTag sponsorId={state.config.sectionBattle.sponsorId} />
            </div>
            {!me.seat && <p className="rounded-xl bg-white p-3 text-center text-sm font-semibold text-slate-600 shadow-sm">Add your seat to join the battle</p>}
            <ol className="space-y-2">
              {sections.map((r, i) => (
                <Row key={r.section} rank={i + 1} name={`Section ${r.section}`} sub={`${r.fans} fans playing`} points={r.points} mine={me.seat?.section === r.section} />
              ))}
            </ol>
          </>
        )}
        {(tab === 'Tonight' || tab === 'Season') && (
          <ol className="space-y-2">
            {top(tab === 'Tonight' ? tonightLeaderboard(state) : overallLeaderboard(state), me.id).map((r) => (
              <Row key={r.fan.id} rank={r.rank} name={r.fan.name} sub={r.fan.seat ? `Section ${r.fan.seat.section}` : undefined} points={r.points} mine={r.fan.id === me.id} />
            ))}
          </ol>
        )}
        {tab === 'Crew' &&
          (crew.length === 0 ? (
            <p className="rounded-xl bg-white p-4 text-center text-sm text-slate-500 shadow-sm">No crew linked to your seat yet.</p>
          ) : (
            <>
              <p className="text-xs text-slate-500">Everyone who joined from your ticket order tonight.</p>
              <ol className="space-y-2">
                {crew.map((r, i) => (
                  <Row key={r.fan.id} rank={i + 1} name={r.fan.name} sub={r.fan.link.kind === 'holder' ? 'Ticket holder' : `Seat ${r.fan.seat?.seat}`} points={r.points} mine={r.fan.id === me.id} />
                ))}
              </ol>
            </>
          ))}
      </div>
    </div>
  );
}
