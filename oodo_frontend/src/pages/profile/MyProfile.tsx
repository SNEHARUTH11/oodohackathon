import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../hooks/useAuth'

export function MyProfile() {
  const { user } = useAuth()

  return (
    <AppLayout title="My Profile">
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <img src={user?.profile_picture || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'} alt={user?.name || 'Profile'} className="h-20 w-20 rounded-2xl object-cover" />
            <div className="flex-1">
              <div className="text-2xl font-semibold text-dayflow-text">{user?.name}</div>
              <div className="mt-1 text-sm text-dayflow-muted">{user?.job_position} · {user?.department}</div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-dayflow-muted">
                <span>Employee ID: {user?.emp_code}</span>
                <span>Department: {user?.department}</span>
                <span>Location: {user?.location}</span>
              </div>
            </div>
            <Button variant="secondary">Edit Profile</Button>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-dayflow-text">Resume</h3>
            <div className="mt-4 space-y-4 text-sm text-dayflow-muted">
              <div><span className="font-medium text-dayflow-text">About:</span> I help design day-to-day team experiences and improve how work gets done.</div>
              <div><span className="font-medium text-dayflow-text">What I love about my job:</span> Building thoughtful systems and helping teams grow.</div>
              <div><span className="font-medium text-dayflow-text">Skills:</span> HR strategy, policy design, onboarding, analytics.</div>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-dayflow-text">Private Info</h3>
            <div className="mt-4 grid gap-3 text-sm text-dayflow-muted md:grid-cols-2">
              <div><span className="font-medium text-dayflow-text">DOB:</span> {user?.date_of_birth || '—'}</div>
              <div><span className="font-medium text-dayflow-text">Nationality:</span> {user?.nationality || 'Indian'}</div>
              <div><span className="font-medium text-dayflow-text">Personal email:</span> {user?.personal_email || user?.email}</div>
              <div><span className="font-medium text-dayflow-text">Address:</span> {user?.residing_address || '—'}</div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
