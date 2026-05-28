import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import LeadTable from '../components/LeadTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { supabase } from '../lib/supabase';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [service, setService] = useState('all');

  async function loadLeads() {
    setLoading(true);
    const { data, error: loadError } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    setLoading(false);
    if (loadError) setError(loadError.message);
    else setLeads(data || []);
  }

  useEffect(() => {
    loadLeads();
  }, []);

  const services = useMemo(() => [...new Set(leads.map((lead) => lead.service).filter(Boolean))], [leads]);
  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return leads.filter((lead) => {
      const matchesQuery = [lead.name, lead.phone, lead.service].some((value) => String(value || '').toLowerCase().includes(needle));
      const matchesStatus = status === 'all' || lead.status === status;
      const matchesService = service === 'all' || lead.service === service;
      return matchesQuery && matchesStatus && matchesService;
    });
  }, [leads, query, status, service]);

  async function updateStatus(id, nextStatus) {
    const previous = leads;
    setLeads((rows) => rows.map((row) => (row.id === id ? { ...row, status: nextStatus } : row)));
    const { error: updateError } = await supabase.from('leads').update({ status: nextStatus }).eq('id', id);
    if (updateError) {
      setLeads(previous);
      setError(updateError.message);
    }
  }

  return (
    <>
      <PageHeader title="Leads" subtitle="Search, filter, inspect, and update WhatsApp service leads." />
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_220px]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, phone, or service"
            className="focus-ring w-full rounded-lg border border-line bg-panel py-2 pl-10 pr-3 text-sm text-white"
          />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="focus-ring rounded-lg border border-line bg-panel px-3 py-2 text-sm text-white">
          <option value="all">All statuses</option>
          {['new', 'contacted', 'in_discussion', 'converted', 'rejected', 'completed'].map((item) => (
            <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>
          ))}
        </select>
        <select value={service} onChange={(event) => setService(event.target.value)} className="focus-ring rounded-lg border border-line bg-panel px-3 py-2 text-sm text-white">
          <option value="all">All services</option>
          {services.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      {error ? <div className="mb-4 rounded-md border border-rose-400/30 bg-rose-400/10 p-3 text-rose-100">{error}</div> : null}
      {loading ? <div className="text-slate-400">Loading leads...</div> : <LeadTable leads={filtered} onStatusChange={updateStatus} />}
    </>
  );
}
