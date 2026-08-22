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
  ,

  createEmployee: async (payload: Record<string, unknown>) => {
    if (USE_MOCK_DATA) return { id: 'new', ...payload }
    try {
      const { data } = await api.post('/admin/employees/create/', payload)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to create employee'))
    }
  },

  toggleStatus: async (id: string) => {
    if (USE_MOCK_DATA) return { id, is_active: false }
    try {
      const { data } = await api.post(`/admin/employees/status-toggle/${id}/`)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to toggle employee status'))
    }
  },

  getBank: async (id: string) => {
    if (USE_MOCK_DATA) return null
    try {
      const { data } = await api.get(`/admin/employees/bank/view/${id}/`)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load bank details'))
    }
  },

  updateBank: async (id: string, payload: Record<string, unknown>) => {
    if (USE_MOCK_DATA) return payload
    try {
      const { data } = await api.put(`/admin/employees/bank/update/${id}/`, payload)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to update bank details'))
    }
  },

  // Skills
  getSkills: async (id: string) => {
    if (USE_MOCK_DATA) return []
    try {
      const { data } = await api.get(`/admin/employees/skill/list/${id}/`)
      return data?.items ?? data?.data ?? data ?? []
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load skills'))
    }
  },

  createSkill: async (id: string, payload: Record<string, unknown>) => {
    if (USE_MOCK_DATA) return { id: 's-new', ...payload }
    try {
      const { data } = await api.post(`/admin/employees/skill/create/${id}/`, payload)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to add skill'))
    }
  },

  deleteSkill: async (employeeId: string, skillId: string) => {
    if (USE_MOCK_DATA) return { id: skillId }
    try {
      const { data } = await api.delete(`/admin/employees/skill/delete/${employeeId}/${skillId}/`)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to delete skill'))
    }
  },

  // Certifications
  getCertifications: async (id: string) => {
    if (USE_MOCK_DATA) return []
    try {
      const { data } = await api.get(`/admin/employees/certification/list/${id}/`)
      return data?.items ?? data?.data ?? data ?? []
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load certifications'))
    }
  },

  createCertification: async (id: string, payload: Record<string, unknown>) => {
    if (USE_MOCK_DATA) return { id: 'c-new', ...payload }
    try {
      const { data } = await api.post(`/admin/employees/certification/create/${id}/`, payload)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to add certification'))
    }
  },

  deleteCertification: async (employeeId: string, certId: string) => {
    if (USE_MOCK_DATA) return { id: certId }
    try {
      const { data } = await api.delete(`/admin/employees/certification/delete/${employeeId}/${certId}/`)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to delete certification'))
    }
  },

  // Documents
  getDocuments: async (id: string) => {
    if (USE_MOCK_DATA) return []
    try {
      const { data } = await api.get(`/admin/employees/document/list/${id}/`)
      return data?.items ?? data?.data ?? data ?? []
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load documents'))
    }
  },

  uploadDocument: async (id: string, formData: FormData) => {
    if (USE_MOCK_DATA) return { success: true }
    try {
      const { data } = await api.post(`/admin/employees/document/upload/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to upload document'))
    }
  },

  deleteDocument: async (employeeId: string, documentId: string) => {
    if (USE_MOCK_DATA) return { id: documentId }
    try {
      const { data } = await api.delete(`/admin/employees/document/delete/${employeeId}/${documentId}/`)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to delete document'))
    }
  },

  // ==========================================
  // EMPLOYEE SELF-SERVICE ENDPOINTS
  // ==========================================
  
  getMyBank: async () => {
    if (USE_MOCK_DATA) return null
    try {
      const { data } = await api.get(`/employee/bank/view/`)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load my bank details'))
    }
  },

  getMySkills: async () => {
    if (USE_MOCK_DATA) return []
    try {
      const { data } = await api.get(`/employee/skill/list/`)
      return data?.items ?? data?.data ?? data ?? []
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load my skills'))
    }
  },

  createMySkill: async (payload: Record<string, unknown>) => {
    if (USE_MOCK_DATA) return { id: 's-new', ...payload }
    try {
      const { data } = await api.post(`/employee/skill/create/`, payload)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to add my skill'))
    }
  },

  deleteMySkill: async (skillId: string) => {
    if (USE_MOCK_DATA) return { id: skillId }
    try {
      const { data } = await api.delete(`/employee/skill/delete/${skillId}/`)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to delete my skill'))
    }
  },

  getMyCertifications: async () => {
    if (USE_MOCK_DATA) return []
    try {
      const { data } = await api.get(`/employee/certification/list/`)
      return data?.items ?? data?.data ?? data ?? []
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load my certifications'))
    }
  },

  createMyCertification: async (payload: Record<string, unknown>) => {
    if (USE_MOCK_DATA) return { id: 'c-new', ...payload }
    try {
      const { data } = await api.post(`/employee/certification/create/`, payload)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to add my certification'))
    }
  },

  deleteMyCertification: async (certId: string) => {
    if (USE_MOCK_DATA) return { id: certId }
    try {
      const { data } = await api.delete(`/employee/certification/delete/${certId}/`)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to delete my certification'))
    }
  },

  getMyDocuments: async () => {
    if (USE_MOCK_DATA) return []
    try {
      const { data } = await api.get(`/employee/document/list/`)
      return data?.items ?? data?.data ?? data ?? []
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load my documents'))
    }
  }
}
