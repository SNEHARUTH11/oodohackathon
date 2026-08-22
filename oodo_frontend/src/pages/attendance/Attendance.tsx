import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react'

import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { attendanceService } from '../../services/attendanceService'

type UserRole = 'admin' | 'hr' | 'employee'

type CurrentUser = {
  id?: string | number
  name?: string
  email?: string
  role?: string
  user_type?: string
  employee_id?: string | number
}

type AttendanceEntry = {
  id: string
  date: string
  employee?: string
  employee_name?: string
  employee_id?: string | number
  check_in?: string
  check_out?: string
  work_hours?: number
  extra_hours?: number
  status?: string
}

const markStatusColor = {
  Present: 'bg-dayflow-greenSoft text-dayflow-success',
  Absent: 'bg-red-50 text-red-600',
  'Half Day': 'bg-amber-50 text-dayflow-warning',
  Leave: 'bg-dayflow-blueSoft text-dayflow-blue',
} as const

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/**
 * Gets the currently logged-in user.
 *
 * Change the localStorage key here if your login stores
 * the user under a different key.
 */
function getCurrentUser(): CurrentUser | null {
  const possibleKeys = [
    'dayflow_user',
    'user',
    'currentUser',
    'auth_user',
  ]

  for (const key of possibleKeys) {
    const storedUser = localStorage.getItem(key)

    if (!storedUser) continue

    try {
      const parsed = JSON.parse(storedUser)

      if (parsed && typeof parsed === 'object') {
        return parsed
      }
    } catch {
      // Ignore invalid JSON and continue checking other keys.
    }
  }

  return null
}

/**
 * Converts whatever role your backend returns
 * into one of our three supported roles.
 */
function getUserRole(user: CurrentUser | null): UserRole {
  const rawRole = (
    user?.role ||
    user?.user_type ||
    ''
  )
    .toString()
    .trim()
    .toLowerCase()

  if (
    rawRole === 'admin' ||
    rawRole === 'administrator' ||
    rawRole === 'superadmin'
  ) {
    return 'admin'
  }

  if (
    rawRole === 'hr' ||
    rawRole === 'hr officer' ||
    rawRole === 'hr_officer' ||
    rawRole === 'human resources'
  ) {
    return 'hr'
  }

  return 'employee'
}

export function Attendance() {
  const [date, setDate] = useState(new Date())
  const [view, setView] = useState<'day' | 'month'>('day')
  const [search, setSearch] = useState('')

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null)

  const [attendance, setAttendance] = useState<AttendanceEntry[]>([])
  const [loading, setLoading] = useState(true)

  /*
   * Load logged-in user.
   */
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

  /*
   * Determine role dynamically.
   */
  const userRole = useMemo(() => {
    return getUserRole(currentUser)
  }, [currentUser])

  const isAdmin = userRole === 'admin'
  const isHR = userRole === 'hr'
  const isAdminOrHR = isAdmin || isHR
  const isEmployee = userRole === 'employee'

  /*
   * Load attendance.
   *
   * IMPORTANT:
   *
   * Ideally your backend should return:
   *
   * Admin/HR:
   *     all attendance records
   *
   * Employee:
   *     only logged-in employee's records
   *
   * If your API supports role/user filtering, use it here.
   */
  useEffect(() => {
    let ignore = false

    const loadAttendance = async () => {
      try {
        setLoading(true)

        const data = await attendanceService.getAttendance()

        if (!ignore) {
          setAttendance(data ?? [])
        }
      } catch (error) {
        console.error('Failed to load attendance:', error)

        if (!ignore) {
          setAttendance([])
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void loadAttendance()

    return () => {
      ignore = true
    }
  }, [])

  /*
   * Date label.
   */
  const currentDateLabel = useMemo(() => {
    if (view === 'day') {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    }

    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }, [date, view])

  /*
   * Filter attendance according to role.
   */
  const filteredAttendance = useMemo(() => {
    let result = [...attendance]

    /*
     * ==========================================
     * EMPLOYEE
     * ==========================================
     *
     * Employee should NEVER see another
     * employee's attendance.
     *
     * Best case:
     * backend already returns only their records.
     *
     * We additionally filter using employee ID
     * when that information exists.
     */
    if (isEmployee) {
      if (currentUser?.employee_id) {
        result = result.filter(
          (entry) =>
            String(entry.employee_id) ===
            String(currentUser.employee_id),
        )
      } else if (currentUser?.id) {
        result = result.filter(
          (entry) =>
            String(entry.employee_id) ===
            String(currentUser.id),
        )
      } else if (currentUser?.name) {
        result = result.filter(
          (entry) =>
            entry.employee_name === currentUser.name ||
            entry.employee === currentUser.name,
        )
      }
    }

    /*
     * ==========================================
     * DAY VIEW
     * ==========================================
     */
    if (view === 'day') {
      const selectedYear = date.getFullYear()
      const selectedMonth = date.getMonth()
      const selectedDay = date.getDate()

      result = result.filter((entry) => {
        if (!entry.date) return false

        const entryDate = new Date(entry.date)

        /*
         * Handle ISO date strings.
         */
        if (!Number.isNaN(entryDate.getTime())) {
          return (
            entryDate.getFullYear() === selectedYear &&
            entryDate.getMonth() === selectedMonth &&
            entryDate.getDate() === selectedDay
          )
        }

        /*
         * Handle YYYY-MM-DD manually.
         */
        const parts = entry.date.split('-')

        if (parts.length === 3) {
          return (
            Number(parts[0]) === selectedYear &&
            Number(parts[1]) - 1 === selectedMonth &&
            Number(parts[2]) === selectedDay
          )
        }

        return false
      })
    }

    /*
     * ==========================================
     * SEARCH
     * ==========================================
     *
     * Search is ONLY meaningful for Admin/HR.
     */
    if (isAdminOrHR && search.trim()) {
      const query = search.toLowerCase().trim()

      result = result.filter((entry) => {
        return (
          entry.employee?.toLowerCase().includes(query) ||
          entry.employee_name?.toLowerCase().includes(query) ||
          entry.date?.toLowerCase().includes(query) ||
          entry.status?.toLowerCase().includes(query)
        )
      })
    }

    return result
  }, [
    attendance,
    date,
    view,
    search,
    isAdminOrHR,
    isEmployee,
    currentUser,
  ])

  /*
   * ==========================================
   * STATISTICS
   * ==========================================
   */
  const presentDays = attendance.filter(
    (item) => item.status === 'Present',
  ).length

  const leaveDays = attendance.filter(
    (item) => item.status === 'Leave',
  ).length

  const absentDays = attendance.filter(
    (item) => item.status === 'Absent',
  ).length

  const totalWorkingDays = attendance.filter(
    (item) =>
      item.status === 'Present' ||
      item.status === 'Half Day',
  ).length

  /*
   * ==========================================
   * DATE NAVIGATION
   * ==========================================
   */

  const goPrevious = () => {
    setDate((current) => {
      const next = new Date(current)

      if (view === 'day') {
        next.setDate(next.getDate() - 1)
      } else {
        next.setMonth(next.getMonth() - 1)
      }

      return next
    })
  }

  const goNext = () => {
    setDate((current) => {
      const next = new Date(current)

      if (view === 'day') {
        next.setDate(next.getDate() + 1)
      } else {
        next.setMonth(next.getMonth() + 1)
      }

      return next
    })
  }

  const goToday = () => {
    setDate(new Date())
  }

  return (
    <AppLayout title="Attendance">
      <div className="space-y-5">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="section-header">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-dayflow-green">
              Attendance
            </div>

            <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-dayflow-text">
              {isAdmin
                ? 'Attendance List'
                : isHR
                  ? 'Attendance List'
                  : 'My Attendance'}
            </h2>

            <p className="mt-1 text-sm text-dayflow-muted">
              {isAdmin
                ? 'Monitor attendance for all employees.'
                : isHR
                  ? 'Monitor attendance for all employees.'
                  : 'Track your attendance and working hours.'}
            </p>
          </div>
        </div>

        {/* =====================================================
            MAIN ATTENDANCE CARD
        ====================================================== */}

        <Card className="overflow-hidden">

          {/* =================================================
              TAB
          ================================================== */}

          <div className="flex items-center border-b border-dayflow-border">
            <div className="border-b-2 border-dayflow-green px-5 py-3 text-sm font-medium text-dayflow-green">
              Attendance
            </div>
          </div>

          {/* =================================================
              CONTROLS
          ================================================== */}

          <div className="flex flex-col gap-4 border-b border-dayflow-border p-4 lg:flex-row lg:items-center lg:justify-between">

            {/* ADMIN / HR SEARCH */}
            {isAdminOrHR ? (
              <div className="relative w-full lg:w-[280px]">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-dayflow-muted"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search employee"
                  className="h-10 w-full rounded-xl border border-dayflow-border bg-white pl-9 pr-3 text-sm text-dayflow-text outline-none transition focus:border-dayflow-green"
                />
              </div>
            ) : (
              <div className="text-sm text-dayflow-muted">
                Attendance for{' '}
                <span className="font-medium text-dayflow-text">
                  {currentUser?.name || 'Employee'}
                </span>
              </div>
            )}

            {/* DATE CONTROLS */}

            <div className="flex flex-wrap items-center gap-2">

              <button
                type="button"
                onClick={goPrevious}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-dayflow-border bg-white text-dayflow-muted transition hover:bg-dayflow-bg hover:text-dayflow-text"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                onClick={goNext}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-dayflow-border bg-white text-dayflow-muted transition hover:bg-dayflow-bg hover:text-dayflow-text"
              >
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                onClick={goToday}
                className="flex h-9 items-center gap-2 rounded-lg border border-dayflow-border bg-white px-3 text-sm font-medium text-dayflow-text transition hover:bg-dayflow-bg"
              >
                <CalendarDays size={15} />

                {currentDateLabel}
              </button>

              <div className="flex rounded-lg border border-dayflow-border bg-white p-0.5">

                <button
                  type="button"
                  onClick={() => setView('day')}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    view === 'day'
                      ? 'bg-dayflow-green text-white'
                      : 'text-dayflow-muted hover:bg-dayflow-bg'
                  }`}
                >
                  Day
                </button>

                <button
                  type="button"
                  onClick={() => setView('month')}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    view === 'month'
                      ? 'bg-dayflow-green text-white'
                      : 'text-dayflow-muted hover:bg-dayflow-bg'
                  }`}
                >
                  Month
                </button>

              </div>
            </div>
          </div>

          {/* =================================================
              SUMMARY
          ================================================== */}

          <div className="grid grid-cols-2 border-b border-dayflow-border md:grid-cols-4">

            <div className="border-r border-dayflow-border p-4">
              <div className="text-xs text-dayflow-muted">
                Present Days
              </div>

              <div className="mt-2 text-xl font-semibold text-dayflow-text">
                {presentDays}
              </div>
            </div>

            <div className="border-r border-dayflow-border p-4">
              <div className="text-xs text-dayflow-muted">
                Leave Days
              </div>

              <div className="mt-2 text-xl font-semibold text-dayflow-text">
                {leaveDays}
              </div>
            </div>

            <div className="border-r border-dayflow-border p-4">
              <div className="text-xs text-dayflow-muted">
                Leaves Count
              </div>

              <div className="mt-2 text-xl font-semibold text-dayflow-text">
                {absentDays}
              </div>
            </div>

            <div className="p-4">
              <div className="text-xs text-dayflow-muted">
                Total Working Days
              </div>

              <div className="mt-2 text-xl font-semibold text-dayflow-text">
                {totalWorkingDays}
              </div>
            </div>

          </div>

          {/* =================================================
              DATE
          ================================================== */}

          <div className="border-b border-dayflow-border px-5 py-4">
            <div className="text-sm font-semibold text-dayflow-text">
              {currentDateLabel}
            </div>
          </div>

          {/* =================================================
              TABLE
          ================================================== */}

          <div className="overflow-x-auto">

            {loading ? (
              <div className="px-5 py-12 text-center text-sm text-dayflow-muted">
                Loading attendance…
              </div>
            ) : filteredAttendance.length === 0 ? (
              <div className="px-5 py-12 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-dayflow-bg">
                  <CalendarDays
                    size={20}
                    className="text-dayflow-muted"
                  />
                </div>

                <div className="mt-3 text-sm font-medium text-dayflow-text">
                  No attendance records
                </div>

                <div className="mt-1 text-xs text-dayflow-muted">
                  No attendance records were found for this date.
                </div>

              </div>
            ) : (
              <table className="min-w-[850px] w-full text-left">

                <thead className="bg-dayflow-bg">

                  <tr className="border-b border-dayflow-border">

                    {/* ONLY ADMIN / HR */}
                    {isAdminOrHR && (
                      <th className="px-5 py-3 text-xs font-medium text-dayflow-muted">
                        Employee
                      </th>
                    )}

                    <th className="px-5 py-3 text-xs font-medium text-dayflow-muted">
                      Date
                    </th>

                    <th className="px-5 py-3 text-xs font-medium text-dayflow-muted">
                      Check In
                    </th>

                    <th className="px-5 py-3 text-xs font-medium text-dayflow-muted">
                      Check Out
                    </th>

                    <th className="px-5 py-3 text-xs font-medium text-dayflow-muted">
                      Work Hours
                    </th>

                    <th className="px-5 py-3 text-xs font-medium text-dayflow-muted">
                      Extra Hours
                    </th>

                    {/* Employee sees status */}
                    {isEmployee && (
                      <th className="px-5 py-3 text-xs font-medium text-dayflow-muted">
                        Status
                      </th>
                    )}

                  </tr>

                </thead>

                <tbody>

                  {filteredAttendance.map((entry) => (

                    <tr
                      key={entry.id}
                      className="border-b border-dayflow-border last:border-0 transition hover:bg-dayflow-bg/50"
                    >

                      {/* =================================================
                          EMPLOYEE COLUMN
                          ONLY ADMIN / HR
                      ================================================== */}

                      {isAdminOrHR && (
                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-dayflow-blueSoft text-xs font-semibold text-dayflow-blue">
                              {(
                                entry.employee_name ||
                                entry.employee ||
                                'E'
                              )[0].toUpperCase()}
                            </div>

                            <div>

                              <div className="text-sm font-medium text-dayflow-text">
                                {entry.employee_name ||
                                  entry.employee ||
                                  'Employee'}
                              </div>

                              <div className="text-xs text-dayflow-muted">
                                Employee
                              </div>

                            </div>

                          </div>

                        </td>
                      )}

                      {/* DATE */}

                      <td className="px-5 py-4 text-sm text-dayflow-text">
                        {entry.date}
                      </td>

                      {/* CHECK IN */}

                      <td className="px-5 py-4 text-sm text-dayflow-muted">
                        {entry.check_in || '—'}
                      </td>

                      {/* CHECK OUT */}

                      <td className="px-5 py-4 text-sm text-dayflow-muted">
                        {entry.check_out || '—'}
                      </td>

                      {/* WORK HOURS */}

                      <td className="px-5 py-4 text-sm font-medium text-dayflow-text">
                        {entry.work_hours ?? 0}h
                      </td>

                      {/* EXTRA HOURS */}

                      <td className="px-5 py-4 text-sm text-dayflow-text">
                        {entry.extra_hours ?? 0}h
                      </td>

                      {/* STATUS ONLY EMPLOYEE */}

                      {isEmployee && (
                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              entry.status &&
                              markStatusColor[
                                entry.status as keyof typeof markStatusColor
                              ]
                                ? markStatusColor[
                                    entry.status as keyof typeof markStatusColor
                                  ]
                                : 'bg-dayflow-bg text-dayflow-muted'
                            }`}
                          >
                            {entry.status || 'Unknown'}
                          </span>

                        </td>
                      )}

                    </tr>

                  ))}

                </tbody>

              </table>
            )}

          </div>

          {/* =================================================
              FOOTER
          ================================================== */}

          <div className="flex flex-col gap-2 border-t border-dayflow-border bg-dayflow-bg px-5 py-3 text-xs text-dayflow-muted sm:flex-row sm:items-center sm:justify-between">

            <span>
              {filteredAttendance.length}{' '}
              {filteredAttendance.length === 1
                ? 'record'
                : 'records'}
            </span>

            <span>
              Attendance data is used for working-hours and payroll
              calculations.
            </span>

          </div>

        </Card>
      </div>
    </AppLayout>
  )
}