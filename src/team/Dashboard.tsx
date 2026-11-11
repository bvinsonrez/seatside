import { useDemo } from '../state/DemoContext';
import { fansNewestFirst } from '../state/selectors';

export default function Dashboard() {
  const { state } = useDemo();
  return (
    <div data-testid="dashboard">
      <ul>{fansNewestFirst(state).slice(0, 3).map((f) => <li key={f.id}>{f.name}</li>)}</ul>
    </div>
  );
}
