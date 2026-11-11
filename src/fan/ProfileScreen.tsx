import { useDemo } from '../state/DemoContext';
import { crewFor, currentFan } from '../state/selectors';
import { levelFor, seasonPoints, tierFor } from '../domain/scoring';
import ScreenTitle from './ScreenTitle';

export default function ProfileScreen() {
  const { state } = useDemo();
  const fan = currentFan(state)!;
  const pts = seasonPoints(fan);
  const level = levelFor(pts);
  const games = [{ gameId: 'tonight', date: 'Tonight', opponent: state.config.away.name, points: fan.gamePoints }, ...[...fan.seasonHistory].reverse()];
  const max = Math.max(...games.map((g) => g.points), 1);
  const crew = crewFor(state, fan.id).filter((f) => f.id !== fan.id);

  return (
    <div>
      <ScreenTitle title={fan.name} sub={fan.seat ? `Section ${fan.seat.section}, Row ${fan.seat.row}, Seat ${fan.seat.seat}` : 'No seat on file'} />
      <div className="space-y-3 p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <p className="text-2xl font-black">{pts}</p>
            <p className="text-[11px] text-slate-500">Season pts</p>
          </div>
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <p data-testid="games-attended" className="text-2xl font-black">{games.length}</p>
            <p className="text-[11px] text-slate-500">Games</p>
          </div>
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <p className="text-2xl font-black">{level}</p>
            <p className="text-[11px] text-slate-500">{tierFor(level)}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Points by game</p>
          <ul className="space-y-2">
            {games.map((g) => (
              <li key={g.gameId}>
                <div className="flex justify-between text-xs">
                  <span className={g.gameId === 'tonight' ? 'font-bold' : 'text-slate-600'}>{g.date} vs {g.opponent}</span>
                  <span className="font-bold">{g.points}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${g.gameId === 'tonight' ? 'bg-[var(--team-secondary)]' : 'bg-[var(--team-primary)]'}`} style={{ width: `${(g.points / max) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
          {fan.seasonHistory.length === 0 && <p className="mt-3 text-center text-sm font-semibold text-slate-600">Come back next game to start your streak.</p>}
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Your crew</p>
          {crew.length === 0 ? (
            <p className="text-sm text-slate-500">No crew linked to your seat yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {crew.map((f) => (
                <li key={f.id} className="flex justify-between">
                  <span>{f.name}{f.link.kind === 'holder' ? ' (ticket holder)' : ''}</span>
                  <span className="font-semibold">{f.gamePoints}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
