export default function ScreenTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="bg-[var(--team-primary)] px-4 pb-4 pt-10 text-white">
      <h2 className="text-2xl font-extrabold">{title}</h2>
      {sub && <p className="text-sm text-white/75">{sub}</p>}
    </div>
  );
}
