import type { User } from './auth'

export interface BankDetail {
  id: string
  employee_id: string
  account_number: string
  bank_name: string
  ifsc_code: string
  pan_no: string
  uan_no: string
}

export interface Employee extends User {
  company_name?: string
  manager_name?: string
  status?: 'Present' | 'Absent' | 'On Leave' | 'Remote'
}

export interface LeaveBalance {
  id: string
  employee_id: string
  year: number
  paid_leave_total: number
  paid_leave_used: number
  sick_leave_total: number
  sick_leave_used: number
  unpaid_leave_used: number
}

export interface Company {
  id: string
  name: string
  logo_url?: string
  prefix?: string
}

export interface SalaryStructure {
  id: string
  employee_id: string
  wage_type: 'monthly' | 'hourly'
  monthly_wage: number
  yearly_wage: number
  working_days_per_week: number
  break_time_hrs: number
  basic: number
  hra: number
  standard_allowance: number
  performance_bonus: number
  lta: number
  fixed_allowance: number
  pf_employee: number
  pf_employer: number
  professional_tax: number
}
