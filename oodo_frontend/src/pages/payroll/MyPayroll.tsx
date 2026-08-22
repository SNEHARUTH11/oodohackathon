import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { formatCurrency } from '../../utils/formatters'

export function MyPayroll() {
  return (
    <AppLayout title="My Payroll">
      <div className="space-y-6">
        <div className="section-header">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-dayflow-green">Compensation</div>
            <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-dayflow-text">Current month salary</h2>
          </div>
          <Button variant="secondary">Download PDF</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-5"><div className="text-sm text-dayflow-muted">Gross Salary</div><div className="mt-3 text-2xl font-semibold text-dayflow-text">{formatCurrency(75000)}</div></Card>
          <Card className="p-5"><div className="text-sm text-dayflow-muted">Deductions</div><div className="mt-3 text-2xl font-semibold text-dayflow-text">{formatCurrency(4700)}</div></Card>
          <Card className="p-5"><div className="text-sm text-dayflow-muted">Net Salary</div><div className="mt-3 text-2xl font-semibold text-dayflow-text">{formatCurrency(70300)}</div></Card>
          <Card className="p-5"><div className="text-sm text-dayflow-muted">Payable Days</div><div className="mt-3 text-2xl font-semibold text-dayflow-text">20</div></Card>
        </div>

        <Card className="p-5">
          <h3 className="text-xl font-semibold text-dayflow-text">Salary components</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              ['Basic Salary', formatCurrency(37500)],
              ['HRA', formatCurrency(18750)],
              ['Standard Allowance', formatCurrency(4167)],
              ['Performance Bonus', formatCurrency(3124)],
              ['LTA', formatCurrency(3124)],
              ['Fixed Allowance', formatCurrency(7843)]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-dayflow-border bg-dayflow-bg px-4 py-3 text-sm">
                <span className="text-dayflow-muted">{label}</span>
                <span className="font-semibold text-dayflow-text">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
