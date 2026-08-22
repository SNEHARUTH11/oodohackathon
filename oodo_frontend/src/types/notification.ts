export interface NotificationItem {
  id: string
  user_id: string
  title: string
  message: string
  type: 'leave_approved' | 'leave_rejected' | 'leave_submitted' | 'attendance_reminder' | 'payslip_generated'
  is_read: boolean
  created_at: string
}
