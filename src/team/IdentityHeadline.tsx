import { useDemo } from '../state/DemoContext';
import { identityHeadline } from '../state/selectors';

export default function IdentityHeadline() {
  const { state } = useDemo();
  const h = identityHeadline(state);
  const tiles = [
    { id: 'signed', label: 'Signed up tonight', value: h.signedUp, accent: false },
    { id: 'shadow', label: 'Shadow fans identified', value: h.shadowFans, accent: true },
    { id: 'holders', label: 'Account holders', value: h.holders, accent: false },
    { id: 'unlinked', label: 'Not linked yet', value: h.unlinked, accent: false },
  ];
  return (
    <section>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.id}
            data-testid={`tile-${t.id}`}
            data-value={t.value}
            className={`rounded-2xl p-4 ${t.accent ? 'bg-[var(--team-primary)] text-white' : 'bg-white text-slate-900 shadow-sm'}`}
          >
            <p className={`text-xs font-semibold ${t.accent ? 'text-white/75' : 'text-slate-500'}`}>{t.label}</p>
            <p className="text-3xl font-black tabular-nums">{t.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500">Shadow fans came in on someone else's ticket. A seat match links each one to the account holder who bought it, as a probable guest. Not linked yet: no seat given, or the seat matched no order.</p>
    </section>
  );
}
