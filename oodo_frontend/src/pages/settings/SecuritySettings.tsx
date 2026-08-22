import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Link } from 'react-router-dom'

export function SecuritySettings() {
  return (
    <AppLayout title="Security Settings">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <Card className="p-4">
          <div className="space-y-2">
            <Link to="/settings/account" className="block rounded-xl px-3 py-2 text-sm font-medium text-dayflow-text hover:bg-dayflow-bg">My Account</Link>
            <Link to="/settings/security" className="block rounded-xl bg-dayflow-bg px-3 py-2 text-sm font-medium text-dayflow-text">Security</Link>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6">
            <div className="text-xl font-semibold text-dayflow-text">Security</div>
            <div className="text-sm text-dayflow-muted">Update your password and authentication preferences.</div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Current Password" type="password" value="••••••••" />
            <Input label="New Password" type="password" value="••••••••" />
            <Input label="Confirm New Password" type="password" value="••••••••" className="md:col-span-2" />
          </div>

          <div className="mt-6 space-y-4">
            {[
              { label: 'Primary Email', enabled: true },
              { label: 'SMS Authentication', enabled: true },
              { label: 'Backup Codes', enabled: false }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-dayflow-border bg-dayflow-bg px-4 py-3">
                <span className="text-sm font-medium text-dayflow-text">{item.label}</span>
                <span className={`inline-flex h-6 w-11 items-center rounded-full ${item.enabled ? 'bg-dayflow-green' : 'bg-slate-200'} p-1`}>
                  <span className={`h-4 w-4 rounded-full bg-white transition ${item.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary">Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
