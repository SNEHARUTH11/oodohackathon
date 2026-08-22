export type LeaveType = 'paid' | 'sick' | 'unpaid'
export type LeaveStatus = 'pending' | 'approved' | 'rejected'

export interface TimeOffRequest {
  id: string
  employee_id: string
  leave_type: LeaveType
  start_date: string
  end_date: string
  days_count: number
  remarks?: string
  attachment_url?: string
  status: LeaveStatus
  reviewed_by?: string
  review_comment?: string
  created_at: string
  updated_at: string
}

export interface PublicHoliday {
  id: string
  company_id: string
  name: string
  date: string
}
