import { useEffect, useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { employeeService } from '../../services/employeeService'
import type { Employee } from '../../types/employee'

export function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('all')
  const [status, setStatus] = useState('all')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await employeeService.getEmployees()
        setEmployees(data)
      } catch {
        setEmployees([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => employees.filter((employee) => {
    const name = employee.name || employee.login_id || 'Employee'
    const employeeId = employee.login_id || employee.emp_code || employee.id || ''
    const matchesSearch = `${name} ${employeeId}`.toLowerCase().includes(search.toLowerCase())
    const matchesDept = department === 'all' || employee.department === department
    const matchesStatus = status === 'all' || (employee.status ?? (employee.is_active ? 'Present' : 'Absent')) === status
    return matchesSearch && matchesDept && matchesStatus
  }), [employees, search, department, status])

  return (
    <AppLayout title="Employees">
      <div className="space-y-6">
        <div className="section-header">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-dayflow-green">People</div>
            <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-dayflow-text">Manage and view all employees.</h2>
          </div>
          <Button><Plus size={16} className="mr-2" />Add Employee</Button>
        </div>

        <Card className="p-4">
          <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dayflow-muted" size={16} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees" className="h-11 w-full rounded-xl border border-dayflow-border bg-dayflow-bg pl-9 text-sm text-dayflow-text outline-none focus:border-dayflow-green focus:ring-2 focus:ring-dayflow-green/20" />
            </div>
            <Select label="" value={department} onChange={(e) => setDepartment(e.target.value)} options={[{ label: 'All departments', value: 'all' }, { label: 'Product Design', value: 'Product Design' }, { label: 'Human Resources', value: 'Human Resources' }, { label: 'People Operations', value: 'People Operations' }]} className="!h-11" />
            <Select label="" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ label: 'All statuses', value: 'all' }, { label: 'Present', value: 'Present' }, { label: 'On Leave', value: 'On Leave' }, { label: 'Absent', value: 'Absent' }]} className="!h-11" />
          </div>
        </Card>

        {loading ? (
          <div className="grid gap-4">
            {[1,2,3].map((item) => <Skeleton key={item} className="h-20 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No employees found." description="Try changing your filters or add a new employee." />
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-dayflow-bg text-sm text-dayflow-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Employee</th>
                    <th className="px-4 py-3 font-medium">Employee ID</th>
                    <th className="px-4 py-3 font-medium">Department</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((employee) => {
                    const employeeName = employee.name || employee.login_id || 'Employee'
                    const employeeId = employee.login_id || employee.emp_code || employee.id || '—'
                    const status = employee.status ?? (employee.is_active ? 'Present' : 'Absent')

                    return (
                      <tr key={employee.id} className="border-t border-dayflow-border text-sm">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <img src={employee.profile_picture || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'} alt={employeeName} className="h-10 w-10 rounded-xl object-cover" />
                            <div>
                              <div className="font-medium text-dayflow-text">{employeeName}</div>
                              <div className="text-xs text-dayflow-muted">{employee.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-dayflow-muted">{employeeId}</td>
                        <td className="px-4 py-4 text-dayflow-text">{employee.department}</td>
                        <td className="px-4 py-4 text-dayflow-text">{employee.job_position}</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status === 'Present' ? 'bg-dayflow-greenSoft text-dayflow-success' : status === 'On Leave' ? 'bg-amber-50 text-dayflow-warning' : status === 'Absent' ? 'bg-red-50 text-red-600' : 'bg-dayflow-bg text-dayflow-muted'}`}>
                            {status || 'Present'}
                          </span>
                        </td>
                        <td className="px-4 py-4"><a href={`/profile/${employee.id}`} className="font-medium text-dayflow-green">View</a></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
