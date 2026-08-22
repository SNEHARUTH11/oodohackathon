import { USE_MOCK_DATA } from '../api'
import { attendance } from '../data/mockData'
import { api, handleApiError } from './api'

export type AttendanceStatus =
  | 'Present'
  | 'Absent'
  | 'Half Day'
  | 'Leave'

export interface Attendance {
  id: string
  employee_id: string
  date: string
  check_in?: string
  check_out?: string
  work_hours: number
  extra_hours: number
  status: AttendanceStatus
}

const fallbackAttendance = attendance

const getStatus = (error: unknown) =>
  Number(
    (error as {
      response?: {
        status?: number
      }
    })?.response?.status,
  )

export const attendanceService = {
  // =========================================================
  // EMPLOYEE ATTENDANCE
  // =========================================================

  getAttendance: async (
    month?: number,
    year?: number,
  ): Promise<Attendance[]> => {
    if (USE_MOCK_DATA) {
      return fallbackAttendance
    }

    try {
      const params: Record<string, unknown> = {}

      if (month) params.month = month
      if (year) params.year = year

      const { data } = await api.get(
        '/employee/attendance/list/',
        { params },
      )

      return (
        data?.data?.days ??
        data?.days ??
        []
      )
    } catch (error) {
      throw new Error(
        handleApiError(
          error,
          'Unable to load attendance',
        ),
      )
    }
  },

  // =========================================================
  // EMPLOYEE CHECK IN
  // =========================================================

  checkIn: async () => {
    if (USE_MOCK_DATA) {
      return {
        success: true,
        message: 'Check-in successful.',
      }
    }

    try {
      const { data } = await api.post(
        '/employee/attendance/check-in/',
      )

      return data?.data ?? data
    } catch (error) {
      throw new Error(
        handleApiError(
          error,
          'Unable to check in',
        ),
      )
    }
  },

  // =========================================================
  // EMPLOYEE CHECK OUT
  // =========================================================

  checkOut: async () => {
    if (USE_MOCK_DATA) {
      return {
        success: true,
        message: 'Check-out successful.',
      }
    }

    try {
      const { data } = await api.post(
        '/employee/attendance/check-out/',
      )

      return data?.data ?? data
    } catch (error) {
      throw new Error(
        handleApiError(
          error,
          'Unable to check out',
        ),
      )
    }
  },

  // =========================================================
  // EMPLOYEE TODAY STATE
  // =========================================================

  getTodayState: async () => {
    if (USE_MOCK_DATA) {
      return {
        can_check_in: true,
        can_check_out: false,
        checked_in: false,
      }
    }

    try {
      const { data } = await api.get(
        '/employee/attendance/today/',
      )

      return data?.data ?? data
    } catch (error) {
      throw new Error(
        handleApiError(
          error,
          'Unable to load attendance state',
        ),
      )
    }
  },

  // =========================================================
  // ADMIN - DAY LIST
  // =========================================================

  adminDayList: async (
    date?: string,
    search?: string,
  ): Promise<Attendance[]> => {
    if (USE_MOCK_DATA) {
      return []
    }

    try {
      const params: Record<string, unknown> = {}

      if (date) params.date = date
      if (search) params.search = search

      const { data } = await api.get(
        '/admin/attendance/day-list/',
        { params },
      )

      return (
        data?.data?.items ??
        data?.items ??
        []
      )
    } catch (error) {
      throw new Error(
        handleApiError(
          error,
          'Unable to load admin day list',
        ),
      )
    }
  },

  // =========================================================
  // ADMIN - MONTHLY LIST
  // =========================================================

  adminMonthlyList: async (
    employeeId: string,
    month?: number,
    year?: number,
  ) => {
    if (USE_MOCK_DATA) {
      return []
    }

    try {
      const params: Record<string, unknown> = {
        employee_id: employeeId,
      }

      if (month) params.month = month
      if (year) params.year = year

      const { data } = await api.get(
        '/admin/attendance/monthly-list/',
        { params },
      )

      return data?.data ?? data
    } catch (error) {
      throw new Error(
        handleApiError(
          error,
          'Unable to load admin monthly attendance',
        ),
      )
    }
  },

  // =========================================================
  // ADMIN - CREATE ATTENDANCE
  // =========================================================

  adminCreate: async (
    payload: Partial<Attendance>,
  ) => {
    if (USE_MOCK_DATA) {
      return {
        success: true,
      }
    }

    try {
      const { data } = await api.post(
        '/admin/attendance/create/',
        payload,
      )

      return data?.data ?? data
    } catch (error) {
      throw new Error(
        handleApiError(
          error,
          'Unable to create attendance',
        ),
      )
    }
  },

  // =========================================================
  // ADMIN - UPDATE ATTENDANCE
  // =========================================================

  adminUpdate: async (
    attendanceId: string,
    payload: Partial<Attendance>,
  ) => {
    if (USE_MOCK_DATA) {
      return {
        success: true,
      }
    }

    try {
      const { data } = await api.patch(
        `/admin/attendance/update/${attendanceId}/`,
        payload,
      )

      return data?.data ?? data
    } catch (error) {
      throw new Error(
        handleApiError(
          error,
          'Unable to update attendance',
        ),
      )
    }
  },

  // =========================================================
  // ADMIN - MISSED CHECKOUTS
  // =========================================================

  missedCheckouts: async () => {
    if (USE_MOCK_DATA) {
      return []
    }

    try {
      const { data } = await api.get(
        '/admin/attendance/missed-checkouts/',
      )

      return data?.data ?? data
    } catch (error) {
      throw new Error(
        handleApiError(
          error,
          'Unable to load missed checkouts',
        ),
      )
    }
  },
}