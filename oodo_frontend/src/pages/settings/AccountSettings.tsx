import { useEffect, useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Link } from 'react-router-dom'
import { settingsService } from '../../services/settingsService'

type ProfileState = Record<string, string | undefined | null>

export function AccountSettings() {
  const [profile, setProfile] = useState<ProfileState | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

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

  const updateField = (field: string, value: string) => {
    setProfile((current) => ({ ...(current ?? {}), [field]: value }))
  }

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.name || '—'

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
                <img src={profile?.profile_picture || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'} alt="Profile" className="h-20 w-20 rounded-2xl object-cover" />
                <div>
                  <div className="text-lg font-semibold text-dayflow-text">{fullName}</div>
                  <div className="text-sm text-dayflow-muted">{profile?.job_position || 'Employee'}</div>
                  <div className="mt-2 text-sm text-dayflow-muted">Department: {profile?.department || '—'}</div>
                </div>
              </div>
              <div>
                <Link to="/my-profile" className="inline-flex items-center gap-2 rounded-xl border border-dayflow-border bg-white px-3 py-2 text-sm font-medium text-dayflow-text">View Profile</Link>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-xl font-semibold text-dayflow-text">Personal Information</div>
            <div className="mt-3 text-sm text-dayflow-muted">Update your personal details.</div>

            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={async (e) => {
              e.preventDefault()
              try {
                setSaving(true)
                setMessage(null)
                await settingsService.updateProfile(profile ?? {})
                setMessage('Profile updated successfully.')
              } catch (err) {
                setMessage(err instanceof Error ? err.message : 'Unable to update profile')
              } finally {
                setSaving(false)
              }
            }}>
              <Input label="First name" value={profile?.first_name ?? ''} onChange={(e) => updateField('first_name', e.target.value)} />
              <Input label="Last name" value={profile?.last_name ?? ''} onChange={(e) => updateField('last_name', e.target.value)} />
              <Input label="Email" value={profile?.email ?? ''} onChange={(e) => updateField('email', e.target.value)} />
              <Input label="Phone Number" value={profile?.phone ?? ''} onChange={(e) => updateField('phone', e.target.value)} />
              <Input label="Date of birth" type="date" value={profile?.date_of_birth ?? ''} onChange={(e) => updateField('date_of_birth', e.target.value)} />
              <Input label="Nationality" value={profile?.nationality ?? ''} onChange={(e) => updateField('nationality', e.target.value)} />
              <Input label="Personal email" value={profile?.personal_email ?? ''} onChange={(e) => updateField('personal_email', e.target.value)} className="md:col-span-2" />
              <Input label="Address" value={profile?.residing_address ?? ''} onChange={(e) => updateField('residing_address', e.target.value)} className="md:col-span-2" />
              <Input label="About" value={profile?.about ?? ''} onChange={(e) => updateField('about', e.target.value)} className="md:col-span-2" />
              <Input label="What I love about my job" value={profile?.what_i_love_about_job ?? ''} onChange={(e) => updateField('what_i_love_about_job', e.target.value)} className="md:col-span-2" />
              <Input label="Interests & hobbies" value={profile?.interests_hobbies ?? ''} onChange={(e) => updateField('interests_hobbies', e.target.value)} className="md:col-span-2" />

              {message && <div className="md:col-span-2 text-sm text-dayflow-muted">{message}</div>}

              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <Button variant="secondary" type="button" onClick={() => window.location.reload()}>Discard</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
