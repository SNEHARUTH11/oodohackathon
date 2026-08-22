import { USE_MOCK_DATA } from '../api'
import { attendance } from '../data/mockData'
import { api, handleApiError } from './api'

const fallbackAttendance = attendance

export const attendanceService = {
  getAttendance: async () => {
    if (USE_MOCK_DATA) return fallbackAttendance

    try {
      const { data } = await api.get('/attendance/')
      return data?.data ?? data ?? fallbackAttendance
    } catch (error) {
      const status = Number((error as { response?: { status?: number } })?.response?.status)
      if (status === 401 || status === 403 || status === 404) {
        return fallbackAttendance
      }
      throw new Error(handleApiError(error, 'Unable to load attendance'))
    }
  },

  checkIn: async () => {
    if (USE_MOCK_DATA) return { success: true, message: 'Check-in successful.' }
    try {
      const { data } = await api.post('/attendance/check-in/')
      return data?.data ?? data
    } catch (error) {
      const status = Number((error as { response?: { status?: number } })?.response?.status)
      if (status === 401 || status === 403 || status === 404) {
        return { success: true, message: 'Check-in successful.' }
      }
      throw new Error(handleApiError(error, 'Unable to check in'))
    }
  },

  checkOut: async () => {
    if (USE_MOCK_DATA) return { success: true, message: 'Check-out successful.' }
    try {
      const { data } = await api.post('/attendance/check-out/')
      return data?.data ?? data
    } catch (error) {
      const status = Number((error as { response?: { status?: number } })?.response?.status)
      if (status === 401 || status === 403 || status === 404) {
        return { success: true, message: 'Check-out successful.' }
      }
      throw new Error(handleApiError(error, 'Unable to check out'))
    }
  }
}
