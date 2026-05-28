import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import RecordTable from '../components/RecordTable.jsx';
import { supabase } from '../lib/supabase';

const columns = [
  { key: 'name', label: 'Name', render: (row) => row.name || 'Customer' },
  { key: 'phone', label: 'Phone' },
  { key: 'service', label: 'Service' },
  { key: 'preferred_date', label: 'Preferred Date' },
  { key: 'preferred_time', label: 'Preferred Time' },
  { key: 'requirement', label: 'Requirement', multiline: true },
  { key: 'admin_notes', label: 'Notes', multiline: true },
];

export default function Appointments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const { data, error: loadError } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
      setLoading(false);
      if (loadError) setError(loadError.message);
      else setRows(data || []);
    }
    load();
  }, []);

  async function updateStatus(id, status) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, status } : row)));
    const { error: updateError } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (updateError) setError(updateError.message);
  }

  return (
    <>
      <PageHeader title="Appointments" subtitle="Call booking requests collected from WhatsApp." />
      {error ? <div className="mb-4 rounded-md border border-rose-400/30 bg-rose-400/10 p-3 text-rose-100">{error}</div> : null}
      {loading ? <div className="text-slate-400">Loading appointments...</div> : (
        <RecordTable
          columns={columns}
          rows={rows}
          statusOptions={['pending', 'contacted', 'in_discussion', 'completed', 'rejected']}
          onStatusChange={updateStatus}
          emptyText="No appointments found."
        />
      )}
    </>
  );
}
