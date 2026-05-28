import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import RecordTable from '../components/RecordTable.jsx';
import { supabase } from '../lib/supabase';

const columns = [
  { key: 'name', label: 'Name', render: (row) => row.name || 'Candidate' },
  { key: 'phone', label: 'Phone' },
  { key: 'message', label: 'Message', multiline: true },
  { key: 'admin_notes', label: 'Notes', multiline: true },
  { key: 'created_at', label: 'Created At', render: (row) => new Date(row.created_at).toLocaleString() },
];

export default function Career() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const { data, error: loadError } = await supabase.from('career_applications').select('*').order('created_at', { ascending: false });
      setLoading(false);
      if (loadError) setError(loadError.message);
      else setRows(data || []);
    }
    load();
  }, []);

  async function updateStatus(id, status) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, status } : row)));
    const { error: updateError } = await supabase.from('career_applications').update({ status }).eq('id', id);
    if (updateError) setError(updateError.message);
  }

  return (
    <>
      <PageHeader title="Career Applications" subtitle="Internship and job inquiries from WhatsApp." />
      {error ? <div className="mb-4 rounded-md border border-rose-400/30 bg-rose-400/10 p-3 text-rose-100">{error}</div> : null}
      {loading ? <div className="text-slate-400">Loading career applications...</div> : (
        <RecordTable
          columns={columns}
          rows={rows}
          statusOptions={['new', 'contacted', 'in_discussion', 'rejected', 'completed']}
          onStatusChange={updateStatus}
          emptyText="No career applications found."
        />
      )}
    </>
  );
}
