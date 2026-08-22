import { api, handleApiError } from './api'
import { USE_MOCK_DATA } from '../api'

export const settingsService = {
  updatePassword: async (payload: Record<string, string>) => {
    if (USE_MOCK_DATA) return { success: true, message: 'Password updated successfully.' }
    try {
      const { data } = await api.put('/settings/password', payload)
      return data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to update password'))
    }
  }
}
