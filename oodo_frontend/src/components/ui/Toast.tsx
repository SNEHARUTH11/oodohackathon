import { useEffect, useState } from 'react'

interface ToastState {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastState[]>([])

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string; type?: 'success' | 'error' | 'info' }>
      const toast = {
        id: Date.now() + Math.random(),
        message: customEvent.detail.message,
        type: customEvent.detail.type || 'success'
      }
      setItems((current) => [...current, toast])
      setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== toast.id))
      }, 3000)
    }

    window.addEventListener('dayflow:toast', handler)
    return () => window.removeEventListener('dayflow:toast', handler)
  }, [])

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] space-y-3">
      {items.map((item) => (
        <div key={item.id} className={`rounded-xl border px-4 py-3 text-sm shadow-soft ${item.type === 'error' ? 'border-red-100 bg-red-50 text-red-700' : item.type === 'info' ? 'border-blue-100 bg-blue-50 text-blue-700' : 'border-green-100 bg-green-50 text-green-700'}`}>
          {item.message}
        </div>
      ))}
    </div>
  )
}
