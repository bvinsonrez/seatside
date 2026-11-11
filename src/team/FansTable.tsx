import { useEffect, useRef, useState } from 'react';
import { Target, HelpCircle, Grid3x3 } from 'lucide-react';
import { useDemo } from '../state/DemoContext';
import { fansNewestFirst } from '../state/selectors';
import type { Fan, GameMode } from '../types';

const MODE_ICON: Record<GameMode, typeof Target> = { prediction: Target, trivia: HelpCircle, bingo: Grid3x3 };

function linkedTo(f: Fan): string {
  switch (f.link.kind) {
    case 'holder': return 'Account holder';
    case 'seat-match': return `Probable guest of ${f.link.holderName}`;
    case 'no-match': return 'No seat match';
    case 'no-seat': return 'No seat given';
  }
}

export default function FansTable() {
  const { state } = useDemo();
  const fans = fansNewestFirst(state);
  const [flash, setFlash] = useState<string | null>(null);
  const rowRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    if (!state.highlightFanId) return;
    setFlash(state.highlightFanId);
    rowRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
    const id = setTimeout(() => setFlash(null), 3000);
    return () => clearTimeout(id);
  }, [state.highlightFanId]);

  return (
    <section className="rounded-2xl bg-white shadow-sm">
      <div className="flex items-baseline justify-between px-4 pb-2 pt-4">
        <h3 className="font-bold text-slate-900">Identified fans</h3>
        <span className="text-xs text-slate-500">Newest first</span>
      </div>
      <div className="max-h-[340px] overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-2 font-semibold">Fan</th>
              <th className="px-2 py-2 font-semibold">Seat</th>
              <th className="px-2 py-2 font-semibold">Linked to</th>
              <th className="px-2 py-2 font-semibold">How linked</th>
              <th className="px-2 py-2 font-semibold">Played</th>
              <th className="px-2 py-2 text-right font-semibold">Pts</th>
              <th className="px-4 py-2 text-right font-semibold">Games</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            {fans.map((f) => {
              const hot = flash === f.id;
              return (
                <tr
                  key={f.id}
                  ref={f.id === state.highlightFanId ? rowRef : undefined}
                  data-testid="fan-row"
                  data-highlight={hot ? 'true' : 'false'}
                  className={`border-t border-slate-100 transition-colors duration-700 ${hot ? 'bg-amber-100' : ''}`}
                >
                  <td className="px-4 py-2">
                    <span className="font-semibold">{f.name}</span>
                    {f.isPresenter && <span className="ml-1.5 rounded bg-[var(--team-primary)] px-1.5 py-px text-[10px] font-bold text-white">NEW</span>}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-slate-600">{f.seat ? `${f.seat.section}-${f.seat.row}-${f.seat.seat}` : '-'}</td>
                  <td className="px-2 py-2 text-slate-600">{linkedTo(f)}</td>
                  <td className="px-2 py-2">
                    {f.link.kind === 'seat-match' && <span className="whitespace-nowrap rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800">Seat match</span>}
                  </td>
                  <td className="px-2 py-2">
                    <span className="flex gap-1 text-slate-500">
                      {f.plays.map((m) => {
                        const Icon = MODE_ICON[m];
                        return <Icon key={m} size={14} aria-label={m} />;
                      })}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right font-semibold tabular-nums">{f.gamePoints}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-slate-600">{f.seasonHistory.length + 1}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
