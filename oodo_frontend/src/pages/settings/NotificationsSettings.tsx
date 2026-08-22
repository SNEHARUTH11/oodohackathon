import { useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Link } from 'react-router-dom'

export function NotificationsSettings() {
  const [settings, setSettings] = useState({
    email: true,
    push: true,
    weeklySummary: false,
    taskReminders: true,
  })

  const toggle = (key: keyof typeof settings) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }))
  }

  return (
    <AppLayout title="Notifications Settings">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <Card className="p-4">
          <div className="space-y-2">
            <Link to="/settings/account" className="block rounded-xl px-3 py-2 text-sm font-medium text-dayflow-text hover:bg-dayflow-bg">My Account</Link>
            <Link to="/settings/security" className="block rounded-xl px-3 py-2 text-sm font-medium text-dayflow-text hover:bg-dayflow-bg">Security</Link>
            <Link to="/settings/notifications" className="block rounded-xl bg-dayflow-bg px-3 py-2 text-sm font-medium text-dayflow-text">Notifications</Link>
            <Link to="/settings/company" className="block rounded-xl px-3 py-2 text-sm font-medium text-dayflow-text hover:bg-dayflow-bg">Company</Link>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6">
            <div className="text-xl font-semibold text-dayflow-text">Notifications</div>
            <div className="text-sm text-dayflow-muted">Choose which updates you want to receive.</div>
          </div>

          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email notifications', description: 'Receive updates and reminders by email.' },
              { key: 'push', label: 'Push notifications', description: 'Get instant alerts in the app.' },
              { key: 'weeklySummary', label: 'Weekly summary', description: 'Receive a summary of the week every Friday.' },
              { key: 'taskReminders', label: 'Task reminders', description: 'Reminders for upcoming approvals and deadlines.' },
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between rounded-2xl border border-dayflow-border bg-white p-4">
                <div>
                  <div className="font-medium text-dayflow-text">{label}</div>
                  <div className="text-sm text-dayflow-muted">{description}</div>
                </div>

                <button
                  type="button"
                  aria-label={label}
                  onClick={() => toggle(key as keyof typeof settings)}
                  className={`inline-flex h-6 w-11 items-center rounded-full p-1 transition ${settings[key as keyof typeof settings] ? 'bg-dayflow-green' : 'bg-slate-200'}`}
                >
                  <span className={`h-4 w-4 rounded-full bg-white transition ${settings[key as keyof typeof settings] ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary">Cancel</Button>
            <Button>Save Preferences</Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
