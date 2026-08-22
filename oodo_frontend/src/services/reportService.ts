import { USE_MOCK_DATA } from '../api'
import { api, handleApiError } from './api'

export const reportService = {
  getReports: async () => {
    if (USE_MOCK_DATA) {
      return {
        attendance: [
          { name: 'Mon', present: 20, absent: 3 },
          { name: 'Tue', present: 22, absent: 4 },
          { name: 'Wed', present: 18, absent: 5 },
          { name: 'Thu', present: 21, absent: 2 },
          { name: 'Fri', present: 19, absent: 3 }
        ],
        leave: [
          { name: 'Paid', value: 45 },
          { name: 'Sick', value: 18 },
          { name: 'Unpaid', value: 12 }
        ],
        payroll: [
          { name: 'Apr', total: 380000 },
          { name: 'May', total: 390000 },
          { name: 'Jun', total: 410000 }
        ]
      }
    }

    try {
      const { data } = await api.get('/reports/attendance')
      return data
    } catch (error) {
      throw new Error(handleApiError(error, 'Unable to load reports'))
    }
  }
}
