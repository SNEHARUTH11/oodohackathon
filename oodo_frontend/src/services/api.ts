import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const responseStatus = error?.response?.status
    if (responseStatus === 401) {
      window.location.href = '/sign-in'
    }
    return Promise.reject(error)
  }
)

export const handleApiError = (error: unknown, fallbackMessage = 'Something went wrong.') => {
  if (error && typeof error === 'object' && 'response' in error) {
    const status = Number((error as { response?: { status?: number } }).response?.status)
    if (status === 401) return 'Session expired. Please sign in again.'
    if (status === 403) return 'You do not have permission to do this.'
    if (status === 404) return 'The requested resource was not found.'
    if (status === 422) return 'Please review your form and try again.'
    if (status >= 500) return 'Our team is working on this. Please try again soon.'
  }

  return fallbackMessage
}
