import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/ui/Button'
import { authService } from '../../services/authService'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import loginIllustration from '../../assets/login-illustration.png'

const signInSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export function SignIn() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema)
  })

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    setError('')
    try {
      const result = await authService.login(values.email, values.password)
      login({ user: result.user, token: result.token, refreshToken: result.refreshToken })
      showToast('Signed in successfully', 'success')
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f2f5f4] p-4 md:p-8">
      <div className="flex w-full max-w-[1240px] overflow-hidden rounded-[30px] border border-[#dfe7eb] bg-[#f4f7f6] shadow-[0_18px_45px_rgba(18,32,41,0.08)]">
        <div className="hidden w-[56%] flex-col justify-center bg-[#f3f6f5] px-8 py-8 lg:flex">
          <div className="mb-6 flex items-center gap-3 px-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dfeef0] text-xl font-bold text-[#0d2030]">D</div>
            <div className="text-[1.7rem] font-semibold tracking-[-0.06em] text-[#0d2030]">DAYFLOW</div>
          </div>

          <div className="mb-6 text-left">
            <h1 className="text-4xl font-semibold tracking-[-0.06em] text-[#0f172a]">Welcome back!</h1>
            <p className="mt-2 text-base text-[#5d6b73]">Sign in to your Dayflow account</p>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <img
              src={loginIllustration}
              alt="Person using a laptop at a desk"
              className="w-full max-w-[760px] object-contain drop-shadow-[0_18px_30px_rgba(15,23,42,0.08)]"
            />
          </div>
        </div>

        <div className="flex w-full items-center justify-center bg-white p-6 md:p-10 lg:w-[44%]">
          <div className="w-full max-w-[400px]">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[#0f172a]">Sign In</h2>
              <p className="mt-2 text-sm text-[#76828a]">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-[#2f3a40]">Login ID / Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email ID or email"
                  className="h-12 w-full rounded-xl border border-[#dfe6ea] bg-[#f8fafb] px-3 text-sm text-[#1b2a33] placeholder:text-[#8a94a1] outline-none transition focus:border-[#6fbba9] focus:ring-2 focus:ring-[#cfeae4]"
                  {...register('email')}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-[#2f3a40]">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-[#dfe6ea] bg-[#f8fafb] px-3 pr-11 text-sm text-[#1b2a33] placeholder:text-[#8a94a1] outline-none transition focus:border-[#6fbba9] focus:ring-2 focus:ring-[#cfeae4]"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#63707b] transition hover:text-[#0f172a]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div className="flex justify-end">
                <Link to="/sign-up" className="text-sm font-medium text-[#1a8c7a] transition hover:text-[#0d6c62]">Forgot password?</Link>
              </div>

              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

              <Button className="h-12 w-full rounded-xl bg-[#0f172a] text-base font-medium text-white transition hover:bg-[#111827]" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[#6b7280]">
              Don’t have an account?{' '}
              <Link to="/sign-up" className="font-semibold text-[#1a8c7a] hover:text-[#0d6c62]">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
