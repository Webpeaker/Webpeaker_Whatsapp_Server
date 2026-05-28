import { Link } from 'react-router-dom';

export default function LeadTable({ leads, onStatusChange }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-panelSoft text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Lead Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created At</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-medium text-white">{lead.name || 'Customer'}</td>
                <td className="px-4 py-3 text-slate-300">{lead.phone}</td>
                <td className="px-4 py-3 text-slate-300">{lead.service || '-'}</td>
                <td className="px-4 py-3 text-slate-300">{lead.lead_type}</td>
                <td className="px-4 py-3">
                  <select
                    value={lead.status || 'new'}
                    onChange={(event) => onStatusChange(lead.id, event.target.value)}
                    className="focus-ring rounded-md border border-line bg-ink px-2 py-1 text-slate-100"
                  >
                    {['new', 'contacted', 'in_discussion', 'converted', 'rejected', 'completed'].map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll('_', ' ')}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-slate-400">{new Date(lead.created_at).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <Link className="font-medium text-brand hover:text-brand/80" to={`/leads/${lead.id}`}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {!leads.length && (
              <tr>
                <td colSpan="7" className="px-4 py-10 text-center text-slate-400">
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
