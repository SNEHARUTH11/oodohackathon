import { USE_MOCK_DATA } from '../api'
import { payslips, salaryStructures } from '../data/mockData'
import { api, handleApiError } from './api'

import type {
  GeneratePayslipPayload,
  PayrollListParams,
  Payslip,
  SalaryStructureUpdatePayload,
  SendPayslipPayload,
} from '../types/payroll'

export const payrollService = {
  // ============================================================
  // 1. PAYROLL LIST
  // Backend:
  // GET /admin/payroll/list/
  // ============================================================
  getPayroll: async (params?: PayrollListParams) => {
    if (USE_MOCK_DATA) {
      let result = payslips

      if (params?.month) {
        result = result.filter((payslip) => {
          const monthNumber =
            typeof payslip.month === 'string'
              ? Number(payslip.month)
              : payslip.month

          return monthNumber === params.month
        })
      }

      if (params?.year) {
        result = result.filter(
          (payslip) => payslip.year === params.year,
        )
      }

      return result
    }

    try {
      const { data } = await api.get('/admin/payroll/list/', {
        params,
      })

      return data?.data ?? data
    } catch (error) {
      throw new Error(
        handleApiError(error, 'Unable to load payroll summary'),
      )
    }
  },

  // ============================================================
  // 2. SALARY STRUCTURE VIEW
  // Backend:
  // GET /admin/payroll/salary-structure/view/<employee_id>/
  // ============================================================
  getSalaryStructure: async (employeeId: string) => {
    if (USE_MOCK_DATA) {
      if (Array.isArray(salaryStructures)) {
        return salaryStructures.find(
          (structure: any) =>
            structure.employee_id === employeeId ||
            structure.id === employeeId,
        )
      }

      return salaryStructures
    }

    try {
      const { data } = await api.get(
        `/admin/payroll/salary-structure/view/${employeeId}/`,
      )

      return data?.data ?? data
    } catch (error) {
      throw new Error(
        handleApiError(error, 'Unable to load salary structure'),
      )
    }
  },

  // ============================================================
  // 3. SALARY STRUCTURE UPDATE
  // Backend:
  // PUT/PATCH /admin/payroll/salary-structure/update/<employee_id>/
  // ============================================================
  updateSalaryStructure: async (
    employeeId: string,
    payload: SalaryStructureUpdatePayload,
  ) => {
    if (USE_MOCK_DATA) {
      return {
        employee_id: employeeId,
        ...payload,
      }
    }

    try {
      const { data } = await api.patch(
        `/admin/payroll/salary-structure/update/${employeeId}/`,
        payload,
      )

      return data?.data ?? data
    } catch (error) {
      throw new Error(
        handleApiError(error, 'Unable to update salary structure'),
      )
    }
  },

  // ============================================================
  // 4. GENERATE PAYSLIP
  // Backend:
  // POST /admin/payroll/payslip/generate/
  //
  // Payload:
  // {
  //   month: number,
  //   year: number
  // }
  // ============================================================
  generatePayslip: async (
    payload: GeneratePayslipPayload,
  ) => {
    if (USE_MOCK_DATA) {
      return {
        status: 'Generated',
        month: payload.month,
        year: payload.year,
      }
    }

    try {
      const { data } = await api.post(
        '/admin/payroll/payslip/generate/',
        payload,
      )

      return data?.data ?? data
    } catch (error) {
      throw new Error(
        handleApiError(error, 'Unable to generate payslip'),
      )
    }
  },

  // ============================================================
  // 5. VIEW PAYSLIP
  // Backend:
  // GET /admin/payroll/payslip/view/<payslip_id>/
  //
  // NOTE:
  // Your current frontend was using /employee/payroll/... .
  // The backend file you supplied uses /admin/payroll/... .
  // ============================================================
  getPayslipById: async (payslipId: string): Promise<Payslip | null> => {
    if (USE_MOCK_DATA) {
      return (
        payslips.find(
          (payslip) => payslip.id === payslipId,
        ) || null
      )
    }

    try {
      const { data } = await api.get(
        `/admin/payroll/payslip/view/${payslipId}/`,
      )

      return data?.data ?? data
    } catch (error) {
      throw new Error(
        handleApiError(error, 'Unable to load payslip'),
      )
    }
  },

  // ============================================================
  // 6. REGENERATE PAYSLIP
  // Backend:
  // POST /admin/payroll/payslip/regenerate/<payslip_id>/
  // ============================================================
  regeneratePayslip: async (payslipId: string) => {
    if (USE_MOCK_DATA) {
      return {
        id: payslipId,
        status: 'Generated',
      }
    }

    try {
      const { data } = await api.post(
        `/admin/payroll/payslip/regenerate/${payslipId}/`,
      )

      return data?.data ?? data
    } catch (error) {
      throw new Error(
        handleApiError(error, 'Unable to regenerate payslip'),
      )
    }
  },

  // ============================================================
  // 7. SEND PAYSLIP
  // Backend:
  // POST /admin/payroll/payslip/send/
  //
  // Expected payload:
  // {
  //   payslip_id: string
  // }
  // ============================================================
  sendPayslip: async (
    payload: SendPayslipPayload,
  ) => {
    if (USE_MOCK_DATA) {
      return {
        status: 'Sent',
        payslip_id: payload.payslip_id,
      }
    }

    try {
      const { data } = await api.post(
        '/admin/payroll/payslip/send/',
        payload,
      )

      return data?.data ?? data
    } catch (error) {
      throw new Error(
        handleApiError(error, 'Unable to send payslip'),
      )
    }
  },

  // ============================================================
  // 8. DOWNLOAD PAYSLIP
  // Backend:
  // GET /admin/payroll/payslip/download/<payslip_id>/
  //
  // Response should be PDF/blob.
  // ============================================================
  downloadPayslip: async (
    payslipId: string,
  ): Promise<Blob> => {
    if (USE_MOCK_DATA) {
      throw new Error(
        'Payslip download is not available while mock data is enabled.',
      )
    }

    try {
      const response = await api.get(
        `/admin/payroll/payslip/download/${payslipId}/`,
        {
          responseType: 'blob',
        },
      )

      return response.data
    } catch (error) {
      throw new Error(
        handleApiError(error, 'Unable to download payslip'),
      )
    }
  },

  // ============================================================
  // EMPLOYEE - MY PAYSLIPS
  // ============================================================
  getMyPayslips: async (params?: PayrollListParams) => {
    if (USE_MOCK_DATA) {
      return payslips
    }

    try {
      const { data } = await api.get('/employee/payroll/payslip/list/', { params })
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load my payslips'))
    }
  },

  getMyPayslipById: async (payslipId: string): Promise<Payslip | null> => {
    if (USE_MOCK_DATA) {
      return payslips.find((payslip) => payslip.id === payslipId) || null
    }

    try {
      const { data } = await api.get(`/employee/payroll/payslip/view/${payslipId}/`)
      return data?.data ?? data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load payslip'))
    }
  },

  downloadMyPayslip: async (payslipId: string): Promise<Blob> => {
    if (USE_MOCK_DATA) {
      throw new Error('Payslip download is not available while mock data is enabled.')
    }

    try {
      const response = await api.get(`/employee/payroll/payslip/download/${payslipId}/`, {
        responseType: 'blob',
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to download payslip'))
    }
  },

  // ============================================================
  // Helper:
  // Download PDF directly in browser
  // ============================================================
  downloadPayslipFile: async (
    payslipId: string,
    fileName = `payslip-${payslipId}.pdf`,
  ) => {
    const blob = await payrollService.downloadPayslip(payslipId)

    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = fileName

    document.body.appendChild(link)
    link.click()

    link.remove()
    window.URL.revokeObjectURL(url)
  },
}