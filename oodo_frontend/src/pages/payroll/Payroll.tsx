import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

export function Payroll() {
  return (
    <AppLayout title="Payroll">
      <div className="space-y-6">
        <div className="section-header">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-dayflow-green">Compensation</div>
            <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-dayflow-text">Payroll overview</h2>
          </div>
          <Button>Generate Payslip</Button>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-dayflow-bg text-sm text-dayflow-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Month</th>
                  <th className="px-4 py-3 font-medium">Gross Salary</th>
                  <th className="px-4 py-3 font-medium">Deductions</th>
                  <th className="px-4 py-3 font-medium">Net Pay</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { employee: 'Aisha Khan', department: 'Product Design', month: 'Aug 2026', gross: '₹75,000', deductions: '₹4,700', net: '₹70,300', status: 'Generated' },
                  { employee: 'Rohan Mehta', department: 'HR', month: 'Aug 2026', gross: '₹1,10,000', deductions: '₹6,500', net: '₹1,03,500', status: 'Draft' },
                  { employee: 'Naina Patel', department: 'People Ops', month: 'Aug 2026', gross: '₹62,000', deductions: '₹3,600', net: '₹58,400', status: 'Sent' }
                ].map((row) => (
                  <tr key={row.employee} className="border-t border-dayflow-border text-sm">
                    <td className="px-4 py-4 font-medium text-dayflow-text">{row.employee}</td>
                    <td className="px-4 py-4 text-dayflow-muted">{row.department}</td>
                    <td className="px-4 py-4 text-dayflow-text">{row.month}</td>
                    <td className="px-4 py-4 text-dayflow-text">{row.gross}</td>
                    <td className="px-4 py-4 text-dayflow-text">{row.deductions}</td>
                    <td className="px-4 py-4 text-dayflow-text">{row.net}</td>
                    <td className="px-4 py-4"><span className="rounded-full bg-dayflow-greenSoft px-2.5 py-1 text-xs font-medium text-dayflow-success">{row.status}</span></td>
                    <td className="px-4 py-4"><a href="#" className="font-medium text-dayflow-green">View</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
