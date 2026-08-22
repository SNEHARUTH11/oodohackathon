import { USE_MOCK_DATA } from '../api'
import { payslips, salaryStructures } from '../data/mockData'
import { api, handleApiError } from './api'

export const payrollService = {
  getMyPayroll: async () => {
    if (USE_MOCK_DATA) return payslips[0]
    try {
      const { data } = await api.get('/payroll/me/')
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load payroll'))
    }
  },

  getPayroll: async () => {
    if (USE_MOCK_DATA) return payslips
    try {
      const { data } = await api.get('/payroll/')
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load payroll summary'))
    }
  },

  generatePayslip: async (employeeId: string, month: string) => {
    if (USE_MOCK_DATA) return { employeeId, month, status: 'Generated' }
    try {
      const { data } = await api.post(`/payroll/payslip/${employeeId}/${month}/generate/`)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to generate payslip'))
    }
  },

  getPayslip: async (employeeId: string, month: string) => {
    if (USE_MOCK_DATA) return payslips.find((item) => item.employee_id === employeeId && item.month === month) || null
    try {
      const { data } = await api.get(`/payroll/payslip/${employeeId}/${month}/`)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load payslip'))
    }
  },

  getSalaryStructure: async () => {
    if (USE_MOCK_DATA) return salaryStructures
    try {
      const { data } = await api.get('/payroll/')
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load salary structures'))
    }
  }
}
