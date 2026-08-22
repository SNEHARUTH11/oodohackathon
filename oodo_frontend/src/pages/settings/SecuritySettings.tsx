import { useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Link } from 'react-router-dom'
import { authService } from '../../services/authService'

export function SecuritySettings() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const save = async () => {
    setMessage(null)
    setLoading(true)
    try {
      await authService.changePassword(current, next, confirm)
      setMessage('Password updated successfully. Please sign in again.')
    } catch (err: any) {
      setMessage(err?.message ?? 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout title="Security Settings">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <Card className="p-4">
          <div className="space-y-2">
            <Link to="/settings/account" className="block rounded-xl px-3 py-2 text-sm font-medium text-dayflow-text hover:bg-dayflow-bg">My Account</Link>
            <Link to="/settings/security" className="block rounded-xl bg-dayflow-bg px-3 py-2 text-sm font-medium text-dayflow-text">Security</Link>
            <Link to="/settings/notifications" className="block rounded-xl px-3 py-2 text-sm font-medium text-dayflow-text hover:bg-dayflow-bg">Notifications</Link>
            <Link to="/settings/company" className="block rounded-xl px-3 py-2 text-sm font-medium text-dayflow-text hover:bg-dayflow-bg">Company</Link>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6">
            <div className="text-xl font-semibold text-dayflow-text">Security</div>
            <div className="text-sm text-dayflow-muted">Update your password and authentication preferences.</div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Current Password" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
            <Input label="New Password" type="password" value={next} onChange={(e) => setNext(e.target.value)} />
            <Input label="Confirm New Password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="md:col-span-2" />
          </div>

          {message && <div className="mt-4 text-sm text-dayflow-muted">{message}</div>}

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary">Cancel</Button>
            <Button onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save Changes'}</Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
