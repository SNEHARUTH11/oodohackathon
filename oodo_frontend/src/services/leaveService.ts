import { USE_MOCK_DATA } from '../api'
import { leaveRequests } from '../data/mockData'
import { api, handleApiError } from './api'

const getUserRole = (): string => {
  try {
    const raw = localStorage.getItem('dayflow-auth')
    if (!raw) return 'employee'
    const parsed = JSON.parse(raw) as { user?: { role?: string } }
    return parsed.user?.role ?? 'employee'
  } catch {
    return 'employee'
  }
}

const getRequestListPath = () => {
  const role = getUserRole()
  if (role === 'admin' || role === 'hr_officer') {
    return '/admin/timeoff/request/list/'
  }
  return '/employee/timeoff/request/list/'
}

export const leaveService = {
  getLeaves: async () => {
    if (USE_MOCK_DATA) return leaveRequests
    try {
      const { data } = await api.get(getRequestListPath())
      return data?.data?.items ?? data?.items ?? data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load leave requests'))
    }
  },

  getBalances: async () => {
    if (USE_MOCK_DATA) return { paid: { available: 12 }, sick: { available: 8 }, unpaid: { used: 2 } }
    try {
      const { data } = await api.get('/employee/timeoff/balance/view/')
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load leave balances'))
    }
  },

  getCalendar: async (year?: number) => {
    if (USE_MOCK_DATA) return null
    try {
      const params = year ? { year } : {}
      const { data } = await api.get('/employee/timeoff/calendar/', { params })
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load leave calendar'))
    }
  },

  createLeave: async (payload: Record<string, unknown>) => {
    if (USE_MOCK_DATA) return { ...payload, id: `l-${Date.now()}`, status: 'pending' }
    try {
      const { data } = await api.post('/employee/timeoff/request/create/', payload)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to submit leave request'))
    }
  },

  cancelLeave: async (id: string) => {
    if (USE_MOCK_DATA) return { id, status: 'cancelled' }
    try {
      const { data } = await api.post(`/employee/timeoff/request/cancel/${id}/`)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to cancel leave request'))
    }
  },

  approveLeave: async (id: string, reviewComment?: string) => {
    if (USE_MOCK_DATA) return { id, status: 'approved', review_comment: reviewComment }
    try {
      const { data } = await api.post(`/admin/timeoff/request/approve/${id}/`, {
        comment: reviewComment ?? '',
      })
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to approve leave'))
    }
  },

  rejectLeave: async (id: string, reviewComment?: string) => {
    if (USE_MOCK_DATA) return { id, status: 'rejected', review_comment: reviewComment }
    try {
      const { data } = await api.post(`/admin/timeoff/request/reject/${id}/`, {
        comment: reviewComment ?? '',
      })
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to reject leave'))
    }
  },

  getAllocations: async () => {
    if (USE_MOCK_DATA) return []

    try {
      const { data } = await api.get('/admin/timeoff/allocation/list/')
      return data?.data?.items ?? data?.items ?? data?.data ?? data ?? []
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load time-off allocations'))
    }
  },

  updateAllocation: async (employeeId: string, payload: Record<string, unknown>) => {
    if (USE_MOCK_DATA) return { employee_id: employeeId, ...payload }

    try {
      const { data } = await api.patch(`/admin/timeoff/allocation/update/${employeeId}/`, payload)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to update time-off allocation'))
    }
  }
}
