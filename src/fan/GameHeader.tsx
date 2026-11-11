import { ChevronLeft } from 'lucide-react';
import SponsorTag from './SponsorTag';

export default function GameHeader({ title, sponsorId, onBack }: { title: string; sponsorId?: string; onBack: () => void }) {
  return (
    <div className="bg-[var(--team-primary)] px-4 pb-4 pt-10 text-white">
      <button onClick={onBack} className="-ml-1 flex items-center text-sm text-white/80" aria-label="Back">
        <ChevronLeft size={18} /> Back
      </button>
      <h2 className="mt-1 text-2xl font-extrabold">{title}</h2>
      {sponsorId && <div className="mt-1"><SponsorTag sponsorId={sponsorId} tone="dark" /></div>}
    </div>
  );
}
