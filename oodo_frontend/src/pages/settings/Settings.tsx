import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Link } from 'react-router-dom'

export function Settings() {
  return (
    <AppLayout title="Settings">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <Card className="p-4">
          <div className="space-y-2">
            <Link to="/settings/account" className="block rounded-xl px-3 py-2 text-sm font-medium text-dayflow-text hover:bg-dayflow-bg">My Account</Link>
            <Link to="/settings/security" className="block rounded-xl px-3 py-2 text-sm font-medium text-dayflow-text hover:bg-dayflow-bg">Security</Link>
            <Link to="/settings/notifications" className="block rounded-xl px-3 py-2 text-sm font-medium text-dayflow-text hover:bg-dayflow-bg">Notifications</Link>
            <Link to="/settings/company" className="block rounded-xl px-3 py-2 text-sm font-medium text-dayflow-text hover:bg-dayflow-bg">Company</Link>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="text-xl font-semibold text-dayflow-text">Settings</div>
            <div className="mt-2 text-sm text-dayflow-muted">Manage account, security, notifications and company preferences from a single place.</div>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <div className="text-lg font-semibold text-dayflow-text">Quick Preferences</div>
              <div className="mt-4 space-y-3 text-sm text-dayflow-muted">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-dayflow-text">Email Notifications</div>
                    <div className="text-xs text-dayflow-muted">Receive email for approvals and updates</div>
                  </div>
                  <div className="inline-flex h-6 w-11 items-center rounded-full bg-dayflow-green p-1">
                    <span className="h-4 w-4 rounded-full bg-white translate-x-5" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-dayflow-text">Weekly Summary</div>
                    <div className="text-xs text-dayflow-muted">Weekly roundup of activity</div>
                  </div>
                  <div className="inline-flex h-6 w-11 items-center rounded-full bg-slate-200 p-1">
                    <span className="h-4 w-4 rounded-full bg-white" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-lg font-semibold text-dayflow-text">Company</div>
              <div className="mt-4 text-sm text-dayflow-muted">Company-level settings and branding.</div>
              <div className="mt-4">
                <div className="text-sm text-dayflow-muted">Logo</div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg border border-dayflow-border bg-white" />
                  <button className="rounded-md border px-3 py-1 text-sm">Upload</button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
