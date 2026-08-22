export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
export const USE_MOCK_DATA = String(import.meta.env.VITE_USE_MOCK_DATA || 'true').toLowerCase() === 'true'
