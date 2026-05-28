import { statusLabel } from '../lib/status';

export default function StatusBadge({ status }) {
  const classes = {
    new: 'bg-sky-400/12 text-sky-200 ring-sky-300/20',
    pending: 'bg-amber-400/12 text-amber-200 ring-amber-300/20',
    contacted: 'bg-cyan-400/12 text-cyan-200 ring-cyan-300/20',
    in_discussion: 'bg-violet-400/12 text-violet-200 ring-violet-300/20',
    converted: 'bg-emerald-400/12 text-emerald-200 ring-emerald-300/20',
    completed: 'bg-emerald-400/12 text-emerald-200 ring-emerald-300/20',
    rejected: 'bg-rose-400/12 text-rose-200 ring-rose-300/20',
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${classes[status] || classes.new}`}>
      {statusLabel(status)}
    </span>
  );
}
