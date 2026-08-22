import { USE_MOCK_DATA } from '../api'
import { leaveRequests } from '../data/mockData'
import { api, handleApiError } from './api'

export const leaveService = {
  getLeaves: async () => {
    if (USE_MOCK_DATA) return leaveRequests
    try {
      const { data } = await api.get('/leaves/')
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load leave requests'))
    }
  },

  createLeave: async (payload: Record<string, unknown>) => {
    if (USE_MOCK_DATA) return { ...payload, id: `l-${Date.now()}`, status: 'pending' }
    try {
      const { data } = await api.post('/leaves/', payload)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to submit leave request'))
    }
  },

  approveLeave: async (id: string) => {
    if (USE_MOCK_DATA) return { id, status: 'approved' }
    try {
      const { data } = await api.put(`/leaves/${id}/approve/`)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to approve leave'))
    }
  },

  rejectLeave: async (id: string, reviewComment?: string) => {
    if (USE_MOCK_DATA) return { id, status: 'rejected', review_comment: reviewComment }
    try {
      const { data } = await api.put(`/leaves/${id}/reject/`, { review_comment: reviewComment })
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to reject leave'))
    }
  }
}
