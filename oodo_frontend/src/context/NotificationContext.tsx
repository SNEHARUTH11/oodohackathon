import { createContext, useMemo, useState, type ReactNode } from 'react'
import type { NotificationItem } from '../types/notification'

interface NotificationContextValue {
  notifications: NotificationItem[]
  addNotification: (notification: NotificationItem) => void
  markRead: (id: string) => void
  markAllRead: () => void
}

export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

const seed: NotificationItem[] = [
  { id: 'n1', user_id: 'u1', title: 'Leave approved', message: 'Your annual leave has been approved.', type: 'leave_approved', is_read: false, created_at: '2026-08-18T09:00:00Z' },
  { id: 'n2', user_id: 'u1', title: 'Attendance reminder', message: 'Please check in before 09:30 AM.', type: 'attendance_reminder', is_read: false, created_at: '2026-08-20T08:50:00Z' },
  { id: 'n3', user_id: 'u1', title: 'Payslip generated', message: 'Your July payslip is ready to view.', type: 'payslip_generated', is_read: true, created_at: '2026-08-15T13:00:00Z' }
]

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(seed)

  const addNotification = (notification: NotificationItem) => {
    setNotifications((current) => [notification, ...current])
  }

  const markRead = (id: string) => {
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, is_read: true } : item))
  }

  const markAllRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, is_read: true })))
  }

  const value = useMemo<NotificationContextValue>(() => ({ notifications, addNotification, markRead, markAllRead }), [notifications])

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
