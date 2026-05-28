import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import StatsCard from '../components/StatsCard.jsx';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const [leads, appointments, careers] = await Promise.all([
        supabase.from('leads').select('*'),
        supabase.from('appointments').select('*'),
        supabase.from('career_applications').select('*'),
      ]);

      if (leads.error || appointments.error || careers.error) {
        setError(leads.error?.message || appointments.error?.message || careers.error?.message);
        return;
      }

      const leadRows = leads.data || [];
      setStats({
        totalLeads: leadRows.length,
        newLeads: leadRows.filter((lead) => lead.status === 'new').length,
        serviceLeads: leadRows.filter((lead) => lead.lead_type === 'Service Lead').length,
        appointments: appointments.data?.length || 0,
        careerApplications: careers.data?.length || 0,
        converted: leadRows.filter((lead) => lead.status === 'converted').length,
        pending: leadRows.filter((lead) => ['new', 'contacted', 'in_discussion'].includes(lead.status)).length,
      });
    }
    load();
  }, []);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Live overview of Webpeaker WhatsApp lead activity." />
      {error ? <div className="mb-4 rounded-md border border-rose-400/30 bg-rose-400/10 p-3 text-rose-100">{error}</div> : null}
      {!stats ? (
        <div className="text-slate-400">Loading metrics...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard label="Total Leads" value={stats.totalLeads} tone="brand" />
          <StatsCard label="New Leads" value={stats.newLeads} />
          <StatsCard label="Service Leads" value={stats.serviceLeads} />
          <StatsCard label="Appointments" value={stats.appointments} tone="warn" />
          <StatsCard label="Career Applications" value={stats.careerApplications} />
          <StatsCard label="Converted Leads" value={stats.converted} tone="brand" />
          <StatsCard label="Pending Leads" value={stats.pending} />
        </div>
      )}
    </>
  );
}
