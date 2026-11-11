import { Radio, Trophy, Zap } from 'lucide-react';
import { useDemo } from '../state/DemoContext';
import { activeBreak, currentFan, sectionStandings } from '../state/selectors';
import { levelFor, seasonPoints, tierFor } from '../domain/scoring';
import SponsorTag from './SponsorTag';
import TeamBadge from './TeamBadge';
import type { FanScreen } from './FanApp';
import type { GameMode } from '../types';

const MODE_NAME: Record<GameMode, string> = { prediction: 'Prediction', trivia: 'Trivia', bingo: 'Bingo' };

export default function LobbyScreen({ go }: { go: (s: FanScreen) => void }) {
  const { state } = useDemo();
  const fan = currentFan(state)!;
  const brk = activeBreak(state);
  const level = levelFor(seasonPoints(fan));
  const standings = sectionStandings(state);
  const myRank = fan.seat ? standings.findIndex((r) => r.section === fan.seat!.section) + 1 : 0;
  const played =
    brk &&
    ((brk.mode === 'prediction' && state.play.prediction?.breakId === brk.id) ||
      (brk.mode === 'trivia' && state.play.triviaDoneBreakIds.includes(brk.id)) ||
      (brk.mode === 'bingo' && state.play.bingoJoined));

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3 pt-6">
        <TeamBadge short={state.config.home.short} color={state.config.home.primary} size={40} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{state.config.home.name} vs {state.config.away.name}</p>
          <p className="text-xs text-slate-500">{state.config.venue}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[var(--team-primary)] p-4 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Points tonight</p>
          <p className="text-3xl font-black">{fan.gamePoints}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Level {level}</p>
          <p className="text-xl font-extrabold">{tierFor(level)}</p>
          <p className="text-[11px] text-slate-500">{seasonPoints(fan)} season pts</p>
        </div>
      </div>

      {brk ? (
        <div className="rounded-2xl border-2 border-[var(--team-secondary)] bg-white p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-600">
            <Radio size={13} className="animate-pulse" /> Live now
          </p>
          <p className="mt-1 text-xl font-extrabold">{brk.label}</p>
          <p className="text-sm text-slate-500">{MODE_NAME[brk.mode]}</p>
          <div className="mt-2"><SponsorTag sponsorId={brk.sponsorId} /></div>
          <button onClick={() => go(brk.mode === 'prediction' ? 'predict' : brk.mode)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--team-primary)] py-3 font-bold text-white">
            <Zap size={16} /> {played ? 'Played, see results' : 'Play now'}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-center">
          <p className="text-sm font-semibold text-slate-600">Next up at the {state.pack.terms.breakName}</p>
          <p className="text-xs text-slate-400">We'll light this up when the game breaks.</p>
        </div>
      )}

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500"><Trophy size={13} /> Section battle</p>
        {fan.seat ? (
          <p className="mt-1 text-lg font-extrabold">Section {fan.seat.section} is #{myRank} of {standings.length}</p>
        ) : (
          <p className="mt-1 text-sm font-semibold text-slate-600">Add your seat to join the battle</p>
        )}
        <p className="text-sm text-slate-600">{state.config.sectionBattle.prize}</p>
        <div className="mt-2"><SponsorTag sponsorId={state.config.sectionBattle.sponsorId} /></div>
      </div>
    </div>
  );
}
