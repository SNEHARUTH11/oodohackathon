import { Activity, ArrowUpRight, BriefcaseBusiness, CalendarCheck2, CreditCard, Users } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/dashboard/StatCard'

const attendanceTrend = [
  { name: 'Mon', present: 42, absent: 8 },
  { name: 'Tue', present: 44, absent: 7 },
  { name: 'Wed', present: 40, absent: 9 },
  { name: 'Thu', present: 46, absent: 5 },
  { name: 'Fri', present: 43, absent: 6 },
  { name: 'Sat', present: 18, absent: 10 }
]

const leaveSeries = [
  { name: 'Paid', value: 24 },
  { name: 'Sick', value: 8 },
  { name: 'Unpaid', value: 6 }
]

export function AdminDashboard() {
  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-dayflow-green">Operations overview</div>
            <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-dayflow-text">Everything is running smoothly.</h2>
          </div>
          <div className="rounded-xl border border-dayflow-border bg-white px-3 py-2 text-sm text-dayflow-muted">Updated 5 mins ago</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total employees" value="128" subtitle="Across 5 teams" icon={<Users size={20} />} accent="bg-dayflow-blueSoft" />
          <StatCard title="Present today" value="94" subtitle="73% attendance" icon={<CalendarCheck2 size={20} />} accent="bg-dayflow-greenSoft" />
          <StatCard title="Leave requests" value="12" subtitle="3 pending" icon={<BriefcaseBusiness size={20} />} accent="bg-amber-50" />
          <StatCard title="Payroll" value="₹4.8L" subtitle="This month" icon={<CreditCard size={20} />} accent="bg-violet-50" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <Card className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dayflow-text">Attendance analytics</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-dayflow-greenSoft px-2.5 py-1 text-xs font-medium text-dayflow-success"><ArrowUpRight size={12} /> +8.2%</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceTrend}>
                  <CartesianGrid stroke="#E7EAF0" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#667085', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#667085', fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="present" fill="#18D98B" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="absent" fill="#EAF8FF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dayflow-text">Leave summary</h3>
            </div>
            <div className="space-y-4">
              {leaveSeries.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dayflow-muted">{item.name}</span>
                    <span className="font-semibold text-dayflow-text">{item.value} days</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-dayflow-bg">
                    <div className="h-full rounded-full bg-dayflow-green" style={{ width: `${(item.value / 30) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dayflow-text">Payroll overview</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[{name:'Jan', value: 3.8},{name:'Feb', value: 4.1},{name:'Mar', value: 4.3},{name:'Apr', value: 4.5},{name:'May', value: 4.6},{name:'Jun', value: 4.8}]}> 
                  <defs>
                    <linearGradient id="payrollFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#55BCEB" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#55BCEB" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E7EAF0" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#667085', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#667085', fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#55BCEB" strokeWidth={3} fill="url(#payrollFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dayflow-text">Recent activity</h3>
            </div>
            <div className="space-y-3">
              {[{ title: 'Aisha requested sick leave', time: '15 mins ago' }, { title: 'Rohit generated payroll', time: '1 hour ago' }, { title: 'New employee onboarded', time: '2 hours ago' }].map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-xl border border-dayflow-border bg-dayflow-bg p-3">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-dayflow-greenSoft text-dayflow-green"><Activity size={14} /></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-dayflow-text">{item.title}</div>
                    <div className="text-xs text-dayflow-muted">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
