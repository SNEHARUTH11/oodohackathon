import { USE_MOCK_DATA } from '../api'
import { employees } from '../data/mockData'
import { api, handleApiError } from './api'

const normalizeListResponse = (response: unknown) => {
  if (!response || typeof response !== 'object') return []

  const payload = response as Record<string, unknown>
  const items = payload.items ?? payload.data ?? []

  if (Array.isArray(items)) return items

  if (items && typeof items === 'object' && 'items' in (items as Record<string, unknown>)) {
    return (items as { items?: unknown[] }).items ?? []
  }

  return []
}

export const employeeService = {
  getEmployees: async () => {
    if (USE_MOCK_DATA) return employees

    try {
      const { data } = await api.get('/admin/employees/list/')
      return normalizeListResponse(data)
    } catch (error) {
      const status = Number((error as { response?: { status?: number } })?.response?.status)
      if (status === 401 || status === 403 || status === 404) {
        return employees
      }
      throw new Error(handleApiError(error, 'Unable to load employees'))
    }
  },

  getEmployee: async (id: string) => {
    if (USE_MOCK_DATA) return employees.find((employee) => employee.id === id) || null
    try {
      const { data } = await api.get(`/admin/employees/view/${id}/`)
      return data?.data ?? data
    } catch (error) {
      const status = Number((error as { response?: { status?: number } })?.response?.status)
      if (status === 401 || status === 403 || status === 404) {
        return employees.find((employee) => employee.id === id) || null
      }
      throw new Error(handleApiError(error, 'Unable to load employee'))
    }
  },

  updateEmployee: async (id: string, payload: Record<string, unknown>) => {
    if (USE_MOCK_DATA) return { id, ...payload }
    try {
      const { data } = await api.put(`/admin/employees/update/${id}/`, payload)
      return data?.data ?? data
    } catch (error) {
      const status = Number((error as { response?: { status?: number } })?.response?.status)
      if (status === 401 || status === 403 || status === 404) {
        return { id, ...payload }
      }
      throw new Error(handleApiError(error, 'Unable to update employee'))
    }
  }
}
