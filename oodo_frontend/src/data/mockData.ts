import type { Attendance } from '../types/attendance'
import type { User } from '../types/auth'
import type { Employee, LeaveBalance, SalaryStructure } from '../types/employee'
import type { TimeOffRequest, PublicHoliday } from '../types/leave'
import type { NotificationItem } from '../types/notification'
import type { Payslip } from '../types/payroll'

export const mockUsers: User[] = [
  {
    id: 'u1',
    login_id: 'DF-1001',
    name: 'Aisha Khan',
    email: 'aisha@dayflow.io',
    phone: '+91 98765 43210',
    role: 'employee',
    company_id: 'c1',
    department: 'Product Design',
    manager_id: 'u2',
    location: 'Bengaluru',
    job_position: 'Product Designer',
    date_of_birth: '1994-05-12',
    date_of_joining: '2023-02-14',
    gender: 'Female',
    marital_status: 'Single',
    nationality: 'Indian',
    personal_email: 'aisha.personal@gmail.com',
    residing_address: '12, Indiranagar, Bengaluru',
    profile_picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    emp_code: 'EMP-101',
    is_active: true
  },
  {
    id: 'u2',
    login_id: 'DF-1002',
    name: 'Rohan Mehta',
    email: 'rohan@dayflow.io',
    phone: '+91 98765 12345',
    role: 'admin',
    company_id: 'c1',
    department: 'Human Resources',
    location: 'Hyderabad',
    job_position: 'HR Manager',
    profile_picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    emp_code: 'HR-201',
    is_active: true
  },
  {
    id: 'u3',
    login_id: 'DF-1003',
    name: 'Naina Patel',
    email: 'naina@dayflow.io',
    phone: '+91 99123 45678',
    role: 'hr_officer',
    company_id: 'c1',
    department: 'People Operations',
    manager_id: 'u2',
    location: 'Pune',
    job_position: 'HR Officer',
    profile_picture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    emp_code: 'HR-202',
    is_active: true
  }
]

export const employees: Employee[] = [
  { ...mockUsers[0], company_name: 'Dayflow Labs', manager_name: 'Rohan Mehta', status: 'Present' },
  { ...mockUsers[1], company_name: 'Dayflow Labs', manager_name: 'Self', status: 'Present' },
  { ...mockUsers[2], company_name: 'Dayflow Labs', manager_name: 'Rohan Mehta', status: 'On Leave' }
]

export const attendance: Attendance[] = [
  { id: 'a1', employee_id: 'u1', date: '2026-08-01', check_in: '09:15', check_out: '18:20', work_hours: 9.08, extra_hours: 1.08, status: 'Present' },
  { id: 'a2', employee_id: 'u1', date: '2026-08-02', check_in: '09:40', check_out: '18:10', work_hours: 8.5, extra_hours: 0.1, status: 'Present' },
  { id: 'a3', employee_id: 'u1', date: '2026-08-03', check_in: '10:00', check_out: '17:00', work_hours: 7, extra_hours: 0, status: 'Half Day' },
  { id: 'a4', employee_id: 'u1', date: '2026-08-04', status: 'Absent', work_hours: 0, extra_hours: 0 },
  { id: 'a5', employee_id: 'u1', date: '2026-08-05', check_in: '09:20', check_out: '18:05', work_hours: 8.75, extra_hours: 0.25, status: 'Present' },
  { id: 'a6', employee_id: 'u1', date: '2026-08-06', status: 'Leave', work_hours: 0, extra_hours: 0 },
  { id: 'a7', employee_id: 'u1', date: '2026-08-07', check_in: '09:00', check_out: '18:00', work_hours: 9, extra_hours: 0, status: 'Present' }
]

export const leaveRequests: TimeOffRequest[] = [
  { id: 'l1', employee_id: 'u1', leave_type: 'paid', start_date: '2026-08-12', end_date: '2026-08-14', days_count: 3, remarks: 'Family trip', status: 'approved', created_at: '2026-08-01T10:00:00Z', updated_at: '2026-08-03T09:00:00Z' },
  { id: 'l2', employee_id: 'u1', leave_type: 'sick', start_date: '2026-08-22', end_date: '2026-08-22', days_count: 1, remarks: 'Doctor visit', attachment_url: 'certificate.pdf', status: 'pending', created_at: '2026-08-20T12:00:00Z', updated_at: '2026-08-20T12:00:00Z' },
  { id: 'l3', employee_id: 'u2', leave_type: 'paid', start_date: '2026-08-18', end_date: '2026-08-20', days_count: 3, remarks: 'Out of office', status: 'pending', created_at: '2026-08-02T09:00:00Z', updated_at: '2026-08-02T09:00:00Z' }
]

export const leaveBalances: LeaveBalance[] = [
  { id: 'lb1', employee_id: 'u1', year: 2026, paid_leave_total: 20, paid_leave_used: 5, sick_leave_total: 9, sick_leave_used: 1, unpaid_leave_used: 0 },
  { id: 'lb2', employee_id: 'u2', year: 2026, paid_leave_total: 20, paid_leave_used: 3, sick_leave_total: 9, sick_leave_used: 0, unpaid_leave_used: 0 },
  { id: 'lb3', employee_id: 'u3', year: 2026, paid_leave_total: 20, paid_leave_used: 2, sick_leave_total: 9, sick_leave_used: 1, unpaid_leave_used: 0 }
]

export const salaryStructures = [
  { id: 's1', employee_id: 'u1', wage_type: 'monthly', monthly_wage: 75000, yearly_wage: 900000, working_days_per_week: 5, break_time_hrs: 1, basic: 37500, hra: 18750, standard_allowance: 4167, performance_bonus: 3123.75, lta: 3123.75, fixed_allowance: 7842.5, pf_employee: 4500, pf_employer: 4500, professional_tax: 200 },
  { id: 's2', employee_id: 'u2', wage_type: 'monthly', monthly_wage: 110000, yearly_wage: 1320000, working_days_per_week: 5, break_time_hrs: 1, basic: 55000, hra: 27500, standard_allowance: 4167, performance_bonus: 4581.5, lta: 4581.5, fixed_allowance: 12080, pf_employee: 6600, pf_employer: 6600, professional_tax: 200 }
] as SalaryStructure[]

export const payslips: Payslip[] = [
  { id: 'p1', employee_id: 'u1', month: '2026-08', year: 2026, working_days: 22, payable_days: 20, basic: 37500, hra: 18750, standard_allowance: 4167, performance_bonus: 3123.75, lta: 3123.75, fixed_allowance: 7842.5, gross_earnings: 76800, pf_deduction: 4500, professional_tax: 200, total_deductions: 4700, net_pay: 72100, generated_at: '2026-08-29T10:00:00Z', status: 'Generated' }
]

export const notifications: NotificationItem[] = [
  { id: 'n1', user_id: 'u1', title: 'Leave approved', message: 'Your annual leave has been approved.', type: 'leave_approved', is_read: false, created_at: '2026-08-18T09:00:00Z' },
  { id: 'n2', user_id: 'u1', title: 'Attendance reminder', message: 'Please check in before 09:30 AM.', type: 'attendance_reminder', is_read: false, created_at: '2026-08-20T08:50:00Z' },
  { id: 'n3', user_id: 'u1', title: 'Payslip generated', message: 'Your August payslip is ready to view.', type: 'payslip_generated', is_read: true, created_at: '2026-08-15T13:00:00Z' }
]

export const publicHolidays: PublicHoliday[] = [
  { id: 'ph1', company_id: 'c1', name: 'Independence Day', date: '2026-08-15' },
  { id: 'ph2', company_id: 'c1', name: 'Diwali', date: '2026-11-02' },
  { id: 'ph3', company_id: 'c1', name: 'Christmas', date: '2026-12-25' }
]

export const company = { id: 'c1', name: 'Dayflow Labs', logo_url: '', prefix: 'DF' }
