import StatusBadge from './StatusBadge.jsx';

export default function RecordTable({ columns, rows, statusOptions, onStatusChange, emptyText }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-panelSoft text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3">{column.label}</th>
              ))}
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.id} className="align-top hover:bg-white/[0.03]">
                {columns.map((column) => (
                  <td key={column.key} className="max-w-md px-4 py-3 text-slate-300">
                    <span className={column.multiline ? 'line-clamp-4 whitespace-pre-wrap' : ''}>
                      {column.render ? column.render(row) : row[column.key] || '-'}
                    </span>
                  </td>
                ))}
                <td className="px-4 py-3">
                  {onStatusChange ? (
                    <select
                      value={row.status || 'pending'}
                      onChange={(event) => onStatusChange(row.id, event.target.value)}
                      className="focus-ring rounded-md border border-line bg-ink px-2 py-1 text-slate-100"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>
                      ))}
                    </select>
                  ) : (
                    <StatusBadge status={row.status} />
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-400">{emptyText}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
