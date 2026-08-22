import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Link } from 'react-router-dom'

export function AccountSettings() {
  return (
    <AppLayout title="Account Settings">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <Card className="p-4">
          <div className="space-y-2">
            <Link to="/settings/account" className="block rounded-xl bg-dayflow-bg px-3 py-2 text-sm font-medium text-dayflow-text">My Account</Link>
            <Link to="/settings/security" className="block rounded-xl px-3 py-2 text-sm font-medium text-dayflow-text hover:bg-dayflow-bg">Security</Link>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <div className="text-xl font-semibold text-dayflow-text">Basic account information</div>
              <div className="text-sm text-dayflow-muted">Keep your profile current and accurate.</div>
            </div>
            <Link to="/my-profile" className="text-sm font-medium text-dayflow-green">View My Profile</Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Name" value="Aisha Khan" />
            <Input label="Email" value="aisha@dayflow.io" />
            <Input label="Phone" value="+91 98765 43210" />
            <Input label="Profile picture" value="aisha.png" />
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
