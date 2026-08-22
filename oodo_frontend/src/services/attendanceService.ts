import { USE_MOCK_DATA } from '../api'
import { attendance } from '../data/mockData'
import { api, handleApiError } from './api'

export const attendanceService = {
  getAttendance: async () => {
    if (USE_MOCK_DATA) return attendance
    try {
      const { data } = await api.get('/attendance')
      return data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load attendance'))
    }
  },

  checkIn: async () => {
    if (USE_MOCK_DATA) return { success: true, message: 'Check-in successful.' }
    try {
      const { data } = await api.post('/attendance/check-in')
      return data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to check in'))
    }
  },

  checkOut: async () => {
    if (USE_MOCK_DATA) return { success: true, message: 'Check-out successful.' }
    try {
      const { data } = await api.post('/attendance/check-out')
      return data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to check out'))
    }
  }
}
