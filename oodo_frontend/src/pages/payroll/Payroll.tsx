import { useEffect, useMemo, useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { payrollService } from '../../services/payrollService'

type PayrollRow = {
  employee: {
    id?: string
    name?: string
    login_id?: string
    department?: string
  }
  monthly_wage?: number | null
  monthly_wage_display?: string | null
  payslip?: {
    id?: string
    status?: string
    net_pay?: number
    net_pay_display?: string
    working_days?: number
    payable_days?: number
    month?: number
    year?: number
  } | null
}

export function Payroll() {
  const [rows, setRows] = useState<PayrollRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const loadPayroll = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await payrollService.getPayroll({ month: currentMonth, year: currentYear })
      const items = Array.isArray(result?.items) ? result.items : Array.isArray(result) ? result : []
      setRows(items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load payroll data')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadPayroll()
  }, [])

  const handleGenerate = async () => {
    try {
      setGenerating(true)
      setError(null)
      await payrollService.generatePayslip({ month: currentMonth, year: currentYear })
      await loadPayroll()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate payslip')
    } finally {
      setGenerating(false)
    }
  }

  const monthLabel = useMemo(() => {
    return new Date(currentYear, currentMonth - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })
  }, [currentMonth, currentYear])

  return (
    <AppLayout title="Payroll">
      <div className="space-y-6">
        <div className="section-header">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-dayflow-green">Compensation</div>
            <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-dayflow-text">Payroll overview</h2>
          </div>
          <Button onClick={() => void handleGenerate()} disabled={generating}>
            {generating ? 'Generating…' : 'Generate Payslip'}
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="border-b border-dayflow-border px-5 py-4 text-sm font-medium text-dayflow-text">
            {monthLabel}
          </div>

          {error && (
            <div className="px-5 py-4 text-sm text-red-600">{error}</div>
          )}

          {loading ? (
            <div className="px-5 py-12 text-center text-sm text-dayflow-muted">Loading payroll…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-dayflow-bg text-sm text-dayflow-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Employee</th>
                    <th className="px-4 py-3 font-medium">Department</th>
                    <th className="px-4 py-3 font-medium">Monthly Wage</th>
                    <th className="px-4 py-3 font-medium">Net Pay</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm text-dayflow-muted">
                        No payroll records found.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => {
                      const employeeName = row.employee?.name || row.employee?.login_id || 'Employee'
                      const department = row.employee?.department || '—'
                      const payslip = row.payslip
                      const status = payslip?.status || 'Not generated'

                      return (
                        <tr key={`${employeeName}-${index}`} className="border-t border-dayflow-border text-sm">
                          <td className="px-4 py-4 font-medium text-dayflow-text">{employeeName}</td>
                          <td className="px-4 py-4 text-dayflow-muted">{department}</td>
                          <td className="px-4 py-4 text-dayflow-text">{row.monthly_wage_display || '—'}</td>
                          <td className="px-4 py-4 text-dayflow-text">{payslip?.net_pay_display || '—'}</td>
                          <td className="px-4 py-4">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              status === 'Sent'
                                ? 'bg-dayflow-greenSoft text-dayflow-success'
                                : status === 'Draft'
                                  ? 'bg-amber-50 text-dayflow-warning'
                                  : 'bg-dayflow-bg text-dayflow-muted'
                            }`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {payslip?.id ? (
                              <a href={`/payroll/payslip/${payslip.id}`} className="font-medium text-dayflow-green">
                                View
                              </a>
                            ) : (
                              <span className="text-dayflow-muted">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  )
}
