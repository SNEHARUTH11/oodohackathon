import { Bell, ChevronDown, Search } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export function Header({ title }: { title: string }) {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-20 border-b border-dayflow-border bg-white/80 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between gap-4 px-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.04em] text-dayflow-text">{title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-xl border border-dayflow-border bg-dayflow-bg px-3 py-2 text-sm text-dayflow-muted md:flex">
            <Search size={16} />
            <input aria-label="Search" placeholder="Search" className="w-40 bg-transparent text-sm text-dayflow-text outline-none placeholder:text-dayflow-muted" />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-dayflow-border bg-dayflow-bg px-3 py-2">
            <span className="status-dot bg-red-500" />
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-dayflow-muted">Not checked in</span>
          </div>

          <button type="button" aria-label="Notifications" className="relative rounded-xl border border-dayflow-border bg-white p-2.5 text-dayflow-muted transition hover:bg-dayflow-bg">
            <Bell size={18} />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-dayflow-green" />
          </button>

          <div className="flex items-center gap-3 rounded-xl border border-dayflow-border bg-white px-2 py-1.5">
            <img src={user?.profile_picture || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'} alt={user?.name || 'User'} className="h-10 w-10 rounded-xl object-cover" />
            <div className="hidden text-left md:block">
              <div className="text-sm font-semibold text-dayflow-text">{user?.name || 'Aisha Khan'}</div>
              <div className="text-[11px] text-dayflow-muted">{user?.role === 'admin' ? 'Admin' : user?.role === 'hr_officer' ? 'HR Officer' : 'Employee'}</div>
            </div>
            <ChevronDown size={16} className="text-dayflow-muted" />
          </div>
        </div>
      </div>
    </header>
  )
}
