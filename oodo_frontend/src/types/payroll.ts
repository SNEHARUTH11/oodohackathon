export type PayslipStatus = 'Draft' | 'Generated' | 'Sent'

export interface Payslip {
  id: string
  employee_id: string
  month: string
  year: number

  working_days: number
  payable_days: number

  basic: number
  hra: number
  standard_allowance: number
  performance_bonus: number
  lta: number
  fixed_allowance: number

  gross_earnings: number

  pf_deduction: number
  professional_tax: number
  total_deductions: number

  net_pay: number

  generated_at: string
  status: PayslipStatus
}

export interface PayrollListParams {
  month?: number
  year?: number
}

export interface SalaryStructure {
  id?: string
  employee_id: string

  basic?: number
  hra?: number
  standard_allowance?: number
  performance_bonus?: number
  lta?: number
  fixed_allowance?: number

  gross_earnings?: number

  [key: string]: unknown
}

export interface SalaryStructureUpdatePayload {
  basic?: number
  hra?: number
  standard_allowance?: number
  performance_bonus?: number
  lta?: number
  fixed_allowance?: number

  [key: string]: unknown
}

export interface GeneratePayslipPayload {
  month: number
  year: number
}

export interface SendPayslipPayload {
  payslip_id: string
  employee_id?: string
}

export interface PayrollApiResponse<T> {
  data?: T
  message?: string
  status?: string
}