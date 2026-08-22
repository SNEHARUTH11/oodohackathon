import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { employeeService } from '../../services/employeeService'
import type { Employee } from '../../types/employee'

export function EmployeeProfile() {
  const { employeeId } = useParams()
  const [employee, setEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    if (!employeeId) return
    employeeService.getEmployee(employeeId).then((data) => setEmployee(data)).catch(() => setEmployee(null))
  }, [employeeId])

  if (!employee) {
    return <AppLayout title="Profile"><div className="text-dayflow-muted">Employee not found.</div></AppLayout>
  }

  return (
    <AppLayout title="Employee Profile">
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <img src={employee.profile_picture || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'} alt={employee.name} className="h-20 w-20 rounded-2xl object-cover" />
            <div>
              <div className="text-2xl font-semibold text-dayflow-text">{employee.name}</div>
              <div className="mt-1 text-sm text-dayflow-muted">{employee.job_position} · {employee.department}</div>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-dayflow-muted">
                <span>Employee ID: {employee.emp_code}</span>
                <span>Manager: {employee.manager_name || 'N/A'}</span>
                <span>Location: {employee.location}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-dayflow-text">Resume</h3>
            <div className="mt-4 space-y-4 text-sm text-dayflow-muted">
              <div><span className="font-medium text-dayflow-text">About:</span> Focused on product strategy and people operations.</div>
              <div><span className="font-medium text-dayflow-text">Interests:</span> UX research, community building, sustainability.</div>
              <div><span className="font-medium text-dayflow-text">Skills:</span> People management, design systems, facilitation.</div>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-dayflow-text">Private Info</h3>
            <div className="mt-4 grid gap-3 text-sm text-dayflow-muted md:grid-cols-2">
              <div><span className="font-medium text-dayflow-text">DOB:</span> {employee.date_of_birth || '—'}</div>
              <div><span className="font-medium text-dayflow-text">Nationality:</span> {employee.nationality || 'Indian'}</div>
              <div><span className="font-medium text-dayflow-text">Email:</span> {employee.email}</div>
              <div><span className="font-medium text-dayflow-text">Phone:</span> {employee.phone}</div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
