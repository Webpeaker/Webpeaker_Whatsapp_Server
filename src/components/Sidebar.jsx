import { BriefcaseBusiness, CalendarClock, LayoutDashboard, Settings, UsersRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: UsersRound },
  { href: '/appointments', label: 'Appointments', icon: CalendarClock },
  { href: '/career', label: 'Career', icon: BriefcaseBusiness },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-line bg-panel/95 px-4 py-5 lg:block">
      <div className="mb-8 px-3">
        <div className="text-xl font-semibold tracking-wide text-white">Webpeaker</div>
        <div className="text-sm text-slate-400">LeadBot CRM</div>
      </div>
      <nav className="space-y-1">
        {nav.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                isActive ? 'bg-brand/15 text-brand' : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
