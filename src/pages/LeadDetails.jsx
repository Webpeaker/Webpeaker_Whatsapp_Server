import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { supabase } from '../lib/supabase';

export default function LeadDetails() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [notes, setNotes] = useState([]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [leadResult, notesResult] = await Promise.all([
      supabase.from('leads').select('*').eq('id', id).single(),
      supabase.from('admin_notes').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
    ]);
    if (leadResult.error) setError(leadResult.error.message);
    else setLead(leadResult.data);
    if (!notesResult.error) setNotes(notesResult.data || []);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(event) {
    const nextStatus = event.target.value;
    const { error: updateError } = await supabase.from('leads').update({ status: nextStatus }).eq('id', id).select().single();
    if (updateError) setError(updateError.message);
    else setLead((current) => ({ ...current, status: nextStatus }));
  }

  async function addNote(event) {
    event.preventDefault();
    if (!note.trim()) return;
    const { data: userData } = await supabase.auth.getUser();
    const { error: insertError } = await supabase.from('admin_notes').insert({
      lead_id: id,
      note,
      created_by: userData.user?.email || 'admin',
    });
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setNote('');
    load();
  }

  if (!lead && !error) return <div className="text-slate-400">Loading lead...</div>;

  return (
    <>
      <Link to="/leads" className="mb-4 inline-flex items-center gap-2 text-sm text-brand hover:text-brand/80">
        <ArrowLeft className="h-4 w-4" />
        Back to leads
      </Link>
      <PageHeader title="Lead Details" subtitle="Customer requirement, status, and internal team notes." />
      {error ? <div className="mb-4 rounded-md border border-rose-400/30 bg-rose-400/10 p-3 text-rose-100">{error}</div> : null}
      {lead ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <section className="rounded-lg border border-line bg-panel p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">{lead.name || 'Customer'}</h2>
                <p className="text-sm text-slate-400">{lead.phone}</p>
              </div>
              <StatusBadge status={lead.status} />
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div><dt className="text-sm text-slate-500">Service</dt><dd className="mt-1 text-white">{lead.service || '-'}</dd></div>
              <div><dt className="text-sm text-slate-500">Lead Type</dt><dd className="mt-1 text-white">{lead.lead_type}</dd></div>
              <div><dt className="text-sm text-slate-500">Source</dt><dd className="mt-1 text-white">{lead.source}</dd></div>
              <div><dt className="text-sm text-slate-500">Created</dt><dd className="mt-1 text-white">{new Date(lead.created_at).toLocaleString()}</dd></div>
            </dl>
            <div className="mt-6">
              <div className="text-sm text-slate-500">Full Message</div>
              <p className="mt-2 whitespace-pre-wrap rounded-lg border border-line bg-ink p-4 text-slate-200">{lead.message}</p>
            </div>
          </section>
          <aside className="space-y-5">
            <div className="rounded-lg border border-line bg-panel p-5">
              <label className="block text-sm text-slate-300">Update status</label>
              <select value={lead.status || 'new'} onChange={updateStatus} className="focus-ring mt-2 w-full rounded-lg border border-line bg-ink px-3 py-2 text-white">
                {['new', 'contacted', 'in_discussion', 'converted', 'rejected', 'completed'].map((item) => (
                  <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>
                ))}
              </select>
            </div>
            <form onSubmit={addNote} className="rounded-lg border border-line bg-panel p-5">
              <label className="block text-sm text-slate-300">Add internal note</label>
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows="4" className="focus-ring mt-2 w-full rounded-lg border border-line bg-ink px-3 py-2 text-white" />
              <button className="focus-ring mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-ink">Add note</button>
            </form>
            <div className="rounded-lg border border-line bg-panel p-5">
              <h3 className="font-semibold text-white">Admin notes</h3>
              <div className="mt-3 space-y-3">
                {notes.map((item) => (
                  <div key={item.id} className="rounded-md bg-ink p-3">
                    <p className="whitespace-pre-wrap text-sm text-slate-200">{item.note}</p>
                    <p className="mt-2 text-xs text-slate-500">{item.created_by} - {new Date(item.created_at).toLocaleString()}</p>
                  </div>
                ))}
                {!notes.length ? <p className="text-sm text-slate-500">No notes yet.</p> : null}
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
