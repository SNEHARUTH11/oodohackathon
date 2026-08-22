import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { useState } from 'react'

export function LeaveAllocation() {
  const [open, setOpen] = useState(false)

  return (
    <AppLayout title="Leave Allocation">
      <div className="space-y-6">
        <div className="section-header">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-dayflow-green">Admin</div>
            <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-dayflow-text">Manage yearly leave quotas</h2>
          </div>
          <Button onClick={() => setOpen(true)}>Edit Allocation</Button>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-dayflow-bg text-sm text-dayflow-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Year</th>
                  <th className="px-4 py-3 font-medium">Paid Leave Total</th>
                  <th className="px-4 py-3 font-medium">Paid Leave Used</th>
                  <th className="px-4 py-3 font-medium">Sick Leave Total</th>
                  <th className="px-4 py-3 font-medium">Sick Leave Used</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { employee: 'Aisha Khan', year: 2026, paidTotal: 20, paidUsed: 5, sickTotal: 9, sickUsed: 1 },
                  { employee: 'Rohan Mehta', year: 2026, paidTotal: 20, paidUsed: 3, sickTotal: 9, sickUsed: 0 },
                  { employee: 'Naina Patel', year: 2026, paidTotal: 20, paidUsed: 2, sickTotal: 9, sickUsed: 1 }
                ].map((row) => (
                  <tr key={row.employee} className="border-t border-dayflow-border text-sm">
                    <td className="px-4 py-4 font-medium text-dayflow-text">{row.employee}</td>
                    <td className="px-4 py-4 text-dayflow-muted">{row.year}</td>
                    <td className="px-4 py-4 text-dayflow-text">{row.paidTotal}</td>
                    <td className="px-4 py-4 text-dayflow-text">{row.paidUsed}</td>
                    <td className="px-4 py-4 text-dayflow-text">{row.sickTotal}</td>
                    <td className="px-4 py-4 text-dayflow-text">{row.sickUsed}</td>
                    <td className="px-4 py-4"><button type="button" onClick={() => setOpen(true)} className="font-medium text-dayflow-green">Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Edit Allocation">
        <form className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input className="h-11 rounded-xl border border-dayflow-border bg-dayflow-bg px-3 text-sm" placeholder="Employee" />
            <input className="h-11 rounded-xl border border-dayflow-border bg-dayflow-bg px-3 text-sm" placeholder="Year" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input className="h-11 rounded-xl border border-dayflow-border bg-dayflow-bg px-3 text-sm" placeholder="Paid Leave" />
            <input className="h-11 rounded-xl border border-dayflow-border bg-dayflow-bg px-3 text-sm" placeholder="Sick Leave" />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="button">Save</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  )
}
