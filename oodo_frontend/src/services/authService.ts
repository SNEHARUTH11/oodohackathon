import { api, handleApiError } from './api'
import { USE_MOCK_DATA } from '../api'
import { mockUsers } from '../data/mockData'

export const authService = {
  login: async (email: string, password: string) => {
    if (USE_MOCK_DATA) {
      const user = mockUsers.find((item) => item.email.toLowerCase() === email.toLowerCase())
      if (!user || password !== 'password123') {
        throw new Error('Invalid credentials')
      }
      return { user, token: 'mock-token' }
    }

    try {
      const { data } = await api.post('/auth/login', { email, password })
      return data
    } catch (error) {
      throw new Error(handleApiError(error, 'Invalid credentials'))
    }
  },

  register: async (payload: Record<string, unknown>) => {
    if (USE_MOCK_DATA) {
      const generatedLoginId = `DF-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`
      return { login_id: generatedLoginId, message: 'Employee created successfully.' }
    }

    try {
      const { data } = await api.post('/auth/register', payload)
      return data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to create account'))
    }
  },

  logout: async () => {
    if (USE_MOCK_DATA) return true
    try {
      await api.post('/auth/logout')
      return true
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to log out'))
    }
  }
}
