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
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-xl font-semibold text-dayflow-text">Account settings</div>
          <div className="mt-4 text-sm text-dayflow-muted">Update your company and personal details.</div>
        </Card>
      </div>
    </AppLayout>
  )
}
