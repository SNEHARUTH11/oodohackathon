import { USE_MOCK_DATA } from '../api'
import { notifications } from '../data/mockData'
import { api, handleApiError } from './api'

export const notificationService = {
  getNotifications: async () => {
    if (USE_MOCK_DATA) return notifications
    try {
      const { data } = await api.get('/notifications/list/')
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load notifications'))
    }
  },

  getUnreadCount: async () => {
    if (USE_MOCK_DATA) return { unread_count: 0 }
    try {
      const { data } = await api.get('/notifications/unread-count/')
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to get unread count'))
    }
  },

  markRead: async (id?: string) => {
    if (USE_MOCK_DATA) return { id, success: true }
    try {
      const payload = id ? { mark_all: false, ids: [id] } : { mark_all: true }
      const { data } = await api.post(`/notifications/mark-read/`, payload)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to mark notification as read'))
    }
  }
}
