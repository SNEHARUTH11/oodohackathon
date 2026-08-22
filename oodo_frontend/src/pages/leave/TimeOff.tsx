import { useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Plus,
  Search,
  X,
} from 'lucide-react'

import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { leaveRequests, publicHolidays } from '../../data/mockData'

const statusClasses = {
  approved: 'bg-dayflow-greenSoft text-dayflow-success',
  pending: 'bg-amber-50 text-dayflow-warning',
  rejected: 'bg-red-50 text-red-600',
} as const

const leaveTypeClasses = {
  'Paid Time Off': 'bg-dayflow-blueSoft text-dayflow-blue',
  'Sick Leave': 'bg-amber-50 text-dayflow-warning',
  'Unpaid Leave': 'bg-red-50 text-red-600',
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function TimeOff() {
  const [open, setOpen] = useState(false)
  const [activeMonth, setActiveMonth] = useState(9)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'requests' | 'allocation'>(
    'requests',
  )

  const { user } = useAuth()
  const isAdmin = (user?.role === 'admin' || user?.role === 'hr_officer')

  const filteredRequests = useMemo(() => {
    const query = search.toLowerCase().trim()

    if (!query) return leaveRequests

    return leaveRequests.filter((item: any) => {
      return (
        item.leave_type?.toLowerCase().includes(query) ||
        item.status?.toLowerCase().includes(query) ||
        item.employee_name?.toLowerCase().includes(query) ||
        item.employee?.toLowerCase().includes(query)
      )
    })
  }, [search])

  const calendarDays = useMemo(() => {
    const year = new Date().getFullYear()

    const firstDay = new Date(year, activeMonth, 1).getDay()
    const totalDays = new Date(year, activeMonth + 1, 0).getDate()

    const days: Array<number | null> = []

    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    for (let day = 1; day <= totalDays; day++) {
      days.push(day)
    }

    return days
  }, [activeMonth])

  const getLeaveForDay = (day: number) => {
    const year = new Date().getFullYear()

    return leaveRequests.filter((item: any) => {
      if (!item.start_date) return false

      const start = new Date(item.start_date)
      const end = item.end_date
        ? new Date(item.end_date)
        : new Date(item.start_date)

      const current = new Date(year, activeMonth, day)

      current.setHours(0, 0, 0, 0)
      start.setHours(0, 0, 0, 0)
      end.setHours(0, 0, 0, 0)

      return current >= start && current <= end
    })
  }

  const handlePreviousMonth = () => {
    setActiveMonth((current) => (current === 0 ? 11 : current - 1))
  }

  const handleNextMonth = () => {
    setActiveMonth((current) => (current === 11 ? 0 : current + 1))
  }

  const handleApprove = (id: string | number) => {
    console.log('Approve leave request:', id)
  }

  const handleReject = (id: string | number) => {
    console.log('Reject leave request:', id)
  }

  return (
    <AppLayout title="Time Off">
      <div className="space-y-6">
        {/* ---------------------------------------------------- */}
        {/* PAGE HEADER */}
        {/* ---------------------------------------------------- */}

        <div className="section-header">
          <div>
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-dayflow-green">
              <CalendarDays size={15} />
              Leave management
            </div>

            <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-dayflow-text">
              <span className="inline-flex items-center gap-2">
                Time Off
                {!isAdmin && (
                  <span className="rounded-full bg-violet-500 px-2 py-0.5 text-xs font-semibold text-white">NEW</span>
                )}
              </span>
            </h2>

            <p className="mt-1 text-sm text-dayflow-muted">
              {isAdmin
                ? 'Review and manage employee time off requests.'
                : 'View your leave balance and manage your time off.'}
            </p>
          </div>

          <Button onClick={() => setOpen(true)}>
            <Plus size={16} className="mr-2" />
            NEW TIME OFF
          </Button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* ADMIN / HR VIEW */}
        {/* ---------------------------------------------------- */}

        {isAdmin ? (
          <div className="space-y-5">
            {/* Top navigation tabs */}
            <Card className="overflow-hidden">
              <div className="flex items-center border-b border-dayflow-border">
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`px-5 py-3 text-sm font-medium transition ${
                    activeTab === 'requests'
                      ? 'border-b-2 border-dayflow-green text-dayflow-green'
                      : 'text-dayflow-muted hover:text-dayflow-text'
                  }`}
                >
                  Time Off
                </button>

                <button
                  onClick={() => setActiveTab('allocation')}
                  className={`px-5 py-3 text-sm font-medium transition ${
                    activeTab === 'allocation'
                      ? 'border-b-2 border-dayflow-green text-dayflow-green'
                      : 'text-dayflow-muted hover:text-dayflow-text'
                  }`}
                >
                  Allocation
                </button>
              </div>

              {/* Secondary controls */}
              <div className="flex flex-col gap-4 border-b border-dayflow-border p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2">
                  <button
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${
                      activeTab === 'requests'
                        ? 'bg-dayflow-green text-white'
                        : 'bg-dayflow-bg text-dayflow-muted'
                    }`}
                  >
                    All
                  </button>

                  <button className="rounded-lg px-4 py-2 text-sm font-medium text-dayflow-muted hover:bg-dayflow-bg">
                    Pending
                  </button>

                  <button className="rounded-lg px-4 py-2 text-sm font-medium text-dayflow-muted hover:bg-dayflow-bg">
                    Approved
                  </button>
                </div>

                <div className="relative w-full lg:w-[260px]">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-dayflow-muted"
                  />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search"
                    className="h-10 w-full rounded-xl border border-dayflow-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-dayflow-green"
                  />
                </div>
              </div>

              {/* Request table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-dayflow-border bg-dayflow-bg">
                      <th className="px-4 py-3 text-left font-medium text-dayflow-muted">
                        Employee
                      </th>

                      <th className="px-4 py-3 text-left font-medium text-dayflow-muted">
                        Time Off Type
                      </th>

                      <th className="px-4 py-3 text-left font-medium text-dayflow-muted">
                        Start Date
                      </th>

                      <th className="px-4 py-3 text-left font-medium text-dayflow-muted">
                        End Date
                      </th>

                      <th className="px-4 py-3 text-left font-medium text-dayflow-muted">
                        Days
                      </th>

                      <th className="px-4 py-3 text-left font-medium text-dayflow-muted">
                        Status
                      </th>

                      <th className="px-4 py-3 text-right font-medium text-dayflow-muted">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map((item: any) => (
                        <tr
                          key={item.id}
                          className="border-b border-dayflow-border last:border-0 hover:bg-dayflow-bg/60"
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-dayflow-blueSoft text-xs font-semibold text-dayflow-blue">
                                {(item.employee_name ||
                                  item.employee ||
                                  'A')[0]}
                              </div>

                              <div>
                                <div className="font-medium text-dayflow-text">
                                  {item.employee_name ||
                                    item.employee ||
                                    'Aisha Khan'}
                                </div>

                                <div className="text-xs text-dayflow-muted">
                                  Employee
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-dayflow-text">
                            {item.leave_type}
                          </td>

                          <td className="px-4 py-4 text-dayflow-muted">
                            {item.start_date}
                          </td>

                          <td className="px-4 py-4 text-dayflow-muted">
                            {item.end_date || item.start_date}
                          </td>

                          <td className="px-4 py-4 text-dayflow-text">
                            {item.days || '1'} Days
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                statusClasses[item.status]
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-2">
                              {item.status === 'pending' ? (
                                <>
                                  <button
                                    onClick={() => handleReject(item.id)}
                                    title="Reject"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                                  >
                                    <X size={15} />
                                  </button>

                                  <button
                                    onClick={() => handleApprove(item.id)}
                                    title="Approve"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-dayflow-greenSoft text-dayflow-success transition hover:opacity-80"
                                  >
                                    <Check size={15} />
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs text-dayflow-muted">
                                  No action
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-12 text-center text-dayflow-muted"
                        >
                          No time off requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Admin allocation cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-5">
                <div className="text-sm text-dayflow-muted">
                  Paid Time Off
                </div>

                <div className="mt-2 text-3xl font-semibold text-dayflow-text">
                  24
                </div>

                <div className="mt-1 text-xs text-dayflow-muted">
                  Days allocated
                </div>
              </Card>

              <Card className="p-5">
                <div className="text-sm text-dayflow-muted">
                  Sick Leave
                </div>

                <div className="mt-2 text-3xl font-semibold text-dayflow-text">
                  12
                </div>

                <div className="mt-1 text-xs text-dayflow-muted">
                  Days allocated
                </div>
              </Card>

              <Card className="p-5">
                <div className="text-sm text-dayflow-muted">
                  Unpaid Leave
                </div>

                <div className="mt-2 text-3xl font-semibold text-dayflow-text">
                  Unlimited
                </div>

                <div className="mt-1 text-xs text-dayflow-muted">
                  Based on company policy
                </div>
              </Card>
            </div>
          </div>
        ) : (
          /* ---------------------------------------------------- */
          /* EMPLOYEE VIEW */
          /* ---------------------------------------------------- */

          <div className="space-y-5">
            {/* Leave balance */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="relative overflow-hidden p-5">
                <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-dayflow-greenSoft opacity-70" />

                <div className="relative">
                  <div className="flex items-center gap-2 text-sm text-dayflow-muted">
                    <Clock3 size={15} />
                    Paid Time Off
                  </div>

                  <div className="mt-3 text-3xl font-semibold text-dayflow-text">
                    12
                  </div>

                  <div className="mt-1 text-xs text-dayflow-muted">
                    Days available
                  </div>
                </div>
              </Card>

              <Card className="relative overflow-hidden p-5">
                <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-dayflow-blueSoft opacity-70" />

                <div className="relative">
                  <div className="flex items-center gap-2 text-sm text-dayflow-muted">
                    <Clock3 size={15} />
                    Sick Leave
                  </div>

                  <div className="mt-3 text-3xl font-semibold text-dayflow-text">
                    8
                  </div>

                  <div className="mt-1 text-xs text-dayflow-muted">
                    Days available
                  </div>
                </div>
              </Card>

              <Card className="relative overflow-hidden p-5">
                <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-amber-50 opacity-70" />

                <div className="relative">
                  <div className="flex items-center gap-2 text-sm text-dayflow-muted">
                    <Clock3 size={15} />
                    Unpaid Leave
                  </div>

                  <div className="mt-3 text-3xl font-semibold text-dayflow-text">
                    2
                  </div>

                  <div className="mt-1 text-xs text-dayflow-muted">
                    Days used
                  </div>
                </div>
              </Card>
            </div>

            {/* Calendar + side panel */}
            <div className="grid gap-5 xl:grid-cols-[1.55fr_0.65fr]">
              <Card className="overflow-hidden">
                {/* Calendar header */}
                <div className="flex flex-col gap-4 border-b border-dayflow-border p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm text-dayflow-muted">
                      Your Time Off
                    </div>

                    <h3 className="mt-1 text-xl font-semibold text-dayflow-text">
                      {months[activeMonth]}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePreviousMonth}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-dayflow-border bg-white text-dayflow-muted transition hover:bg-dayflow-bg hover:text-dayflow-text"
                    >
                      <ChevronLeft size={17} />
                    </button>

                    <button
                      onClick={() => setActiveMonth(new Date().getMonth())}
                      className="rounded-lg border border-dayflow-border bg-white px-3 py-2 text-xs font-medium text-dayflow-text transition hover:bg-dayflow-bg"
                    >
                      Today
                    </button>

                    <button
                      onClick={handleNextMonth}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-dayflow-border bg-white text-dayflow-muted transition hover:bg-dayflow-bg hover:text-dayflow-text"
                    >
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>

                {/* Calendar */}
                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-7 border-l border-t border-dayflow-border">
                    {weekdays.map((day) => (
                      <div
                        key={day}
                        className="border-b border-r border-dayflow-border bg-dayflow-bg px-2 py-3 text-center text-xs font-semibold text-dayflow-muted"
                      >
                        {day}
                      </div>
                    ))}

                    {calendarDays.map((day, index) => {
                      const dayLeaves = day ? getLeaveForDay(day) : []

                      return (
                        <div
                          key={`${day}-${index}`}
                          className={`min-h-[90px] border-b border-r border-dayflow-border p-2 ${
                            !day ? 'bg-dayflow-bg/50' : 'bg-white'
                          }`}
                        >
                          {day && (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-dayflow-text">
                                  {day}
                                </span>

                                {dayLeaves.length > 0 && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-dayflow-green" />
                                )}
                              </div>

                              <div className="mt-2 space-y-1">
                                {dayLeaves.slice(0, 2).map((item: any) => (
                                  <div
                                    key={`${item.id}-${day}`}
                                    className={`truncate rounded-md px-1.5 py-1 text-[10px] font-medium ${
                                      leaveTypeClasses[item.leave_type] ||
                                      'bg-dayflow-blueSoft text-dayflow-blue'
                                    }`}
                                    title={item.leave_type}
                                  >
                                    {item.leave_type}
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 border-t border-dayflow-border px-5 py-4">
                  <div className="flex items-center gap-2 text-xs text-dayflow-muted">
                    <span className="h-2.5 w-2.5 rounded-full bg-dayflow-blue" />
                    Paid Time Off
                  </div>

                  <div className="flex items-center gap-2 text-xs text-dayflow-muted">
                    <span className="h-2.5 w-2.5 rounded-full bg-dayflow-warning" />
                    Sick Leave
                  </div>

                  <div className="flex items-center gap-2 text-xs text-dayflow-muted">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    Unpaid Leave
                  </div>
                </div>
              </Card>

              {/* Right panel */}
              <div className="space-y-5">
                {/* Time off types */}
                <Card className="p-5">
                  <div className="mb-4">
                    <h3 className="font-semibold text-dayflow-text">
                      Time Off Types
                    </h3>

                    <p className="mt-1 text-xs text-dayflow-muted">
                      Available leave categories
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl border border-dayflow-border bg-dayflow-bg p-3">
                      <div className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-dayflow-blue" />
                        <span className="text-sm text-dayflow-text">
                          Paid Time Off
                        </span>
                      </div>

                      <span className="text-sm font-semibold text-dayflow-text">
                        12
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-dayflow-border bg-dayflow-bg p-3">
                      <div className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-dayflow-warning" />
                        <span className="text-sm text-dayflow-text">
                          Sick Leave
                        </span>
                      </div>

                      <span className="text-sm font-semibold text-dayflow-text">
                        8
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-dayflow-border bg-dayflow-bg p-3">
                      <div className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                        <span className="text-sm text-dayflow-text">
                          Unpaid Leave
                        </span>
                      </div>

                      <span className="text-sm font-semibold text-dayflow-text">
                        2
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Upcoming requests */}
                <Card className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-dayflow-text">
                        My Requests
                      </h3>

                      <p className="mt-1 text-xs text-dayflow-muted">
                        Recent time off requests
                      </p>
                    </div>

                    <FileText size={18} className="text-dayflow-muted" />
                  </div>

                  <div className="space-y-3">
                    {leaveRequests.slice(0, 4).map((item: any) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-dayflow-border bg-dayflow-bg p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-medium text-dayflow-text">
                              {item.leave_type}
                            </div>

                            <div className="mt-1 text-xs text-dayflow-muted">
                              {item.start_date}
                              {item.end_date &&
                                ` — ${item.end_date}`}
                            </div>
                          </div>

                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                              statusClasses[item.status]
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Public holidays */}
                <Card className="p-5">
                  <div className="mb-4">
                    <h3 className="font-semibold text-dayflow-text">
                      Public Holidays
                    </h3>

                    <p className="mt-1 text-xs text-dayflow-muted">
                      Upcoming company holidays
                    </p>
                  </div>

                  <div className="space-y-3">
                    {publicHolidays.slice(0, 4).map((holiday) => (
                      <div
                        key={holiday.id}
                        className="flex items-center justify-between border-b border-dayflow-border pb-3 last:border-0 last:pb-0"
                      >
                        <div>
                          <div className="text-sm font-medium text-dayflow-text">
                            {holiday.name}
                          </div>

                          <div className="mt-1 text-xs text-dayflow-muted">
                            {holiday.date}
                          </div>
                        </div>

                        <div className="rounded-full bg-dayflow-blueSoft px-2 py-1 text-[10px] font-medium text-dayflow-blue">
                          Holiday
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* NEW TIME OFF MODAL */}
      {/* ---------------------------------------------------- */}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create Time Off Request"
      >
        <form className="space-y-5">
          {/* Employee */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-dayflow-muted">
                Employee
              </label>

              <div className="flex h-11 items-center rounded-xl border border-dayflow-border bg-dayflow-bg px-3 text-sm text-dayflow-text">
                Aisha Khan
              </div>
            </div>

            {/* Leave type */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-dayflow-muted">
                Time Off Type
              </label>

              <select className="h-11 w-full rounded-xl border border-dayflow-border bg-white px-3 text-sm text-dayflow-text outline-none focus:border-dayflow-green">
                <option>Paid Time Off</option>
                <option>Sick Leave</option>
                <option>Unpaid Leave</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-dayflow-muted">
                Start Date
              </label>

              <input
                className="h-11 w-full rounded-xl border border-dayflow-border bg-white px-3 text-sm outline-none focus:border-dayflow-green"
                type="date"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-dayflow-muted">
                End Date
              </label>

              <input
                className="h-11 w-full rounded-xl border border-dayflow-border bg-white px-3 text-sm outline-none focus:border-dayflow-green"
                type="date"
              />
            </div>
          </div>

          {/* Allocation */}
          <div className="rounded-xl border border-dayflow-border bg-dayflow-bg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-dayflow-muted">
                Available allocation
              </span>

              <span className="text-sm font-semibold text-dayflow-text">
                12 Days
              </span>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-dayflow-muted">
              Remarks
            </label>

            <textarea
              className="min-h-[100px] w-full rounded-xl border border-dayflow-border bg-white px-3 py-2 text-sm outline-none focus:border-dayflow-green"
              placeholder="Add a reason or additional information..."
            />
          </div>

          {/* Attachment */}
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-dayflow-muted">
              Attachment
            </label>

            <div className="flex items-center justify-between rounded-xl border border-dashed border-dayflow-border bg-dayflow-bg p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-dayflow-blueSoft text-dayflow-blue">
                  <FileText size={17} />
                </div>

                <div>
                  <div className="text-sm font-medium text-dayflow-text">
                    certificate.pdf
                  </div>

                  <div className="text-xs text-dayflow-muted">
                    PDF document
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="text-xs font-medium text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t border-dayflow-border pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setOpen(false)}
            >
              Discard
            </Button>

            <Button type="submit">
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  )
}