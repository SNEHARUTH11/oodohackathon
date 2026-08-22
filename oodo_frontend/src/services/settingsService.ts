import { api, handleApiError } from './api'
import { USE_MOCK_DATA } from '../api'
import { publicHolidays } from '../data/mockData'

const mockProfile = {
  id: 'emp-101',
  first_name: 'Aisha',
  last_name: 'Khan',
  name: 'Aisha Khan',
  email: 'aisha.khan@dayflow.com',
  phone: '+1 (415) 555-0142',
  date_of_birth: '1993-06-12',
  personal_email: 'aisha.khan@dayflow.com',
  nationality: 'Indian',
  residing_address: 'San Francisco, CA',
  about: 'Driving HR initiatives and employee experience.',
  what_i_love_about_job: 'Helping people grow and build better teams.',
  interests_hobbies: 'Travel, books, design',
  profile_picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  job_position: 'Senior HR Manager',
  department: 'Human Resources',
  updated_at: '2026-08-22',
}

export const settingsService = {
  getProfile: async () => {
    if (USE_MOCK_DATA) return mockProfile

    try {
      const { data } = await api.get('/employee/profile/view/')
      return data?.data ?? data ?? mockProfile
    } catch (error) {
      console.warn('Falling back to mock profile data:', error)
      return mockProfile
    }
  },

  updateProfile: async (payload: Record<string, unknown>) => {
    if (USE_MOCK_DATA) return { success: true, data: { ...mockProfile, ...payload } }

    try {
      const { data } = await api.patch('/employee/profile/update/', payload)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to update profile'))
    }
  },

  uploadProfilePicture: async (formData: FormData) => {
    if (USE_MOCK_DATA) return { success: true, url: mockProfile.profile_picture }
    try {
      const { data } = await api.post('/employee/profile/picture/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to upload profile picture'))
    }
  },

  getPublicProfile: async () => {
    if (USE_MOCK_DATA) return mockProfile
    try {
      const { data } = await api.get('/employee/profile/public-view/')
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load public profile'))
    }
  },

  updatePassword: async (payload: Record<string, string>) => {
    if (USE_MOCK_DATA) return { success: true, message: 'Password updated successfully.' }
    try {
      const { data } = await api.post('/change-password/', payload)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to update password'))
    }
  },

  getCompanySettings: async () => {
    if (USE_MOCK_DATA) {
      return {
        company: {
          id: 'company-1',
          name: 'Dayflow HR',
          prefix: 'DF',
          timezone: 'Asia/Kolkata',
          logo: null,
        },
        config: {
          working_weekdays: [1, 2, 3, 4, 5],
          standard_hours_per_day: 8,
          half_day_threshold_hours: 4,
          break_time_hrs: 1,
          paid_leave_total: 24,
          sick_leave_total: 7,
          pf_rate_percent: 12,
          professional_tax: 200,
        },
      }
    }

    try {
      const { data } = await api.get('/admin/settings/company/view/')
      return data?.data ?? data ?? { company: {}, config: {} }
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load company settings'))
    }
  },

  updateCompanySettings: async (payload: Record<string, unknown>) => {
    if (USE_MOCK_DATA) return { success: true, data: payload }

    try {
      const { data } = await api.patch('/admin/settings/company/update/', payload)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to update company settings'))
    }
  },

  resetEmployeePassword: async (employeeId: string, newPassword?: string) => {
    if (USE_MOCK_DATA) {
      return {
        id: employeeId,
        temp_password: newPassword || 'Dayflow@123',
        must_change_password: true,
      }
    }

    try {
      const { data } = await api.post(`/admin/employees/reset-password/${employeeId}/`, newPassword ? { new_password: newPassword } : {})
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to reset employee password'))
    }
  },

  getHolidays: async () => {
    if (USE_MOCK_DATA) return publicHolidays

    try {
      const { data } = await api.get('/admin/settings/holiday/list/')
      return data?.data?.items ?? data?.items ?? data?.data ?? data ?? []
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load holidays'))
    }
  },

  createHoliday: async (payload: Record<string, unknown>) => {
    if (USE_MOCK_DATA) return { ...payload, id: `holiday-${Date.now()}` }

    try {
      const { data } = await api.post('/admin/settings/holiday/create/', payload)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to create holiday'))
    }
  },

  updateHoliday: async (holidayId: string, payload: Record<string, unknown>) => {
    if (USE_MOCK_DATA) return { id: holidayId, ...payload }

    try {
      const { data } = await api.patch(`/admin/settings/holiday/update/${holidayId}/`, payload)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to update holiday'))
    }
  },

  deleteHoliday: async (holidayId: string) => {
    if (USE_MOCK_DATA) return { id: holidayId, deleted: true }

    try {
      const { data } = await api.delete(`/admin/settings/holiday/delete/${holidayId}/`)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to delete holiday'))
    }
  },
}
