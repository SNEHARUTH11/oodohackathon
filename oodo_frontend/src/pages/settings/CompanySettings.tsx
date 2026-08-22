import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Link } from 'react-router-dom'

export function CompanySettings() {
  return (
    <AppLayout title="Company Settings">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <Card className="p-4">
          <div className="space-y-2">
            <Link to="/settings/account" className="block rounded-xl px-3 py-2 text-sm font-medium text-dayflow-text hover:bg-dayflow-bg">My Account</Link>
            <Link to="/settings/security" className="block rounded-xl px-3 py-2 text-sm font-medium text-dayflow-text hover:bg-dayflow-bg">Security</Link>
            <Link to="/settings/notifications" className="block rounded-xl px-3 py-2 text-sm font-medium text-dayflow-text hover:bg-dayflow-bg">Notifications</Link>
            <Link to="/settings/company" className="block rounded-xl bg-dayflow-bg px-3 py-2 text-sm font-medium text-dayflow-text">Company</Link>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-6">
              <div className="text-xl font-semibold text-dayflow-text">Company Profile</div>
              <div className="text-sm text-dayflow-muted">Manage organization settings and branding.</div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Company Name" defaultValue="Dayflow HR" />
              <Input label="Business Email" defaultValue="hello@dayflow.com" />
              <Input label="Phone Number" defaultValue="(555) 123-4567" />
              <Input label="Country" defaultValue="United States" />
              <Input label="Timezone" defaultValue="UTC-05:00" className="md:col-span-2" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-xl font-semibold text-dayflow-text">Branding</div>
            <div className="mt-3 text-sm text-dayflow-muted">Update your brand details used across the product.</div>

            <div className="mt-6 flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl border border-dayflow-border bg-slate-100" />
              <Button variant="secondary">Upload Logo</Button>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
