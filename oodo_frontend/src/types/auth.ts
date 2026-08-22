export type Role = 'employee' | 'admin' | 'hr_officer'

export interface User {
  id: string
  login_id: string
  name: string
  email: string
  phone: string
  role: Role
  company_id: string
  department: string
  manager_id?: string
  location: string
  job_position: string
  date_of_birth?: string
  date_of_joining?: string
  gender?: string
  marital_status?: string
  nationality?: string
  personal_email?: string
  residing_address?: string
  profile_picture?: string
  emp_code: string
  is_active: boolean
  change_password?: boolean | string
}
