import { LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const mobileLinks = [
  ['/', 'Dashboard'],
  ['/leads', 'Leads'],
  ['/appointments', 'Calls'],
  ['/career', 'Career'],
  ['/settings', 'Settings'],
];

export default function Navbar() {
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/90 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="lg:hidden">
          <div className="font-semibold text-white">Webpeaker LeadBot CRM</div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
            {mobileLinks.map(([href, label]) => (
              <NavLink
                key={href}
                to={href}
                end={href === '/'}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-xs ${isActive ? 'bg-brand text-ink' : 'bg-panel text-slate-300'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="hidden text-sm text-slate-400 lg:block">WhatsApp lead capture and CRM dashboard</div>
        <button
          type="button"
          onClick={signOut}
          className="focus-ring inline-flex items-center gap-2 rounded-lg border border-line bg-panelSoft px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </header>
  );
}
