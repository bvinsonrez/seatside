import { Flag, RotateCcw, SkipForward, Timer, UserRound } from 'lucide-react';
import { useDemo } from '../state/DemoContext';
import { activeBreak } from '../state/selectors';
import { RETURNING_FAN_ID } from '../data/seed';
import { packs } from '../content';
import type { SportId } from '../types';

const btn = 'inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40';

export default function PresenterBar() {
  const { state, dispatch } = useDemo();
  const brk = activeBreak(state);
  const nextEvent = state.pack.events[state.eventIndex];
  const breaksLeft = state.activeBreakIndex + 1 < state.pack.breaks.length;
  const sports = Object.keys(packs) as SportId[];

  return (
    <div data-testid="presenter-bar" className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-slate-900/80 px-4 py-2 text-white backdrop-blur">
      <span className="mr-2 text-sm font-bold tracking-wide">Seatside</span>
      <span className="mr-2 rounded bg-white/10 px-2 py-0.5 text-[11px] uppercase tracking-wider text-slate-300">Presenter</span>
      <button className={btn} disabled={!breaksLeft} onClick={() => dispatch({ type: 'openNextBreak' })}>
        <Timer size={15} /> Next break
      </button>
      <button className={btn} disabled={!nextEvent} title={nextEvent ? `Next: ${nextEvent.label}` : 'No plays left'} onClick={() => dispatch({ type: 'fireNextEvent' })}>
        <SkipForward size={15} /> Next play
      </button>
      <button className={btn} disabled={state.gameOver} onClick={() => dispatch({ type: 'endGame' })}>
        <Flag size={15} /> End game
      </button>
      {state.presenterFanId && state.currentFanId !== state.presenterFanId ? (
        <button className={btn} onClick={() => dispatch({ type: 'viewAsFan', fanId: state.presenterFanId! })}>
          <UserRound size={15} /> Back to my fan
        </button>
      ) : (
        <button className={btn} onClick={() => dispatch({ type: 'viewAsFan', fanId: RETURNING_FAN_ID })}>
          <UserRound size={15} /> View returning fan
        </button>
      )}
      {sports.length > 1 && (
        <label className="inline-flex items-center gap-1.5 text-sm">
          <span className="text-slate-300">Sport</span>
          <select
            aria-label="Sport"
            className="rounded-lg bg-white/10 px-2 py-1.5 text-sm text-white"
            value={state.sport}
            onChange={(e) => dispatch({ type: 'switchSport', sport: e.target.value as SportId })}
          >
            {sports.map((id) => (
              <option key={id} value={id} className="text-slate-900">{packs[id].displayName}</option>
            ))}
          </select>
        </label>
      )}
      <button className={btn} onClick={() => dispatch({ type: 'reset' })}>
        <RotateCcw size={15} /> Reset
      </button>
      <span className="ml-auto truncate text-xs text-slate-300">
        {brk ? `Live: ${brk.label}` : 'No break open'}
        {state.lastEventLabel ? ` | Last play: ${state.lastEventLabel}` : ''}
        {state.gameOver ? ' | Final' : ''}
      </span>
    </div>
  );
}
