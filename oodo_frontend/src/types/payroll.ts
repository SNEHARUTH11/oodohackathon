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
  status: 'Draft' | 'Generated' | 'Sent'
}
