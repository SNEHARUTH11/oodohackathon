import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { attendance } from '../../data/mockData'

const markStatusColor = {
  Present: 'bg-dayflow-greenSoft text-dayflow-success',
  Absent: 'bg-red-50 text-red-600',
  'Half Day': 'bg-amber-50 text-dayflow-warning',
  Leave: 'bg-blue-50 text-dayflow-blue'
} as const

export function Attendance() {
  const [, setMonthIndex] = useState(7)

  return (
    <AppLayout title="Attendance">
      <div className="space-y-6">
        <div className="section-header">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-dayflow-green">Track time</div>
            <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-dayflow-text">Track your attendance and working hours.</h2>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-dayflow-border bg-white px-3 py-2">
            <button type="button" onClick={() => setMonthIndex((value) => value - 1)} className="rounded-lg p-2 hover:bg-dayflow-bg"><ChevronLeft size={16} /></button>
            <div className="flex items-center gap-2 text-sm font-medium text-dayflow-text"><CalendarDays size={16} /> Aug 2026</div>
            <button type="button" onClick={() => setMonthIndex((value) => value + 1)} className="rounded-lg p-2 hover:bg-dayflow-bg"><ChevronRight size={16} /></button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5"><div className="text-sm text-dayflow-muted">Present Days</div><div className="mt-3 text-3xl font-semibold text-dayflow-text">18</div></Card>
          <Card className="p-5"><div className="text-sm text-dayflow-muted">Leave Days</div><div className="mt-3 text-3xl font-semibold text-dayflow-text">3</div></Card>
          <Card className="p-5"><div className="text-sm text-dayflow-muted">Working Days</div><div className="mt-3 text-3xl font-semibold text-dayflow-text">22</div></Card>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-dayflow-bg text-sm text-dayflow-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Check In</th>
                  <th className="px-4 py-3 font-medium">Check Out</th>
                  <th className="px-4 py-3 font-medium">Work Hours</th>
                  <th className="px-4 py-3 font-medium">Extra Hours</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((entry) => (
                  <tr key={entry.id} className="border-t border-dayflow-border text-sm">
                    <td className="px-4 py-4 text-dayflow-text">{entry.date}</td>
                    <td className="px-4 py-4 text-dayflow-muted">{entry.check_in || '—'}</td>
                    <td className="px-4 py-4 text-dayflow-muted">{entry.check_out || '—'}</td>
                    <td className="px-4 py-4 text-dayflow-text">{entry.work_hours || 0}h</td>
                    <td className="px-4 py-4 text-dayflow-text">{entry.extra_hours || 0}h</td>
                    <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${markStatusColor[entry.status]}`}>{entry.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
