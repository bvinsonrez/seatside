import { useState } from 'react';
import { QrCode, CheckCircle2 } from 'lucide-react';
import { useDemo } from '../state/DemoContext';
import { qrSeat } from '../data/seed';
import SponsorTag from './SponsorTag';
import TeamBadge from './TeamBadge';

const input = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[15px] outline-none focus:border-[var(--team-primary)] focus:ring-2 focus:ring-[var(--team-primary)]/20';

export default function JoinScreen() {
  const { state, dispatch } = useDemo();
  const { config } = state;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [section, setSection] = useState('');
  const [row, setRow] = useState('');
  const [seat, setSeat] = useState('');
  const [scanned, setScanned] = useState(false);
  const ready = name.trim() !== '' && email.trim() !== '';

  const scan = () => {
    setSection(qrSeat.section);
    setRow(qrSeat.row);
    setSeat(qrSeat.seat);
    setScanned(true);
  };

  const join = () => {
    const any = section.trim() || row.trim() || seat.trim();
    dispatch({ type: 'signUp', name, email, seat: any ? { section, row, seat } : null });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="bg-[var(--team-primary)] px-5 pb-6 pt-10 text-center text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{config.tonightLabel}</p>
        <div className="my-4 flex items-center justify-center gap-4">
          <TeamBadge short={config.home.short} color={config.home.primary} />
          <span className="text-lg font-bold text-white/70">vs</span>
          <TeamBadge short={config.away.short} color="#334155" />
        </div>
        <h1 className="text-2xl font-extrabold leading-tight">Play during breaks.<br />Win prizes.</h1>
        <p className="mt-1 text-sm text-white/80">Your section is counting on you.</p>
        <div className="mt-3"><SponsorTag sponsorId={config.nightSponsorId} prefix="Tonight's game presented by" tone="dark" /></div>
      </div>

      <div className="space-y-3 px-5 py-5">
        <div>
          <label htmlFor="join-name" className="mb-1 block text-xs font-semibold text-slate-600">Your name</label>
          <input id="join-name" className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="First and last" autoComplete="name" />
        </div>
        <div>
          <label htmlFor="join-email" className="mb-1 block text-xs font-semibold text-slate-600">Email</label>
          <input id="join-email" type="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <button onClick={scan} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white active:scale-[0.99]">
            <QrCode size={18} /> Scan the code on your seat
          </button>
          {scanned && (
            <p className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-emerald-600">
              <CheckCircle2 size={14} /> Seat found
            </p>
          )}
          <p className="my-2 text-center text-[11px] uppercase tracking-wider text-slate-400">or type it in</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="join-section" className="mb-1 block text-[11px] font-semibold text-slate-500">Section</label>
              <input id="join-section" className={input} value={section} onChange={(e) => setSection(e.target.value)} inputMode="numeric" />
            </div>
            <div>
              <label htmlFor="join-row" className="mb-1 block text-[11px] font-semibold text-slate-500">Row</label>
              <input id="join-row" className={input} value={row} onChange={(e) => setRow(e.target.value)} />
            </div>
            <div>
              <label htmlFor="join-seat" className="mb-1 block text-[11px] font-semibold text-slate-500">Seat</label>
              <input id="join-seat" className={input} value={seat} onChange={(e) => setSeat(e.target.value)} inputMode="numeric" />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Adding your seat puts you in the section battle.</p>
        </div>

        <button
          onClick={join}
          disabled={!ready}
          className="w-full rounded-2xl bg-[var(--team-primary)] py-4 text-lg font-extrabold text-white shadow-lg transition disabled:opacity-40"
        >
          Join tonight's game
        </button>
        <p className="text-center text-[11px] text-slate-400">+25 points just for joining</p>
      </div>
    </div>
  );
}
