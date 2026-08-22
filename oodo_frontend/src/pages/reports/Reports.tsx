import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const attendanceTrend = [
  { name: 'Jan', present: 85, absent: 15 },
  { name: 'Feb', present: 88, absent: 12 },
  { name: 'Mar', present: 79, absent: 21 },
  { name: 'Apr', present: 90, absent: 10 },
  { name: 'May', present: 86, absent: 14 }
]

const leaveData = [
  { name: 'Paid', value: 45 },
  { name: 'Sick', value: 20 },
  { name: 'Unpaid', value: 15 }
]

const payrollData = [
  { name: 'Jan', total: 3.6 },
  { name: 'Feb', total: 3.8 },
  { name: 'Mar', total: 4.1 },
  { name: 'Apr', total: 4.5 },
  { name: 'May', total: 4.9 }
]

export function Reports() {
  return (
    <AppLayout title="Reports">
      <div className="space-y-6">
        <div className="section-header">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-dayflow-green">Analytics</div>
            <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-dayflow-text">Performance and trends</h2>
          </div>
          <button type="button" className="rounded-xl border border-dayflow-border bg-white px-4 py-2.5 text-sm font-medium text-dayflow-text">Export</button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="text-xl font-semibold text-dayflow-text">Attendance trend</h3>
            <div className="mt-5 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceTrend}>
                  <CartesianGrid stroke="#E7EAF0" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#667085', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#667085', fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="present" fill="#18D98B" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="absent" fill="#55BCEB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-xl font-semibold text-dayflow-text">Present vs absent</h3>
            <div className="mt-5 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{ name: 'Present', value: 82 }, { name: 'Absent', value: 18 }]} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} fill="#18D98B" />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="text-xl font-semibold text-dayflow-text">Leave type distribution</h3>
            <div className="mt-5 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leaveData}>
                  <CartesianGrid stroke="#E7EAF0" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#667085', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#667085', fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-xl font-semibold text-dayflow-text">Payroll overview</h3>
            <div className="mt-5 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payrollData}>
                  <CartesianGrid stroke="#E7EAF0" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#667085', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#667085', fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#55BCEB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
