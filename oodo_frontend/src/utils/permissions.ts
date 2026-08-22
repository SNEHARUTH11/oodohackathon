import type { Role } from '../types/auth'

export const canAccessEmployeeFeatures = (role: Role | null) => role === 'employee' || role === 'admin' || role === 'hr_officer'

export const canViewAllEmployees = (role: Role | null) => role === 'admin' || role === 'hr_officer'

export const canApproveLeave = (role: Role | null) => role === 'admin' || role === 'hr_officer'

export const canEditSalary = (role: Role | null) => role === 'admin' || role === 'hr_officer'

export const canViewSalaryInfo = (role: Role | null) => role === 'admin' || role === 'hr_officer'
