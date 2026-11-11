import { useDemo } from '../state/DemoContext';
import { activeBreak } from '../state/selectors';
import IdentityHeadline from './IdentityHeadline';
import FansTable from './FansTable';
import SponsorResults from './SponsorResults';

export default function Dashboard() {
  const { state } = useDemo();
  const brk = activeBreak(state);
  return (
    <div data-testid="dashboard" className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Team view</p>
          <h2 className="text-2xl font-extrabold text-white">{state.config.home.name} | Tonight at {state.config.venue}</h2>
        </div>
        <p className="text-sm text-slate-300">
          {state.gameOver ? 'Final' : brk ? `Live: ${brk.label}` : 'Between breaks'}
          {state.lastEventLabel && !state.gameOver ? ` | ${state.lastEventLabel}` : ''}
        </p>
      </header>
      <IdentityHeadline />
      <FansTable />
      <SponsorResults />
    </div>
  );
}
