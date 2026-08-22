import { api, handleApiError } from './api'
import { USE_MOCK_DATA } from '../api'

const mockProfile = {
  id: 'emp-101',
  name: 'Aisha Khan',
  email: 'aisha.khan@dayflow.com',
  phone: '+1 (415) 555-0142',
  birthday: '1993-06-12',
  language: 'English',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  job_title: 'Senior HR Manager',
  updated_at: '2026-08-22',
}

export const settingsService = {
  getProfile: async () => {
    if (USE_MOCK_DATA) return mockProfile

    try {
      const { data } = await api.get('/profile/me/')
      return data?.data ?? data ?? mockProfile
    } catch (error) {
      console.warn('Falling back to mock profile data:', error)
      return mockProfile
    }
  },

  updateProfile: async (payload: Record<string, unknown>) => {
    if (USE_MOCK_DATA) return { success: true, data: { ...mockProfile, ...payload } }

    try {
      const { data } = await api.put('/profile/me/', payload)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to update profile'))
    }
  },

  updatePassword: async (payload: Record<string, string>) => {
    if (USE_MOCK_DATA) return { success: true, message: 'Password updated successfully.' }
    try {
      const { data } = await api.put('/change-password/', payload)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to update password'))
    }
  }
}
