import { USE_MOCK_DATA } from '../api'
import { employees } from '../data/mockData'
import { api, handleApiError } from './api'

export const employeeService = {
  getEmployees: async () => {
    if (USE_MOCK_DATA) return employees
    try {
      const { data } = await api.get('/employees')
      return data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load employees'))
    }
  },

  getEmployee: async (id: string) => {
    if (USE_MOCK_DATA) return employees.find((employee) => employee.id === id) || null
    try {
      const { data } = await api.get(`/employees/${id}`)
      return data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load employee'))
    }
  },

  updateEmployee: async (id: string, payload: Record<string, unknown>) => {
    if (USE_MOCK_DATA) return { id, ...payload }
    try {
      const { data } = await api.put(`/employees/${id}`, payload)
      return data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to update employee'))
    }
  }
}
