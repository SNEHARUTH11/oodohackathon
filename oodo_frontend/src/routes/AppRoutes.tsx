import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '../layouts/AuthLayout'
import { SignIn } from '../pages/auth/SignIn'
import { SignUp } from '../pages/auth/SignUp'
import { Dashboard } from '../pages/dashboard/Dashboard'
import { Employees } from '../pages/employees/Employees'
import { EmployeeProfile } from '../pages/employees/EmployeeProfile'
import { Attendance } from '../pages/attendance/Attendance'
import { TimeOff } from '../pages/leave/TimeOff'
import { LeaveAllocation } from '../pages/leave/LeaveAllocation'
import { Payroll } from '../pages/payroll/Payroll'
import { MyPayroll } from '../pages/payroll/MyPayroll'
import { PayslipPage } from '../pages/payroll/Payslip'
import { Reports } from '../pages/reports/Reports'
import { Notifications } from '../pages/notifications/Notifications'
import { Settings } from '../pages/settings/Settings'
import { AccountSettings } from '../pages/settings/AccountSettings'
import { SecuritySettings } from '../pages/settings/SecuritySettings'
import { MyProfile } from '../pages/profile/MyProfile'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'
import { useAuth } from '../hooks/useAuth'

function RootRedirect() {
  const { isAuthenticated } = useAuth()
  return <Navigate to={isAuthenticated ? '/dashboard' : '/sign-in'} replace />
}

function PublicRouteGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route element={<AuthLayout />}>
        <Route path="/sign-in" element={<PublicRouteGuard><SignIn /></PublicRouteGuard>} />
        <Route path="/sign-up" element={<PublicRouteGuard><SignUp /></PublicRouteGuard>} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/profile/:employeeId" element={<EmployeeProfile />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/time-off" element={<TimeOff />} />
        <Route path="/time-off/allocation" element={<LeaveAllocation />} />
        <Route path="/my-payroll" element={<MyPayroll />} />
        <Route path="/payroll" element={<RoleRoute allowedRoles={['admin', 'hr_officer']}><Payroll /></RoleRoute>} />
        <Route path="/payroll/payslip/:employeeId/:month" element={<PayslipPage />} />
        <Route path="/employees" element={<RoleRoute allowedRoles={['admin', 'hr_officer']}><Employees /></RoleRoute>} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/account" element={<AccountSettings />} />
        <Route path="/settings/security" element={<SecuritySettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  )
}
