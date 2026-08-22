import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { attendanceService } from '../../services/attendanceService'
import { employeeService } from '../../services/employeeService'

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

const normalizeStatus = (value?: string | null) => {
  if (!value) return 'Absent'
  const raw = String(value).trim().toLowerCase()

  if (raw === 'present' || raw === 'p') return 'Present'
  if (raw === 'half_day' || raw === 'half day' || raw === 'half-day' || raw === 'hd') return 'Half Day'
  if (raw === 'leave' || raw === 'on_leave' || raw === 'on leave' || raw === 'l') return 'Leave'
  if (raw === 'absent' || raw === 'a') return 'Absent'
  if (raw === 'holiday' || raw === 'weekend') return 'Leave'
  return value
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

  const { user } = useAuth()

  const [todayState, setTodayState] = useState<any>(null)

  const [attendance, setAttendance] = useState<AttendanceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [adminModalOpen, setAdminModalOpen] = useState(false)
  const [employeesList, setEmployeesList] = useState<any[]>([])
  const [adminForm, setAdminForm] = useState<any>(null)

  /*
   * Load logged-in user.
   */
  useEffect(() => {
    // prefer AuthContext user when available
    if (user) {
      setCurrentUser(user as CurrentUser)
    } else {
      const local = getCurrentUser()
      setCurrentUser(local)
    }
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

    const fetchAdminDay = async (iso: string) => {
      const items = await attendanceService.adminDayList(iso, search)
      const mapped = (items ?? []).map((it: any, idx: number) => ({
        id: String(it.employee?.id ?? idx),
        date: iso,
        employee_name: it.employee?.name ?? it.employee?.full_name ?? it.employee?.login_id ?? 'Employee',
        employee_id: it.employee?.id ?? undefined,
        check_in: it.check_in ?? null,
        check_out: it.check_out ?? null,
        work_hours: it.work_hours ?? null,
        extra_hours: it.extra_hours ?? null,
        status: it.status ?? null,
      }))
      if (!ignore) setAttendance(mapped)
    }

    const loadAttendance = async () => {
      try {
        setLoading(true)

        if (isAdminOrHR && view === 'day') {
          const iso = date.toISOString().slice(0, 10)
          await fetchAdminDay(iso)
          return
        }

        const month = view === 'month' ? date.getMonth() + 1 : undefined
        const year = view === 'month' ? date.getFullYear() : undefined
        const days = await attendanceService.getAttendance(month, year)
        const mapped = (days ?? []).map((d: any) => ({
          id: d.id ?? String(d.date ?? `${d.employee_id ?? 'attendance'}-${Math.random()}`),
          date: typeof d.date === 'string' ? d.date : String(d.date),
          check_in: d.check_in ?? null,
          check_out: d.check_out ?? null,
          work_hours: d.work_hours ?? null,
          extra_hours: d.extra_hours ?? null,
          status: d.status ?? null,
          employee_name: d.employee_name ?? d.employee ?? d.name ?? undefined,
          employee_id: d.employee_id ?? d.employee?.id ?? undefined,
        }))

        if (!ignore) setAttendance(mapped)
      } catch (error) {
        console.error('Failed to load attendance:', error)
        if (!ignore) setAttendance([])
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    void loadAttendance()

    return () => {
      ignore = true
    }
  }, [date, view, search, isAdminOrHR, isEmployee, currentUser])

  // load employees for admin forms
  useEffect(() => {
    let ignore = false
    const loadEmployees = async () => {
      try {
        const emps = await employeeService.getEmployees()
        if (!ignore) setEmployeesList(emps ?? [])
      } catch {
        if (!ignore) setEmployeesList([])
      }
    }
    if (isAdminOrHR) void loadEmployees()
    return () => { ignore = true }
  }, [isAdminOrHR])

  // load today's state (check-in / check-out) for employees
  useEffect(() => {
    let ignore = false
    const loadState = async () => {
      if (!isEmployee) return
      try {
        const st = await attendanceService.getTodayState()
        if (!ignore) setTodayState(st)
      } catch (err) {
        console.error('Failed to load today state', err)
      }
    }
    void loadState()
    return () => { ignore = true }
  }, [isEmployee])

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
    let result = [...attendance.map((item) => ({ ...item, status: normalizeStatus(item.status) }))]

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
      if (currentUser?.employee_id && result.some((entry) => entry.employee_id != null)) {
        result = result.filter(
          (entry) =>
            String(entry.employee_id) ===
            String(currentUser.employee_id),
        )
      } else if (currentUser?.id && result.some((entry) => entry.employee_id != null)) {
        result = result.filter(
          (entry) =>
            String(entry.employee_id) ===
            String(currentUser.id),
        )
      } else if (currentUser?.name && result.some((entry) => entry.employee_name || entry.employee)) {
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
  const normalizedAttendance = attendance.map((item) => ({
    ...item,
    status: normalizeStatus(item.status),
  }))

  const presentDays = normalizedAttendance.filter(
    (item) => item.status === 'Present',
  ).length

  const leaveDays = normalizedAttendance.filter(
    (item) => item.status === 'Leave',
  ).length

  const absentDays = normalizedAttendance.filter(
    (item) => item.status === 'Absent',
  ).length

  const totalWorkingDays = normalizedAttendance.filter(
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

              {isEmployee && (
                <div className="mr-2 flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${todayState?.checked_in ? 'bg-dayflow-green' : 'bg-red-500'}`} />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        if (todayState?.can_check_out) {
                          await attendanceService.checkOut()
                        } else if (todayState?.can_check_in) {
                          await attendanceService.checkIn()
                        }
                        const st = await attendanceService.getTodayState()
                        setTodayState(st)
                        // reload attendance
                        const days = await attendanceService.getAttendance()
                        setAttendance(days ?? [])
                      } catch (err) {
                        console.error(err)
                      }
                    }}
                    className="h-9 rounded-lg border border-dayflow-border bg-dayflow-green px-3 text-sm font-medium text-white"
                  >
                    {todayState?.can_check_out ? 'Check Out' : todayState?.can_check_in ? 'Check In' : '—'}
                  </button>
                </div>
              )}

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

                      {isAdminOrHR && (
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setAdminForm({
                                attendance_id: entry.id,
                                employee_id: entry.employee_id,
                                date: entry.date,
                                check_in: entry.check_in ?? '',
                                check_out: entry.check_out ?? '',
                                status: entry.status ?? '',
                              })
                              setAdminModalOpen(true)
                            }}
                            className="rounded-md px-3 py-1 text-sm font-medium text-dayflow-green border border-dayflow-border"
                          >
                            Edit
                          </button>
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
        {/* Admin Edit Modal */}
        <Modal open={adminModalOpen} onClose={() => setAdminModalOpen(false)} title={adminForm ? 'Edit Attendance' : 'Create Attendance'}>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              try {
                if (adminForm?.attendance_id) {
                  await attendanceService.adminUpdate(adminForm.attendance_id, {
                    employee: adminForm.employee_id,
                    date: adminForm.date,
                    check_in: adminForm.check_in || null,
                    check_out: adminForm.check_out || null,
                    status: adminForm.status || null,
                  })
                } else {
                  await attendanceService.adminCreate({
                    employee: adminForm.employee_id,
                    date: adminForm.date,
                    check_in: adminForm.check_in || null,
                    check_out: adminForm.check_out || null,
                    status: adminForm.status || null,
                  })
                }

                // refresh day list
                const iso = new Date(adminForm.date).toISOString().slice(0, 10)
                const items = await attendanceService.adminDayList(iso, '')
                const mapped = (items ?? []).map((it: any, idx: number) => ({
                  id: String(idx),
                  date: String(it.date),
                  employee_name: it.employee?.name ?? it.employee?.full_name ?? it.employee?.login_id,
                  employee_id: it.employee?.id ?? undefined,
                  check_in: it.check_in ?? null,
                  check_out: it.check_out ?? null,
                  work_hours: it.work_hours ?? null,
                  extra_hours: it.extra_hours ?? null,
                  status: it.status ?? null,
                }))
                setAttendance(mapped)
                setAdminModalOpen(false)
              } catch (err) {
                console.error('Failed to save attendance', err)
              }
            }}
          >
            <div className="grid gap-3">
              <label className="block text-sm text-dayflow-muted">Employee</label>
              <select
                value={adminForm?.employee_id ?? ''}
                onChange={(e) => setAdminForm((s: any) => ({ ...(s ?? {}), employee_id: e.target.value }))}
                className="rounded-lg border border-dayflow-border p-2"
              >
                <option value="">Select employee</option>
                {employeesList.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name ?? emp.user?.name ?? emp.login_id}</option>
                ))}
              </select>

              <label className="block text-sm text-dayflow-muted">Date</label>
              <input
                type="date"
                value={adminForm?.date ?? ''}
                onChange={(e) => setAdminForm((s: any) => ({ ...(s ?? {}), date: e.target.value }))}
                className="rounded-lg border border-dayflow-border p-2"
              />

              <label className="block text-sm text-dayflow-muted">Check In</label>
              <input
                type="time"
                value={adminForm?.check_in ?? ''}
                onChange={(e) => setAdminForm((s: any) => ({ ...(s ?? {}), check_in: e.target.value }))}
                className="rounded-lg border border-dayflow-border p-2"
              />

              <label className="block text-sm text-dayflow-muted">Check Out</label>
              <input
                type="time"
                value={adminForm?.check_out ?? ''}
                onChange={(e) => setAdminForm((s: any) => ({ ...(s ?? {}), check_out: e.target.value }))}
                className="rounded-lg border border-dayflow-border p-2"
              />

              <label className="block text-sm text-dayflow-muted">Status</label>
              <select
                value={adminForm?.status ?? ''}
                onChange={(e) => setAdminForm((s: any) => ({ ...(s ?? {}), status: e.target.value }))}
                className="rounded-lg border border-dayflow-border p-2"
              >
                <option value="">Select status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
                <option value="Half Day">Half Day</option>
              </select>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setAdminModalOpen(false)} className="rounded-md px-4 py-2 border">Cancel</button>
                <button type="submit" className="rounded-md bg-dayflow-green px-4 py-2 text-white">Save</button>
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  )
}