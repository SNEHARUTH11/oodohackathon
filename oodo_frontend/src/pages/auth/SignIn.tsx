import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { authService } from '../../services/authService'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'

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
      login({ user: result.user, token: result.token })
      showToast('Signed in successfully', 'success')
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-dayflow-bg p-6">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-dayflow-border bg-white shadow-soft lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between bg-dayflow-navy p-10 text-white lg:flex">
          <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,_rgba(24,217,139,0.3),_transparent_40%)]" />
          <div className="relative">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-3 py-2 backdrop-blur">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-dayflow-green text-sm font-bold text-dayflow-navy">D</div>
              <div>
                <div className="text-xl font-semibold">DAYFLOW</div>
              </div>
            </div>
            <h1 className="max-w-sm text-4xl font-semibold tracking-[-0.05em]">Every workday, perfectly aligned.</h1>
            <p className="mt-4 max-w-md text-base text-slate-300">A premium HR experience designed to help teams track time, simplify payroll, and manage people with clarity.</p>
          </div>
          <div className="relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="flex items-center gap-2 text-dayflow-green">
              <ShieldCheck size={18} />
              <span className="text-sm font-medium">Trusted by growing teams</span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div><div className="text-2xl font-semibold">94%</div><div className="text-xs text-slate-300">Retain</div></div>
              <div><div className="text-2xl font-semibold">2.1x</div><div className="text-xs text-slate-300">Faster</div></div>
              <div><div className="text-2xl font-semibold">24/7</div><div className="text-xs text-slate-300">Access</div></div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-dayflow-green">Welcome back</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-dayflow-text">Sign in to DAYFLOW</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Login ID / Email" type="email" placeholder="name@dayflow.io" error={errors.email?.message} {...register('email')} />
              <div className="relative">
                <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" error={errors.password?.message} {...register('password')} />
                <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[41px] text-dayflow-muted">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div />
                <Link to="/sign-up" className="font-medium text-dayflow-green hover:text-dayflow-navy">Forgot password?</Link>
              </div>

              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-dayflow-muted">
              Don’t have an account?{' '}
              <Link to="/sign-up" className="font-semibold text-dayflow-green">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
