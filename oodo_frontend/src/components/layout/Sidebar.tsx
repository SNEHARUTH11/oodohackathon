import { Bell, Briefcase, CalendarDays, CreditCard, FolderKanban, Gauge, LogOut, Settings, ShieldCheck, UserRound, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import type { Role } from '../../types/auth'

const navSections = {
  employee: [
    { label: 'Dashboard', to: '/dashboard', icon: Gauge },
    { label: 'Attendance', to: '/attendance', icon: CalendarDays },
    { label: 'Time Off', to: '/time-off', icon: FolderKanban },
    { label: 'Payroll', to: '/my-payroll', icon: CreditCard },
    { label: 'My Profile', to: '/my-profile', icon: UserRound },
    { label: 'Notifications', to: '/notifications', icon: Bell }
  ],
  admin: [
    { label: 'Dashboard', to: '/dashboard', icon: Gauge },
    { label: 'Employees', to: '/employees', icon: Users },
    { label: 'Attendance', to: '/attendance', icon: CalendarDays },
    { label: 'Time Off', to: '/time-off', icon: FolderKanban },
    { label: 'Payroll', to: '/payroll', icon: CreditCard },
    { label: 'Reports', to: '/reports', icon: Briefcase }
  ],
  hr_officer: [
    { label: 'Dashboard', to: '/dashboard', icon: Gauge },
    { label: 'Employees', to: '/employees', icon: Users },
    { label: 'Attendance', to: '/attendance', icon: CalendarDays },
    { label: 'Time Off', to: '/time-off', icon: FolderKanban },
    { label: 'Payroll', to: '/payroll', icon: CreditCard },
    { label: 'Reports', to: '/reports', icon: Briefcase }
  ]
}

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dayflow-greenSoft text-lg font-bold text-dayflow-navy shadow-sm">D</div>
      <div>
        <div className="text-[20px] font-semibold tracking-[-0.04em] text-dayflow-text">DAYFLOW</div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-dayflow-muted">HR Management System</div>
      </div>
    </div>
  )
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const role = (user?.role ?? 'employee') as Role

  return (
    <aside className="flex h-screen w-[260px] flex-col border-r border-dayflow-border bg-white/95 px-4 py-5">
      <div className="mb-8"><BrandMark /></div>

      <nav className="flex-1 space-y-6">
        <div className="space-y-2">
          {navSections[role].map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive ? 'bg-dayflow-greenSoft text-dayflow-navy shadow-sm' : 'text-dayflow-muted hover:bg-dayflow-bg hover:text-dayflow-text'}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="space-y-2 border-t border-dayflow-border pt-5">
          <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive ? 'bg-dayflow-bg text-dayflow-text' : 'text-dayflow-muted hover:bg-dayflow-bg hover:text-dayflow-text'}`}>
            <Settings size={18} />
            Settings
          </NavLink>
          <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-dayflow-muted transition-all hover:bg-red-50 hover:text-red-600">
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </nav>

      <div className="rounded-2xl border border-dayflow-border bg-dayflow-bg p-3">
        <div className="flex items-center gap-3">
          <img src={user?.profile_picture || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'} alt={user?.name || 'User'} className="h-11 w-11 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-dayflow-text">{user?.name || 'Team Member'}</div>
            <div className="text-xs text-dayflow-muted">{user?.role === 'admin' ? 'Admin' : user?.role === 'hr_officer' ? 'HR Officer' : 'Employee'}</div>
          </div>
          <ShieldCheck className="h-4 w-4 text-dayflow-green" />
        </div>
      </div>
    </aside>
  )
}
