import { sponsorById } from '../data/sponsors';

export default function SponsorTag({ sponsorId, prefix = 'Presented by', tone = 'light' }: { sponsorId: string; prefix?: string; tone?: 'light' | 'dark' }) {
  const s = sponsorById(sponsorId);
  const text = tone === 'dark' ? 'text-white/80' : 'text-slate-500';
  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 text-xs ${text}`}>
      <span>
        {prefix} <span className="font-semibold">{s.name}</span>
      </span>
      <span className={`rounded-full border px-1.5 py-px text-[10px] font-medium uppercase tracking-wide ${tone === 'dark' ? 'border-white/30' : 'border-slate-300'}`}>
        Sample sponsor
      </span>
    </span>
  );
}
