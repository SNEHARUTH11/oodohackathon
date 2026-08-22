import { USE_MOCK_DATA } from '../api'
import { api, handleApiError } from './api'

const fallbackReports = {
  attendance: [
    { name: 'Mon', present: 20, absent: 3 },
    { name: 'Tue', present: 22, absent: 4 },
    { name: 'Wed', present: 18, absent: 5 },
    { name: 'Thu', present: 21, absent: 2 },
    { name: 'Fri', present: 19, absent: 3 }
  ],
  leave: [
    { name: 'Paid', value: 45 },
    { name: 'Sick', value: 18 },
    { name: 'Unpaid', value: 12 }
  ],
  payroll: [
    { name: 'Apr', total: 380000 },
    { name: 'May', total: 390000 },
    { name: 'Jun', total: 410000 }
  ]
}

export const reportService = {
  getAttendanceReport: async (month?: number, year?: number) => {
    if (USE_MOCK_DATA) {
      return fallbackReports.attendance
    }

    try {
      const params = { month, year }
      const { data } = await api.get('/admin/reports/attendance/monthly/', { params })
      return data?.data ?? data ?? fallbackReports.attendance
    } catch (error) {
      const status = Number((error as { response?: { status?: number } })?.response?.status)
      if (status === 401 || status === 403 || status === 404) {
        return fallbackReports.attendance
      }
      throw new Error(handleApiError(error, 'Unable to load attendance report'))
    }
  },

  exportAttendanceReport: async (month?: number, year?: number) => {
    try {
      const params = { month, year }
      const response = await api.get('/admin/reports/attendance/monthly/export/', { params, responseType: 'blob' })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to export attendance report'))
    }
  },

  getPayrollRegister: async (month?: number, year?: number) => {
    if (USE_MOCK_DATA) {
      return fallbackReports.payroll
    }

    try {
      const params = { month, year }
      const { data } = await api.get('/admin/reports/payroll/register/', { params })
      return data?.data ?? data ?? fallbackReports.payroll
    } catch (error) {
      const status = Number((error as { response?: { status?: number } })?.response?.status)
      if (status === 401 || status === 403 || status === 404) {
        return fallbackReports.payroll
      }
      throw new Error(handleApiError(error, 'Unable to load payroll report'))
    }
  },

  exportPayrollRegister: async (month?: number, year?: number) => {
    try {
      const params = { month, year }
      const response = await api.get('/admin/reports/payroll/register/export/', { params, responseType: 'blob' })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to export payroll register'))
    }
  },

  getLeaveSummary: async (month?: number, year?: number) => {
    if (USE_MOCK_DATA) {
      return fallbackReports.leave
    }

    try {
      const params = { month, year }
      const { data } = await api.get('/admin/reports/leave/summary/', { params })
      return data?.data ?? data ?? fallbackReports.leave
    } catch (error) {
      const status = Number((error as { response?: { status?: number } })?.response?.status)
      if (status === 401 || status === 403 || status === 404) {
        return fallbackReports.leave
      }
      throw new Error(handleApiError(error, 'Unable to load leave summary'))
    }
  },

  exportLeaveSummary: async (month?: number, year?: number) => {
    try {
      const params = { month, year }
      const response = await api.get('/admin/reports/leave/summary/export/', { params, responseType: 'blob' })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to export leave summary'))
    }
  },

  getAnalyticsOverview: async () => {
    if (USE_MOCK_DATA) return {}
    try {
      const { data } = await api.get('/admin/analytics/overview/')
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load analytics overview'))
    }
  }
}
