import { ArrowRight, BriefcaseBusiness, CalendarCheck2, Clock3, Download, UserRound, WalletCards } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/dashboard/StatCard'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency } from '../../utils/formatters'

const weekly = [
  { name: 'Mon', hours: 8.2 },
  { name: 'Tue', hours: 7.5 },
  { name: 'Wed', hours: 8.8 },
  { name: 'Thu', hours: 8.1 },
  { name: 'Fri', hours: 9.1 },
  { name: 'Sat', hours: 2.5 },
  { name: 'Sun', hours: 0 }
]

const monthly = [
  { name: 'Jan', value: 140 },
  { name: 'Feb', value: 160 },
  { name: 'Mar', value: 150 },
  { name: 'Apr', value: 178 },
  { name: 'May', value: 185 },
  { name: 'Jun', value: 170 },
  { name: 'Jul', value: 188 },
  { name: 'Aug', value: 195 }
]

export function EmployeeDashboard() {
  const { user } = useAuth()

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-dayflow-green">Good morning, {user?.name?.split(' ')[0] || 'Team'} 👋</div>
            <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-dayflow-text">Here’s what’s happening with your workday.</h2>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">Request Leave</Button>
            <Button>View Payslip</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Attendance" value="Checked in" subtitle="Current status" icon={<CalendarCheck2 size={20} />} accent="bg-dayflow-greenSoft" />
          <StatCard title="Leave Balance" value="12 days" subtitle="2 paid / 1 sick" icon={<BriefcaseBusiness size={20} />} accent="bg-dayflow-blueSoft" />
          <StatCard title="Monthly Salary" value={formatCurrency(75000)} subtitle="Net monthly pay" icon={<WalletCards size={20} />} accent="bg-violet-50" />
          <StatCard title="Work Hours" value="42.5 hrs" subtitle="Target: 40 hrs" icon={<Clock3 size={20} />} accent="bg-amber-50" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-dayflow-text">Weekly attendance</h3>
              </div>
              <span className="rounded-full bg-dayflow-greenSoft px-2.5 py-1 text-xs font-medium text-dayflow-success">On track</span>
            </div>
            <div className="space-y-3">
              {weekly.map((day) => (
                <div key={day.name} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-medium text-dayflow-muted">{day.name}</div>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-dayflow-bg">
                    <div className="h-full rounded-full bg-dayflow-green" style={{ width: `${(day.hours / 9) * 100}%` }} />
                  </div>
                  <div className="w-12 text-right text-sm font-medium text-dayflow-text">{day.hours}h</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-dayflow-text">Upcoming leave</h3>
              </div>
              <ArrowRight size={18} className="text-dayflow-muted" />
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-dayflow-border bg-dayflow-bg p-4">
                <div className="text-sm text-dayflow-muted">Sick leave</div>
                <div className="mt-1 text-lg font-semibold text-dayflow-text">Aug 22, 2026</div>
                <div className="mt-2 text-sm text-dayflow-muted">1 day · Certificate required</div>
              </div>
              <div className="rounded-2xl border border-dayflow-border bg-dayflow-bg p-4">
                <div className="text-sm text-dayflow-muted">Annual leave</div>
                <div className="mt-1 text-lg font-semibold text-dayflow-text">Aug 29 — Sep 02</div>
                <div className="mt-2 text-sm text-dayflow-muted">5 days · Approved</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <Card className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dayflow-text">Monthly attendance</h3>
              <span className="text-sm text-dayflow-muted">This year</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="attendanceFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#18D98B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#18D98B" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E7EAF0" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#667085', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#667085', fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#18D98B" strokeWidth={3} fill="url(#attendanceFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dayflow-text">Quick actions</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Request Leave', icon: <BriefcaseBusiness size={18} /> },
                { label: 'View Payslip', icon: <Download size={18} /> },
                { label: 'Mark Attendance', icon: <CalendarCheck2 size={18} /> },
                { label: 'My Profile', icon: <UserRound size={18} /> }
              ].map((action) => (
                <button key={action.label} type="button" className="flex w-full items-center justify-between rounded-xl border border-dayflow-border bg-dayflow-bg px-4 py-3 text-left text-sm font-medium text-dayflow-text transition hover:border-dayflow-green/50 hover:bg-dayflow-greenSoft">
                  <span className="flex items-center gap-3">{action.icon}{action.label}</span>
                  <ArrowRight size={16} className="text-dayflow-muted" />
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dayflow-text">Recent notifications</h3>
              <button type="button" className="text-sm font-medium text-dayflow-green">View all</button>
            </div>
            <div className="space-y-3">
              {[
                { title: 'Leave approved', detail: 'Your annual leave request has been approved.' },
                { title: 'Payslip ready', detail: 'Your August payslip is ready to view.' },
                { title: 'Attendance reminder', detail: 'Please check in before 09:30 AM.' }
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-xl border border-dayflow-border bg-dayflow-bg p-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-dayflow-green" />
                  <div>
                    <div className="text-sm font-semibold text-dayflow-text">{item.title}</div>
                    <div className="text-sm text-dayflow-muted">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dayflow-text">Attendance summary</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-dayflow-bg p-3"><span>Present</span><span className="font-semibold text-dayflow-success">18</span></div>
              <div className="flex items-center justify-between rounded-xl bg-dayflow-bg p-3"><span>Absent</span><span className="font-semibold text-dayflow-danger">2</span></div>
              <div className="flex items-center justify-between rounded-xl bg-dayflow-bg p-3"><span>Half Day</span><span className="font-semibold text-dayflow-warning">1</span></div>
              <div className="flex items-center justify-between rounded-xl bg-dayflow-bg p-3"><span>Leave</span><span className="font-semibold text-dayflow-blue">3</span></div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
