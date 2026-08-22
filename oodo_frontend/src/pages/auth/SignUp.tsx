import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Upload } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { authService } from '../../services/authService'
import { useToast } from '../../hooks/useToast'

const signUpSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  employeeName: z.string().min(2, 'Employee name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(8, 'Enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
  companyLogo: z.any().optional()
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match'
})

export function SignUp() {
  const { showToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [createdId, setCreatedId] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema)
  })

  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    try {
      const result = await authService.register({
        company_name: values.companyName,
        employee_name: values.employeeName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        company_logo: values.companyLogo || null
      })
      setCreatedId(result.login_id || 'DF-2026-1001')
      showToast('Employee created successfully.', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to create account', 'error')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-dayflow-bg p-6">
      <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-dayflow-border bg-white shadow-soft">
        <div className="grid lg:grid-cols-[1.1fr_1.4fr]">
          <div className="bg-dayflow-navy px-8 py-10 text-white">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-3 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-dayflow-green text-dayflow-navy">D</div>
              <div className="text-xl font-semibold">DAYFLOW</div>
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.05em]">Create employee access</h1>
            <p className="mt-4 max-w-sm text-slate-300">Onboard a new team member with secure credentials and a ready-to-use HR profile.</p>
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm uppercase tracking-[0.2em] text-dayflow-green">Brand-ready</div>
              <div className="mt-4 text-2xl font-semibold">Dayflow HR workspace</div>
            </div>
          </div>

          <div className="p-6 md:p-10">
            <div className="mb-6">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-dayflow-green">Admin / HR</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-dayflow-text">Create employee account</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Company Name" placeholder="Dayflow Labs" error={errors.companyName?.message} {...register('companyName')} />
                <Input label="Employee Name" placeholder="Jane Doe" error={errors.employeeName?.message} {...register('employeeName')} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Email" type="email" placeholder="jane@dayflow.io" error={errors.email?.message} {...register('email')} />
                <Input label="Phone" placeholder="+91 98765 43210" error={errors.phone?.message} {...register('phone')} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative">
                  <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" error={errors.password?.message} {...register('password')} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[41px] text-dayflow-muted" aria-label="Toggle password visibility">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <Input label="Confirm Password" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[41px] text-dayflow-muted" aria-label="Toggle confirm password visibility">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-dayflow-border bg-dayflow-bg p-4">
                <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-dayflow-text">Company Logo</span>
                  <span className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-dayflow-muted"><Upload size={16} /> Upload</span>
                  <input type="file" className="hidden" {...register('companyLogo')} />
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Creating employee...' : 'Create Account'}</Button>
            </form>

            {createdId && (
              <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                <div className="font-semibold">Employee created successfully.</div>
                <div className="mt-1">Generated Login ID: <span className="font-bold">{createdId}</span></div>
              </div>
            )}

            <p className="mt-6 text-center text-sm text-dayflow-muted">
              Already have access? <Link to="/sign-in" className="font-semibold text-dayflow-green">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
