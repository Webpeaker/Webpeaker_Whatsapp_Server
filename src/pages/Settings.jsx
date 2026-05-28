import { CheckCircle2, CircleAlert } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';

function ChecklistItem({ label, value, ready }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-4 last:border-0">
      <div>
        <div className="font-medium text-white">{label}</div>
        <div className="mt-1 break-all text-sm text-slate-400">{value || 'Not configured in frontend environment'}</div>
      </div>
      {ready ? <CheckCircle2 className="h-5 w-5 shrink-0 text-brand" /> : <CircleAlert className="h-5 w-5 shrink-0 text-amber-300" />}
    </div>
  );
}

export default function Settings() {
  const prodUrl = import.meta.env.VITE_PROD_URL || window.location.origin;
  const items = [
    { label: 'WhatsApp Phone Number ID', value: import.meta.env.VITE_META_WA_PHONE_NUMBER_ID, ready: Boolean(import.meta.env.VITE_META_WA_PHONE_NUMBER_ID) },
    { label: 'Admin WhatsApp Number', value: import.meta.env.VITE_ADMIN_PHONE_NUMBER, ready: Boolean(import.meta.env.VITE_ADMIN_PHONE_NUMBER) },
    { label: 'Supabase connected status', value: import.meta.env.VITE_SUPABASE_URL ? 'Configured' : '', ready: Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) },
    { label: 'Webhook URL', value: `${prodUrl}/api/whatsapp`, ready: Boolean(prodUrl) },
  ];

  return (
    <>
      <PageHeader title="Settings" subtitle="Deployment and integration checklist for the Webpeaker bot." />
      <section className="rounded-lg border border-line bg-panel p-5">
        {items.map((item) => <ChecklistItem key={item.label} {...item} />)}
      </section>
      <section className="mt-5 rounded-lg border border-line bg-panel p-5">
        <h2 className="font-semibold text-white">Environment safety</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          The frontend only uses public `VITE_` values. Keep `SUPABASE_SERVICE_ROLE_KEY` and `META_WA_ACCESS_TOKEN` in Vercel server environment variables only.
        </p>
      </section>
    </>
  );
}
