export default function TeamBadge({ short, color, size = 56 }: { short: string; color: string; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full border-2 border-white/80 font-black tracking-tight text-white shadow-md"
      style={{ width: size, height: size, background: color, fontSize: size * 0.3 }}
      aria-label={short}
    >
      {short}
    </div>
  );
}
