import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/ui/Button'
import { authService } from '../../services/authService'
import { useAuth } from '../../hooks/useAuth'

const schema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1)
}).refine((v) => v.newPassword === v.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

export function ChangePassword() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setError('')
    try {
      await authService.changePassword(values.currentPassword, values.newPassword, values.confirmPassword)
      // optionally force re-login — here we log out and redirect to sign-in
      logout()
      navigate('/sign-in')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to change password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f5f4] p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow">
        <h2 className="text-2xl font-semibold mb-2">Change Password</h2>
        <p className="text-sm text-dayflow-muted mb-4">Please set a new password for your account.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Current password</label>
            <input type="password" {...register('currentPassword')} className="mt-1 w-full rounded-xl border px-3 py-2" />
            {errors.currentPassword && <p className="mt-1 text-xs text-red-500">{errors.currentPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">New password</label>
            <input type="password" {...register('newPassword')} className="mt-1 w-full rounded-xl border px-3 py-2" />
            {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Confirm new password</label>
            <input type="password" {...register('confirmPassword')} className="mt-1 w-full rounded-xl border px-3 py-2" />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save new password'}</Button>
        </form>
      </div>
    </div>
  )
}

export default ChangePassword
