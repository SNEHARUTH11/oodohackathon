import { USE_MOCK_DATA } from '../api'
import { api, handleApiError } from './api'

export const dashboardService = {
  getEmployeeOverview: async (search?: string) => {
    if (USE_MOCK_DATA) return { counts: {}, cards: [], my_checkin: {}, alerts: [] }
    try {
      const { data } = await api.get('/employee/dashboard/overview/', { params: { search } })
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load dashboard'))
    }
  },

  getAdminOverview: async (search?: string) => {
    if (USE_MOCK_DATA) return { counts: {}, cards: [], payroll: {}, alerts: [] }
    try {
      const { data } = await api.get('/admin/dashboard/overview/', { params: { search } })
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load admin dashboard'))
    }
  }
}
