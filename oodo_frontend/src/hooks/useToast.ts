import { useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export function useToast() {
  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const event = new CustomEvent('dayflow:toast', { detail: { type, message } })
    window.dispatchEvent(event)
  }, [])

  return { showToast }
}
