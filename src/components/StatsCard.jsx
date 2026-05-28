export default function StatsCard({ label, value, tone = 'default' }) {
  const tones = {
    default: 'border-line bg-panel',
    brand: 'border-brand/30 bg-brand/10',
    warn: 'border-amber-400/30 bg-amber-400/10',
  };

  return (
    <div className={`rounded-lg border p-5 shadow-glow ${tones[tone] || tones.default}`}>
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
    </div>
  );
}
