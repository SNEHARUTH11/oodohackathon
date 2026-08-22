import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

export function PayslipPage() {
  return (
    <AppLayout title="Payslip">
      <div className="space-y-6">
        <div className="section-header">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-dayflow-green">Salary slip</div>
            <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-dayflow-text">DAYFLOW</h2>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">Download PDF</Button>
            <Button>Generate Payslip</Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="mb-6 flex flex-col gap-4 border-b border-dayflow-border pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-dayflow-muted">Salary Slip</div>
              <div className="mt-2 text-2xl font-semibold text-dayflow-text">Aisha Khan</div>
            </div>
            <div className="text-sm text-dayflow-muted">Employee Code: DF-1001 · Department: Product Design · Month: August 2026</div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-dayflow-muted">Basic</span><span className="font-medium text-dayflow-text">₹37,500</span></div>
              <div className="flex justify-between"><span className="text-dayflow-muted">HRA</span><span className="font-medium text-dayflow-text">₹18,750</span></div>
              <div className="flex justify-between"><span className="text-dayflow-muted">Standard Allowance</span><span className="font-medium text-dayflow-text">₹4,167</span></div>
              <div className="flex justify-between"><span className="text-dayflow-muted">Performance Bonus</span><span className="font-medium text-dayflow-text">₹3,124</span></div>
              <div className="flex justify-between"><span className="text-dayflow-muted">LTA</span><span className="font-medium text-dayflow-text">₹3,124</span></div>
              <div className="flex justify-between"><span className="text-dayflow-muted">Fixed Allowance</span><span className="font-medium text-dayflow-text">₹7,843</span></div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-dayflow-muted">Employee PF</span><span className="font-medium text-dayflow-text">₹4,500</span></div>
              <div className="flex justify-between"><span className="text-dayflow-muted">Professional Tax</span><span className="font-medium text-dayflow-text">₹200</span></div>
              <div className="mt-4 border-t border-dayflow-border pt-4">
                <div className="flex justify-between text-sm"><span className="text-dayflow-muted">Gross Earnings</span><span className="font-semibold text-dayflow-text">₹76,800</span></div>
                <div className="mt-2 flex justify-between text-sm"><span className="text-dayflow-muted">Total Deductions</span><span className="font-semibold text-dayflow-text">₹4,700</span></div>
                <div className="mt-2 flex justify-between text-sm"><span className="text-dayflow-muted">Net Pay</span><span className="font-semibold text-dayflow-text">₹70,300</span></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
