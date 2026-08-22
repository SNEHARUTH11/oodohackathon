import { USE_MOCK_DATA } from '../api'
import { notifications } from '../data/mockData'
import { api, handleApiError } from './api'

export const notificationService = {
  getNotifications: async () => {
    if (USE_MOCK_DATA) return notifications
    try {
      const { data } = await api.get('/notifications')
      return data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load notifications'))
    }
  },

  markRead: async (id: string) => {
    if (USE_MOCK_DATA) return { id, success: true }
    try {
      const { data } = await api.put(`/notifications/${id}/read`)
      return data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to mark notification as read'))
    }
  }
}
