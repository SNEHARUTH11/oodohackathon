import { api, handleApiError } from './api'
import { USE_MOCK_DATA } from '../api'
import { mockUsers } from '../data/mockData'

const normalizeAuthResponse = (payload: any) => {
  const data = payload?.data ?? payload ?? {}
  const tokens = data.tokens ?? data.auth?.tokens ?? {}
  const accessToken = tokens.access ?? tokens.access_token ?? data.access ?? data.access_token ?? data.token ?? null
  const refreshToken = tokens.refresh ?? tokens.refresh_token ?? data.refresh ?? data.refresh_token ?? data.refreshToken ?? null
  const user = data.user ?? data.profile ?? null

  if (!user) {
    throw new Error('Login response missing user data')
  }

  return {
    user,
    token: accessToken,
    refreshToken
  }
}

export const authService = {
  login: async (email: string, password: string) => {
    if (USE_MOCK_DATA) {
      const user = mockUsers.find((item) => item.email.toLowerCase() === email.toLowerCase())
      if (!user || password !== 'password123') {
        throw new Error('Invalid credentials')
      }
      return { user, token: 'mock-token', refreshToken: 'mock-refresh-token' }
    }

    try {
      const { data } = await api.post('/login/', { identifier: email, password })
      return normalizeAuthResponse(data)
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
      const { data } = await api.post('/admin/employees/create/', payload)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to create account'))
    }
  },

  logout: async () => {
    if (USE_MOCK_DATA) return true
    try {
      const raw = localStorage.getItem('dayflow-auth')
      const refreshToken = raw ? JSON.parse(raw).refreshToken : null
      await api.post('/logout/', { refresh: refreshToken })
      return true
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to log out'))
    }
  }
  ,

  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    if (USE_MOCK_DATA) return { success: true }
    try {
      const payload = {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }
      const { data } = await api.post('/change-password/', payload)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to change password'))
    }
  }
}
