import { useAuth } from '../../hooks/useAuth'
import { EmployeeDashboard } from './EmployeeDashboard'
import { AdminDashboard } from './AdminDashboard'

export function Dashboard() {
  const { user } = useAuth()

  if (user?.role === 'admin' || user?.role === 'hr_officer') {
    return <AdminDashboard />
  }

  return <EmployeeDashboard />
}
