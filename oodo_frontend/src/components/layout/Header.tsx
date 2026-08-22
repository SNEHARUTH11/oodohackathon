import { ChevronDown, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { attendanceService } from '../../services/attendanceService'

export function Header({ title }: { title: string }) {
  const { user } = useAuth()
  const [todayState, setTodayState] = useState<{ checked_in?: boolean; can_check_in?: boolean; can_check_out?: boolean } | null>(null)

  const loadTodayState = async () => {
    try {
      const state = await attendanceService.getTodayState()
      setTodayState(state ?? null)
    } catch {
      setTodayState(null)
    }
  }

  useEffect(() => {
    void loadTodayState()
  }, [])

  const isCheckedIn = Boolean(todayState?.checked_in)
  const handleQuickCheckIn = async () => {
    try {
      if (todayState?.can_check_out) {
        await attendanceService.checkOut()
      } else if (todayState?.can_check_in ?? true) {
        await attendanceService.checkIn()
      }
      await loadTodayState()
    } catch {
      await loadTodayState()
    }
  }

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

          <button type="button" onClick={() => void handleQuickCheckIn()} className="flex items-center gap-3 rounded-xl border border-dayflow-border bg-dayflow-bg px-3 py-2 transition hover:bg-dayflow-bg/80">
            <span className={`h-2.5 w-2.5 rounded-full ${isCheckedIn ? 'bg-dayflow-green' : 'bg-red-500'}`} />
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-dayflow-muted">{isCheckedIn ? 'Checked in' : 'Check in'}</span>
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
