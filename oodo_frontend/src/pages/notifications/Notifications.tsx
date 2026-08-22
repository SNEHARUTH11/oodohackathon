import { useEffect, useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Bell, CheckCheck, FileText, XCircle } from 'lucide-react'
import { notificationService } from '../../services/notificationService'

const iconMap = {
  approve: <CheckCheck className="text-dayflow-success" size={18} />,
  reject: <XCircle className="text-dayflow-danger" size={18} />,
  reminder: <Bell className="text-dayflow-warning" size={18} />,
  payroll: <FileText className="text-dayflow-blue" size={18} />
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Array<{ id: string; title?: string; message?: string; type?: string; created_at?: string; is_read?: boolean }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    const loadNotifications = async () => {
      try {
        const data = await notificationService.getNotifications()
        if (!ignore) setNotifications(Array.isArray(data) ? data : [])
      } catch {
        if (!ignore) setNotifications([])
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    void loadNotifications()
    return () => {
      ignore = true
    }
  }, [])

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
          {loading ? (
            <div className="px-2 py-6 text-sm text-dayflow-muted">Loading notifications…</div>
          ) : (
            <div className="space-y-3">
              {notifications.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-dayflow-border bg-dayflow-bg p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">{iconMap[(item.type as keyof typeof iconMap) ?? 'reminder'] ?? iconMap.reminder}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-dayflow-text">{item.title ?? 'Notification'}</div>
                      {!item.is_read && <span className="h-2.5 w-2.5 rounded-full bg-dayflow-green" />}
                    </div>
                    <div className="mt-1 text-sm text-dayflow-muted">{item.message ?? 'No details available.'}</div>
                    <div className="mt-2 text-xs text-dayflow-muted">{item.created_at ?? 'Recently'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  )
}
