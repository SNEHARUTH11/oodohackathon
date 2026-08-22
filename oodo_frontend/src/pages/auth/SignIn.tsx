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
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
})

export function SignIn() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (
    values: z.infer<typeof signInSchema>
  ) => {
    setError('')

    try {
      const result = await authService.login(
        values.email,
        values.password
      )

      login({
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken,
      })

      showToast('Signed in successfully', 'success')

      if (
        result.user &&
        (result.user.change_password === true ||
          result.user.change_password === 'true')
      ) {
        navigate('/change-password')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Invalid credentials'
      )
    }
  }

  return (
    <div className="min-h-screen bg-white px-5 py-6 md:px-8 lg:px-12">

      {/* =====================================================
          MAIN CONTAINER
      ====================================================== */}
      <div
        className="
          mx-auto
          flex
          min-h-[calc(100vh-48px)]
          w-full
          max-w-[1500px]
          items-center
        "
      >

        {/* ===================================================
            LEFT SIDE
        ==================================================== */}
        <div
          className="
            hidden
            w-[47%]
            flex-col
            lg:flex
          "
        >

          {/* Logo */}
          <div className="mb-10 flex items-center gap-2">

            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
              "
            >
              <span
                className="
                  text-[28px]
                  leading-none
                  text-[#36c99b]
                "
              >
                ✣
              </span>
            </div>

            <div>
              <div
                className="
                  text-[16px]
                  font-bold
                  leading-none
                  tracking-[-0.03em]
                  text-[#17263b]
                "
              >
                DAYFLOW
              </div>

              <div
                className="
                  mt-[3px]
                  text-[7px]
                  font-medium
                  text-[#667085]
                "
              >
                HR Management System
              </div>
            </div>

          </div>

          {/* Welcome Heading */}
          <div className="ml-8">

            <h1
              className="
                text-[36px]
                font-semibold
                leading-[1.1]
                tracking-[-0.045em]
                text-[#0f172a]
              "
            >
              Welcome back!
            </h1>

            <p
              className="
                mt-2
                text-[14px]
                text-[#64748b]
              "
            >
              Sign in to your Dayflow account
            </p>

          </div>

          {/* Illustration */}
          <div className="mt-8 flex justify-center">

            <img
              src={loginIllustration}
              alt="Person using a laptop at a desk"
              className="
                w-[470px]
                max-w-[92%]
                object-contain
              "
            />

          </div>

        </div>

        {/* ===================================================
            RIGHT SIDE
        ==================================================== */}
        <div
          className="
            flex
            w-full
            items-center
            justify-center
            lg:w-[53%]
          "
        >

          {/* Large Form Area */}
          <div
            className="
              w-full
              max-w-[650px]
              px-6
              py-10
              sm:px-8
              md:px-10
              lg:px-12
              xl:px-14
            "
          >

            {/* =================================================
                HEADER
            ================================================== */}
            <div className="mb-10">

              <h2
                className="
                  text-[40px]
                  font-semibold
                  leading-[1.1]
                  tracking-[-0.045em]
                  text-[#0f172a]
                  sm:text-[42px]
                "
              >
                Sign In
              </h2>

              <p
                className="
                  mt-3
                  text-[18px]
                  text-[#76828a]
                  sm:text-[19px]
                "
              >
                Enter your credentials to access your account
              </p>

            </div>

            {/* =================================================
                FORM
            ================================================== */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-7"
            >

              {/* ------------------------------------------------
                  EMAIL
              ------------------------------------------------- */}
              <div>

                <label
                  htmlFor="email"
                  className="
                    mb-2.5
                    block
                    text-[17px]
                    font-medium
                    text-[#303944]
                  "
                >
                  Login ID / Email
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email ID or email"
                  {...register('email')}
                  className="
                    h-[64px]
                    w-full
                    rounded-[18px]
                    border
                    border-[#dce4e8]
                    bg-[#f8fafb]
                    px-5
                    text-[17px]
                    text-[#26323d]
                    placeholder:text-[#8996a5]
                    outline-none
                    transition
                    focus:border-[#6fbba9]
                    focus:ring-2
                    focus:ring-[#d8f1eb]
                  "
                />

                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}

              </div>

              {/* ------------------------------------------------
                  PASSWORD
              ------------------------------------------------- */}
              <div>

                <label
                  htmlFor="password"
                  className="
                    mb-2.5
                    block
                    text-[17px]
                    font-medium
                    text-[#303944]
                  "
                >
                  Password
                </label>

                <div className="relative">

                  <input
                    id="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    {...register('password')}
                    className="
                      h-[64px]
                      w-full
                      rounded-[18px]
                      border
                      border-[#dce4e8]
                      bg-[#f8fafb]
                      px-5
                      pr-16
                      text-[17px]
                      text-[#26323d]
                      placeholder:text-[#8996a5]
                      outline-none
                      transition
                      focus:border-[#6fbba9]
                      focus:ring-2
                      focus:ring-[#d8f1eb]
                    "
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="
                      absolute
                      right-5
                      top-1/2
                      -translate-y-1/2
                      text-[#687887]
                      transition
                      hover:text-[#172033]
                    "
                  >
                    {showPassword ? (
                      <EyeOff size={23} />
                    ) : (
                      <Eye size={23} />
                    )}
                  </button>

                </div>

                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}

              </div>

              {/* ------------------------------------------------
                  FORGOT PASSWORD
              ------------------------------------------------- */}
              <div className="flex justify-end pt-0.5">

                <Link
                  to="/forgot-password"
                  className="
                    text-[17px]
                    font-medium
                    text-[#168f7c]
                    transition
                    hover:text-[#0c6f61]
                  "
                >
                  Forgot password?
                </Link>

              </div>

              {/* ------------------------------------------------
                  ERROR
              ------------------------------------------------- */}
              {error && (
                <div
                  className="
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    px-4
                    py-3
                    text-sm
                    text-red-600
                  "
                >
                  {error}
                </div>
              )}

              {/* ------------------------------------------------
                  SIGN IN BUTTON
              ------------------------------------------------- */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="
                  h-[64px]
                  w-full
                  rounded-[18px]
                  bg-[#0e0d1c]
                  text-[18px]
                  font-semibold
                  text-white
                  shadow-none
                  transition
                  hover:bg-[#171625]
                  disabled:cursor-not-allowed
                  disabled:opacity-70
                "
              >
                {isSubmitting
                  ? 'Signing in...'
                  : 'Sign In'}
              </Button>

            </form>

            {/* =================================================
                SIGN UP
            ================================================== */}
            <p
              className="
                mt-9
                text-center
                text-[17px]
                text-[#737d89]
              "
            >
              Don’t have an account?{' '}

              <Link
                to="/sign-up"
                className="
                  font-semibold
                  text-[#168f7c]
                  transition
                  hover:text-[#0c6f61]
                "
              >
                Sign Up
              </Link>
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <div
        className="
          pb-2
          text-center
          text-[8px]
          text-[#b0b5ba]
        "
      >
        © 2025 Dayflow HRMS. All rights reserved.
      </div>

    </div>
  )
}