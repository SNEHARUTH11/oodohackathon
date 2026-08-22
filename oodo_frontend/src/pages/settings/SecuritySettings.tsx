import { useEffect, useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Link } from 'react-router-dom'
import { authService } from '../../services/authService'
import { useAuth } from '../../hooks/useAuth'
import { employeeService } from '../../services/employeeService'
import { settingsService } from '../../services/settingsService'

export function SecuritySettings() {
  const { user } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [employees, setEmployees] = useState<Array<{ id: string; name: string; email: string; role?: string }>>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState<string | null>(null)

  const canResetEmployeePassword = user?.role === 'admin' || user?.role === 'hr_officer'

  useEffect(() => {
    if (!canResetEmployeePassword) return

    const loadEmployees = async () => {
      try {
        const items = await employeeService.getEmployees()
        setEmployees(Array.isArray(items) ? items : [])
        if (items?.[0]?.id) setSelectedEmployeeId(String(items[0].id))
      } catch (error) {
        console.error('Unable to load employees for password reset', error)
      }
    }

    void loadEmployees()
  }, [canResetEmployeePassword])

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

  const resetEmployee = async () => {
    if (!selectedEmployeeId) {
      setResetMessage('Select an employee first.')
      return
    }

    setResetMessage(null)
    setResetLoading(true)
    try {
      const result = await settingsService.resetEmployeePassword(selectedEmployeeId, resetPassword || undefined)
      const tempPassword = result?.temp_password ?? result?.data?.temp_password ?? '—'
      setResetMessage(`Password reset complete. Temporary password: ${tempPassword}`)
      setResetPassword('')
    } catch (err: any) {
      setResetMessage(err?.message ?? 'Failed to reset employee password')
    } finally {
      setResetLoading(false)
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

        <div className="space-y-6">
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
              <Button variant="secondary" type="button">Cancel</Button>
              <Button type="button" onClick={() => void save()} disabled={loading}>{loading ? 'Saving…' : 'Save Changes'}</Button>
            </div>
          </Card>

          {canResetEmployeePassword && (
            <Card className="p-6">
              <div className="mb-4">
                <div className="text-xl font-semibold text-dayflow-text">Reset Employee Password</div>
                <div className="text-sm text-dayflow-muted">Issue a temporary password for staff members who need a reset.</div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2 text-sm text-dayflow-text">
                  <span className="font-medium">Employee</span>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="h-11 w-full rounded-xl border border-dayflow-border bg-white px-3 text-sm text-dayflow-text outline-none transition focus:border-dayflow-green focus:ring-2 focus:ring-dayflow-green/20"
                  >
                    {employees.length === 0 ? <option value="">No employees available</option> : employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>{employee.name} ({employee.role || 'employee'})</option>
                    ))}
                  </select>
                </label>

                <Input label="Optional custom password" type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="Leave blank for temp password" />
              </div>

              {resetMessage && <div className="mt-4 text-sm text-dayflow-muted">{resetMessage}</div>}

              <div className="mt-6 flex justify-end">
                <Button type="button" onClick={() => void resetEmployee()} disabled={resetLoading || !selectedEmployeeId}>{resetLoading ? 'Resetting…' : 'Reset Password'}</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
