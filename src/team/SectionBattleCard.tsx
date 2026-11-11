import { useDemo } from '../state/DemoContext';
import { sectionStandings } from '../state/selectors';
import { sponsorById } from '../data/sponsors';
import { SECTION_BATTLE } from '../state/reducer';

export default function SectionBattleCard() {
  const { state } = useDemo();
  const rows = sectionStandings(state);
  const counted = rows.reduce((n, r) => n + r.fans, 0);
  const winner = rows[0];
  const { sponsorId, prize } = state.config.sectionBattle;
  return (
    <div data-testid={`sponsor-card-${SECTION_BATTLE}`} className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-slate-900">{sponsorById(sponsorId).name}</p>
          <p className="text-xs text-slate-500">Section battle: {prize}</p>
        </div>
        <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] uppercase text-slate-400">Sample sponsor</span>
      </div>
      <ol className="mt-3 space-y-1 text-sm">
        {rows.slice(0, 3).map((r, i) => (
          <li key={r.section} className="flex justify-between text-slate-700">
            <span><span className="mr-2 font-black text-slate-400">{i + 1}</span>Section {r.section} <span className="text-xs text-slate-400">({r.fans} fans)</span></span>
            <span className="font-semibold tabular-nums">{r.points}</span>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-slate-500">{counted} fans counted (fans with a seat)</p>
      {state.gameOver && winner && (
        <p className="mt-2 rounded-lg bg-amber-100 px-3 py-2 text-sm font-bold text-amber-900">
          Final: prize owed to {winner.fans} fans in section {winner.section}
        </p>
      )}
    </div>
  );
}
