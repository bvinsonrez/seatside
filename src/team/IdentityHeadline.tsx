import { useDemo } from '../state/DemoContext';
import { identityHeadline } from '../state/selectors';

export default function IdentityHeadline() {
  const { state } = useDemo();
  const h = identityHeadline(state);
  const tiles = [
    { id: 'signed', label: 'Signed up tonight', value: h.signedUp, accent: false },
    { id: 'shadow', label: 'Shadow fans identified', value: h.shadowFans, accent: true },
    { id: 'matched', label: 'Linked by seat match', value: h.seatMatched, accent: false },
    { id: 'noseat', label: 'No seat given', value: h.noSeat, accent: false },
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
      <p className="mt-2 text-xs text-slate-500">Shadow fans are people in the building who did not buy the ticket. Seat match links them to the account holder who did.</p>
    </section>
  );
}
