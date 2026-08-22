import { useEffect, useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Link } from 'react-router-dom'
import { settingsService } from '../../services/settingsService'

export function AccountSettings() {
  const [profile, setProfile] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        const p = await settingsService.getProfile()
        if (!ignore) setProfile(p)
      } catch (err) {
        console.error(err)
      }
    }
    void load()
    return () => { ignore = true }
  }, [])

  return (
    <AppLayout title="Account Settings">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <Card className="p-4">
          <div className="space-y-2">
            <Link to="/settings/account" className="block rounded-xl bg-dayflow-bg px-3 py-2 text-sm font-medium text-dayflow-text">My Account</Link>
            <Link to="/settings/security" className="block rounded-xl px-3 py-2 text-sm font-medium text-dayflow-text hover:bg-dayflow-bg">Security</Link>
            <Link to="/settings/notifications" className="block rounded-xl px-3 py-2 text-sm font-medium text-dayflow-text hover:bg-dayflow-bg">Notifications</Link>
            <Link to="/settings/company" className="block rounded-xl px-3 py-2 text-sm font-medium text-dayflow-text hover:bg-dayflow-bg">Company</Link>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img src={profile?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'} alt="Profile" className="h-20 w-20 rounded-2xl object-cover" />
                <div>
                  <div className="text-lg font-semibold text-dayflow-text">{profile?.name ?? '—'}</div>
                  <div className="text-sm text-dayflow-muted">{profile?.job_title ?? 'Employee'}</div>
                  <div className="mt-2 text-sm text-dayflow-muted">Last updated: {profile?.updated_at ?? '—'}</div>
                </div>
              </div>
              <div>
                <Link to="/my-profile" className="inline-flex items-center gap-2 rounded-xl border border-dayflow-border bg-white px-3 py-2 text-sm font-medium text-dayflow-text">Edit Profile</Link>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-xl font-semibold text-dayflow-text">Personal Information</div>
            <div className="mt-3 text-sm text-dayflow-muted">Manage your personal details.</div>

            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={async (e) => {
              e.preventDefault()
              try {
                setSaving(true)
                await settingsService.updateProfile(profile)
              } catch (err) {
                console.error(err)
              } finally {
                setSaving(false)
              }
            }}>
              <Input label="Full name" value={profile?.name ?? ''} onChange={(e) => setProfile((s: any) => ({ ...(s ?? {}), name: e.target.value }))} />
              <Input label="Birthday" value={profile?.birthday ?? ''} onChange={(e) => setProfile((s: any) => ({ ...(s ?? {}), birthday: e.target.value }))} />
              <Input label="Email" value={profile?.email ?? ''} onChange={(e) => setProfile((s: any) => ({ ...(s ?? {}), email: e.target.value }))} />
              <Input label="Phone Number" value={profile?.phone ?? ''} onChange={(e) => setProfile((s: any) => ({ ...(s ?? {}), phone: e.target.value }))} />

              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <Button variant="secondary" type="button" onClick={() => void window.location.reload()}>Discard</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
              </div>
            </form>
          </Card>

          <Card className="p-6">
            <div className="text-xl font-semibold text-dayflow-text">Account</div>
            <div className="mt-3 text-sm text-dayflow-muted">Update your password and preferences.</div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Input label="Password" type="password" value="••••••••" readOnly />
              <Input label="Language" value={profile?.language ?? 'English'} onChange={(e) => setProfile((s: any) => ({ ...(s ?? {}), language: e.target.value }))} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-xl font-semibold text-dayflow-text">Theme</div>
            <div className="mt-3 text-sm text-dayflow-muted">Choose the application appearance.</div>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex gap-3">
                <div className="h-20 w-32 rounded-lg border border-dayflow-border bg-white" />
                <div className="h-20 w-32 rounded-lg border border-dayflow-border bg-slate-800" />
                <div className="h-20 w-32 rounded-lg border border-dayflow-border bg-gradient-to-r from-white to-slate-100" />
              </div>
              <div className="text-sm text-dayflow-muted">Select Light, Dark, or System</div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
