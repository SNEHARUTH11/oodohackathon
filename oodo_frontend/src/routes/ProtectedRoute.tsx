import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute() {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />
  }

  // enforce change-password flow
  if (user?.change_password) {
    if (location.pathname !== '/change-password') {
      return <Navigate to="/change-password" replace />
    }
  }

  return <Outlet />
}
