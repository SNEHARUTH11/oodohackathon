import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

type TabKey = 'resume' | 'private' | 'salary' | 'security'

export function MyProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabKey>('resume')

  const isAdmin = user?.role === 'admin'

  return (
    <AppLayout title="My Profile">
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <img src={user?.profile_picture || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'} alt={user?.name || 'Profile'} className="h-24 w-24 rounded-2xl object-cover" />
            <div className="flex-1">
              <div className="text-2xl font-semibold text-dayflow-text">{user?.name}</div>
              <div className="mt-1 text-sm text-dayflow-muted">{user?.job_position} · {user?.department}</div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-dayflow-muted">
                <span>Employee ID: {user?.emp_code}</span>
                <span>Department: {user?.department}</span>
                <span>Location: {user?.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => navigate('/settings/account')}>Edit Profile</Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-t pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => setTab('resume')} className={`px-3 py-2 rounded-lg text-sm font-medium ${tab === 'resume' ? 'bg-dayflow-greenSoft text-dayflow-success' : 'bg-white text-dayflow-text border border-dayflow-border'}`}>
                Resume
              </button>

              <button onClick={() => setTab('private')} className={`px-3 py-2 rounded-lg text-sm font-medium ${tab === 'private' ? 'bg-dayflow-greenSoft text-dayflow-success' : 'bg-white text-dayflow-text border border-dayflow-border'}`}>
                Private Info
              </button>

              {isAdmin && (
                <button onClick={() => setTab('salary')} className={`px-3 py-2 rounded-lg text-sm font-medium ${tab === 'salary' ? 'bg-dayflow-greenSoft text-dayflow-success' : 'bg-white text-dayflow-text border border-dayflow-border'}`}>
                  Salary Info
                </button>
              )}

              <button onClick={() => setTab('security')} className={`px-3 py-2 rounded-lg text-sm font-medium ${tab === 'security' ? 'bg-dayflow-greenSoft text-dayflow-success' : 'bg-white text-dayflow-text border border-dayflow-border'}`}>
                Security
              </button>
            </div>

            <div className="mt-5">
              {tab === 'resume' && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="p-5">
                    <h3 className="text-lg font-semibold text-dayflow-text">Resume</h3>
                    <div className="mt-4 space-y-4 text-sm text-dayflow-muted">
                      <div><span className="font-medium text-dayflow-text">About:</span> {user?.bio || '—'}</div>
                      <div><span className="font-medium text-dayflow-text">What I love about my job:</span> {user?.what_i_love || '—'}</div>
                      <div><span className="font-medium text-dayflow-text">Skills:</span> {user?.skills || '—'}</div>
                    </div>
                  </Card>
                  <Card className="p-5">
                    <h3 className="text-lg font-semibold text-dayflow-text">Contact</h3>
                    <div className="mt-4 grid gap-3 text-sm text-dayflow-muted">
                      <div><span className="font-medium text-dayflow-text">Email:</span> {user?.email}</div>
                      <div><span className="font-medium text-dayflow-text">Phone:</span> {user?.phone}</div>
                      <div><span className="font-medium text-dayflow-text">Location:</span> {user?.location}</div>
                    </div>
                  </Card>
                </div>
              )}

              {tab === 'private' && (
                <Card className="p-5">
                  <h3 className="text-lg font-semibold text-dayflow-text">Private Info</h3>
                  <div className="mt-4 grid gap-3 text-sm text-dayflow-muted md:grid-cols-2">
                    <div><span className="font-medium text-dayflow-text">DOB:</span> {user?.date_of_birth || '—'}</div>
                    <div><span className="font-medium text-dayflow-text">Nationality:</span> {user?.nationality || '—'}</div>
                    <div><span className="font-medium text-dayflow-text">Personal email:</span> {user?.personal_email || user?.email}</div>
                    <div><span className="font-medium text-dayflow-text">Address:</span> {user?.residing_address || '—'}</div>
                    <div><span className="font-medium text-dayflow-text">Marital status:</span> {user?.marital_status || '—'}</div>
                    <div><span className="font-medium text-dayflow-text">Gender:</span> {user?.gender || '—'}</div>
                  </div>
                </Card>
              )}

              {tab === 'salary' && isAdmin && (
                <Card className="p-5">
                  <h3 className="text-lg font-semibold text-dayflow-text">Salary Info</h3>
                  <div className="mt-4 grid gap-3 text-sm text-dayflow-muted">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div><span className="font-medium text-dayflow-text">Monthly Wage:</span> {user?.salary?.monthly || '—'}</div>
                      <div><span className="font-medium text-dayflow-text">Yearly CTC:</span> {user?.salary?.yearly || '—'}</div>
                    </div>
                    <div className="mt-2 text-sm text-dayflow-muted">Salary components and breakdowns are visible to administrators only.</div>
                  </div>
                </Card>
              )}

              {tab === 'security' && (
                <Card className="p-5">
                  <h3 className="text-lg font-semibold text-dayflow-text">Security</h3>
                  <div className="mt-4 space-y-3 text-sm text-dayflow-muted">
                    <div><span className="font-medium text-dayflow-text">Password</span></div>
                    <div>
                      <Button variant="secondary" onClick={() => navigate('/change-password')}>Change password</Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
