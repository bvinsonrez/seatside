import { useEffect, useRef } from 'react';
import { useDemo } from '../state/DemoContext';
import { activeBreak } from '../state/selectors';
import { SPONSOR_SQUARE_ID, completedLines } from '../domain/bingo';
import { BINGO_LINE_POINTS } from '../domain/scoring';
import { sponsorById } from '../data/sponsors';
import GameHeader from './GameHeader';
import { celebrate } from './celebrate';

export default function BingoScreen({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useDemo();
  const brk = activeBreak(state);
  const bingoBreak = state.pack.breaks.find((b) => b.mode === 'bingo')!;
  const isBingo = brk?.mode === 'bingo';
  const marked = new Set(state.play.bingoMarked);
  const lines = completedLines(state.play.bingoCard, marked);
  const prevLines = useRef(state.play.bingoLinesAwarded);

  useEffect(() => {
    if (isBingo && !state.play.bingoJoined) dispatch({ type: 'joinBingo' });
  }, [isBingo, state.play.bingoJoined, dispatch]);

  useEffect(() => {
    if (state.play.bingoLinesAwarded > prevLines.current) celebrate();
    prevLines.current = state.play.bingoLinesAwarded;
  }, [state.play.bingoLinesAwarded]);

  const label = (id: string) => state.pack.bingoSquares.find((b) => b.id === id)?.label ?? id;

  return (
    <div>
      <GameHeader title={bingoBreak.label} sponsorId={bingoBreak.sponsorId} onBack={onBack} />
      <div className="p-4">
        {!state.play.bingoJoined && (
          <p className="mb-3 rounded-xl bg-white p-3 text-center text-sm text-slate-500 shadow-sm">Bingo opens at the next {state.pack.terms.breakName}. Here's your card.</p>
        )}
        <div className="grid grid-cols-3 gap-2">
          {state.play.bingoCard.map((id, idx) => {
            const isSponsor = id === SPONSOR_SQUARE_ID;
            const on = isSponsor || marked.has(id);
            return (
              <div
                key={id}
                data-testid={`bingo-square-${idx}`}
                data-marked={on ? 'true' : 'false'}
                className={`flex aspect-square flex-col items-center justify-center rounded-xl p-1.5 text-center text-[12px] font-bold leading-tight transition ${
                  isSponsor ? 'bg-[var(--team-secondary)] text-slate-900'
                  : on ? 'bg-[var(--team-primary)] text-white'
                  : 'bg-white text-slate-700 shadow-sm'
                }`}
              >
                {isSponsor ? (
                  <>
                    <span className="text-[10px] uppercase tracking-wide">Free</span>
                    <span>{sponsorById(bingoBreak.sponsorId).name}</span>
                    <span className="mt-0.5 text-[8px] font-medium uppercase">Sample sponsor</span>
                  </>
                ) : (
                  <span>{label(id)}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 rounded-2xl bg-white p-4 text-center shadow-sm">
          <p className="text-sm text-slate-500">Squares mark themselves as the game happens.</p>
          <p className="mt-1 text-lg font-extrabold">{lines} {lines === 1 ? 'line' : 'lines'}</p>
          {state.play.bingoJoined && <p className="text-sm font-semibold text-emerald-600">+{state.play.bingoLinesAwarded * BINGO_LINE_POINTS} points</p>}
        </div>
      </div>
    </div>
  );
}
