import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Bell, CheckCheck, FileText, XCircle } from 'lucide-react'

const notifications = [
  { id: 1, title: 'Leave approved', message: 'Your annual leave request for August 29 has been approved.', type: 'approve', time: '2h ago' },
  { id: 2, title: 'Leave rejected', message: 'Your sick leave request has been rejected due to missing certificate.', type: 'reject', time: '6h ago' },
  { id: 3, title: 'Attendance reminder', message: 'Please check in before 09:30 AM for the next shift.', type: 'reminder', time: '1d ago' },
  { id: 4, title: 'Payslip generated', message: 'Your August payslip is ready to download.', type: 'payroll', time: '2d ago' }
]

const iconMap = {
  approve: <CheckCheck className="text-dayflow-success" size={18} />,
  reject: <XCircle className="text-dayflow-danger" size={18} />,
  reminder: <Bell className="text-dayflow-warning" size={18} />,
  payroll: <FileText className="text-dayflow-blue" size={18} />
}

export function Notifications() {
  return (
    <AppLayout title="Notifications">
      <div className="space-y-6">
        <div className="section-header">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-dayflow-green">Inbox</div>
            <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-dayflow-text">Notifications</h2>
          </div>
          <button type="button" className="rounded-xl border border-dayflow-border bg-white px-4 py-2.5 text-sm font-medium text-dayflow-text">Mark all as read</button>
        </div>

        <Card className="p-4">
          <div className="space-y-3">
            {notifications.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-dayflow-border bg-dayflow-bg p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">{iconMap[item.type as keyof typeof iconMap]}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-dayflow-text">{item.title}</div>
                    {!item.id && <span className="h-2.5 w-2.5 rounded-full bg-dayflow-green" />}
                  </div>
                  <div className="mt-1 text-sm text-dayflow-muted">{item.message}</div>
                  <div className="mt-2 text-xs text-dayflow-muted">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
