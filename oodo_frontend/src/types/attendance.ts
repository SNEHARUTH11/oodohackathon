export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day' | 'Leave'

export interface Attendance {
  id: string
  employee_id: string
  date: string
  check_in?: string
  check_out?: string
  work_hours: number
  extra_hours: number
  status: AttendanceStatus
}
