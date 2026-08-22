import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { leaveRequests, publicHolidays } from '../../data/mockData'

const statusClasses = {
  approved: 'bg-dayflow-greenSoft text-dayflow-success',
  pending: 'bg-amber-50 text-dayflow-warning',
  rejected: 'bg-red-50 text-red-600'
} as const

export function TimeOff() {
  const [open, setOpen] = useState(false)

  return (
    <AppLayout title="Time Off">
      <div className="space-y-6">
        <div className="section-header">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-dayflow-green">Leave management</div>
            <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-dayflow-text">Time Off</h2>
          </div>
          <Button onClick={() => setOpen(true)}><Plus size={16} className="mr-2" />NEW</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5"><div className="text-sm text-dayflow-muted">Paid Time Off</div><div className="mt-3 text-3xl font-semibold text-dayflow-text">12 days</div></Card>
          <Card className="p-5"><div className="text-sm text-dayflow-muted">Sick Leave</div><div className="mt-3 text-3xl font-semibold text-dayflow-text">8 days</div></Card>
          <Card className="p-5"><div className="text-sm text-dayflow-muted">Unpaid Leave</div><div className="mt-3 text-3xl font-semibold text-dayflow-text">2 days</div></Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
          <Card className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dayflow-text">This year</h3>
              <span className="text-sm text-dayflow-muted">January – December</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((month) => (
                <div key={month} className="rounded-2xl border border-dayflow-border bg-dayflow-bg p-4">
                  <div className="mb-3 text-sm font-medium text-dayflow-text">{month}</div>
                  <div className="space-y-2">
                    {leaveRequests.slice(0, 2).map((item) => (
                      <div key={item.id} className="rounded-xl bg-white px-2 py-2 text-xs text-dayflow-muted border border-dayflow-border">
                        <div className="flex items-center justify-between"><span>{item.leave_type}</span><span className={`rounded-full px-2 py-0.5 ${statusClasses[item.status]}`}>{item.status}</span></div>
                        <div className="mt-1">{item.start_date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dayflow-text">Public holidays</h3>
            </div>
            <div className="space-y-3">
              {publicHolidays.map((holiday) => (
                <div key={holiday.id} className="flex items-center justify-between rounded-xl border border-dashed border-dayflow-border bg-dayflow-bg px-3 py-3 text-sm">
                  <div>
                    <div className="font-medium text-dayflow-text">{holiday.name}</div>
                    <div className="text-dayflow-muted">{holiday.date}</div>
                  </div>
                  <div className="rounded-full bg-dayflow-blueSoft px-2 py-1 text-xs font-medium text-dayflow-blue">Holiday</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Create time off request">
        <form className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-dayflow-border bg-dayflow-bg p-3 text-sm text-dayflow-text">Employee <span className="font-medium">Aisha Khan</span></div>
            <div className="rounded-xl border border-dayflow-border bg-dayflow-bg p-3 text-sm text-dayflow-text">Type <span className="font-medium">Paid Time Off</span></div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input className="h-11 rounded-xl border border-dayflow-border bg-white px-3 text-sm outline-none focus:border-dayflow-green" type="date" />
            <input className="h-11 rounded-xl border border-dayflow-border bg-white px-3 text-sm outline-none focus:border-dayflow-green" type="date" />
          </div>
          <textarea className="min-h-[100px] w-full rounded-xl border border-dayflow-border bg-white px-3 py-2 text-sm outline-none focus:border-dayflow-green" placeholder="Remarks" />
          <div className="rounded-xl border border-dashed border-dayflow-border bg-dayflow-bg p-3 text-sm text-dayflow-muted">Attachment: certificate.pdf</div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Discard</Button>
            <Button type="button">Submit</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  )
}
