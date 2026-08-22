import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

import { payrollService } from '../../services/payrollService'
import type { Payslip } from '../../types/payroll'

function formatCurrency(value?: number | null) {
  if (value == null) return '₹0'

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value?: string) {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getMonthNumber(month: string | number) {
  if (typeof month === 'number') {
    return month
  }

  const numericMonth = Number(month)

  if (!Number.isNaN(numericMonth)) {
    return numericMonth
  }

  const date = new Date(`${month} 1, 2000`)

  if (!Number.isNaN(date.getTime())) {
    return date.getMonth() + 1
  }

  return new Date().getMonth() + 1
}

function getMonthName(month: string | number) {
  const monthNumber = getMonthNumber(month)

  if (monthNumber >= 1 && monthNumber <= 12) {
    return new Date(2000, monthNumber - 1, 1).toLocaleString(
      'en-IN',
      {
        month: 'long',
      },
    )
  }

  return String(month)
}

export function PayslipPage() {
  const { payslipId } = useParams<{ payslipId: string }>()

  const [payslip, setPayslip] = useState<Payslip | null>(null)

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // ------------------------------------------------------------
  // Load payslip
  // ------------------------------------------------------------
  const loadPayslip = async () => {
    if (!payslipId) {
      setError('Payslip ID is missing')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result =
        await payrollService.getPayslipById(payslipId)

      setPayslip(result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load payslip',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayslip()
  }, [payslipId])

  // ------------------------------------------------------------
  // Download PDF
  // ------------------------------------------------------------
  const handleDownload = async () => {
    if (!payslipId) return

    try {
      setActionLoading(true)
      setError(null)
      setSuccess(null)

      await payrollService.downloadPayslipFile(
        payslipId,
        `payslip-${payslip?.month}-${payslip?.year}.pdf`,
      )

      setSuccess('Payslip downloaded successfully.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to download payslip',
      )
    } finally {
      setActionLoading(false)
    }
  }

  // ------------------------------------------------------------
  // Generate payslip
  // ------------------------------------------------------------
  const handleGenerate = async () => {
    if (!payslip) return

    try {
      setActionLoading(true)
      setError(null)
      setSuccess(null)

      const month = getMonthNumber(payslip.month)

      await payrollService.generatePayslip({
        month,
        year: payslip.year,
      })

      await loadPayslip()

      setSuccess('Payslip generated successfully.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to generate payslip',
      )
    } finally {
      setActionLoading(false)
    }
  }

  // ------------------------------------------------------------
  // Regenerate payslip
  // ------------------------------------------------------------
  const handleRegenerate = async () => {
    if (!payslipId) return

    const confirmed = window.confirm(
      'Are you sure you want to regenerate this payslip?',
    )

    if (!confirmed) return

    try {
      setActionLoading(true)
      setError(null)
      setSuccess(null)

      await payrollService.regeneratePayslip(payslipId)

      await loadPayslip()

      setSuccess('Payslip regenerated successfully.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to regenerate payslip',
      )
    } finally {
      setActionLoading(false)
    }
  }

  // ------------------------------------------------------------
  // Send payslip
  // ------------------------------------------------------------
  const handleSend = async () => {
    if (!payslipId) return

    try {
      setActionLoading(true)
      setError(null)
      setSuccess(null)

      await payrollService.sendPayslip({
        payslip_id: payslipId,
      })

      await loadPayslip()

      setSuccess('Payslip sent successfully.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to send payslip',
      )
    } finally {
      setActionLoading(false)
    }
  }

  // ------------------------------------------------------------
  // Loading
  // ------------------------------------------------------------
  if (loading) {
    return (
      <AppLayout title="Payslip">
        <Card className="p-6">
          <div className="text-sm text-dayflow-muted">
            Loading payslip...
          </div>
        </Card>
      </AppLayout>
    )
  }

  // ------------------------------------------------------------
  // Error / no payslip
  // ------------------------------------------------------------
  if (!payslip) {
    return (
      <AppLayout title="Payslip">
        <Card className="p-6">
          <div className="text-sm text-red-600">
            {error || 'Payslip not found.'}
          </div>

          <div className="mt-4">
            <Button onClick={loadPayslip}>
              Try Again
            </Button>
          </div>
        </Card>
      </AppLayout>
    )
  }

  const monthName = getMonthName(payslip.month)

  return (
    <AppLayout title="Payslip">
      <div className="space-y-6">

        {/* -------------------------------------------------- */}
        {/* Header */}
        {/* -------------------------------------------------- */}
        <div className="section-header">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-dayflow-green">
              Salary slip
            </div>

            <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-dayflow-text">
              DAYFLOW
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">

            <Button
              variant="secondary"
              onClick={handleDownload}
              disabled={actionLoading}
            >
              {actionLoading
                ? 'Processing...'
                : 'Download PDF'}
            </Button>

            <Button
              variant="secondary"
              onClick={handleRegenerate}
              disabled={actionLoading}
            >
              Regenerate
            </Button>

            <Button
              variant="secondary"
              onClick={handleSend}
              disabled={actionLoading}
            >
              Send Payslip
            </Button>

            <Button
              onClick={handleGenerate}
              disabled={actionLoading}
            >
              Generate Payslip
            </Button>

          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* Notifications */}
        {/* -------------------------------------------------- */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* Payslip */}
        {/* -------------------------------------------------- */}
        <Card className="p-6">

          {/* Employee information */}
          <div className="mb-6 flex flex-col gap-4 border-b border-dayflow-border pb-5 md:flex-row md:items-end md:justify-between">

            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-dayflow-muted">
                Salary Slip
              </div>

              <div className="mt-2 text-2xl font-semibold text-dayflow-text">
                Employee
              </div>

              <div className="mt-1 text-sm text-dayflow-muted">
                Employee ID: {payslip.employee_id}
              </div>
            </div>

            <div className="text-sm text-dayflow-muted md:text-right">
              <div>
                Month: {monthName} {payslip.year}
              </div>

              <div className="mt-1">
                Generated: {formatDate(payslip.generated_at)}
              </div>

              <div className="mt-1">
                Status:{' '}
                <span className="font-medium text-dayflow-text">
                  {payslip.status}
                </span>
              </div>
            </div>

          </div>

          {/* Attendance */}
          <div className="mb-6 grid gap-4 md:grid-cols-2">

            <div className="rounded-lg border border-dayflow-border p-4">
              <div className="text-xs uppercase tracking-[0.15em] text-dayflow-muted">
                Working Days
              </div>

              <div className="mt-2 text-xl font-semibold text-dayflow-text">
                {payslip.working_days}
              </div>
            </div>

            <div className="rounded-lg border border-dayflow-border p-4">
              <div className="text-xs uppercase tracking-[0.15em] text-dayflow-muted">
                Payable Days
              </div>

              <div className="mt-2 text-xl font-semibold text-dayflow-text">
                {payslip.payable_days}
              </div>
            </div>

          </div>

          {/* Earnings and deductions */}
          <div className="grid gap-8 md:grid-cols-2">

            {/* Earnings */}
            <div>
              <div className="mb-4 text-xs uppercase tracking-[0.2em] text-dayflow-green">
                Earnings
              </div>

              <div className="space-y-3 text-sm">

                <div className="flex justify-between">
                  <span className="text-dayflow-muted">
                    Basic
                  </span>

                  <span className="font-medium text-dayflow-text">
                    {formatCurrency(payslip.basic)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-dayflow-muted">
                    HRA
                  </span>

                  <span className="font-medium text-dayflow-text">
                    {formatCurrency(payslip.hra)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-dayflow-muted">
                    Standard Allowance
                  </span>

                  <span className="font-medium text-dayflow-text">
                    {formatCurrency(
                      payslip.standard_allowance,
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-dayflow-muted">
                    Performance Bonus
                  </span>

                  <span className="font-medium text-dayflow-text">
                    {formatCurrency(
                      payslip.performance_bonus,
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-dayflow-muted">
                    LTA
                  </span>

                  <span className="font-medium text-dayflow-text">
                    {formatCurrency(payslip.lta)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-dayflow-muted">
                    Fixed Allowance
                  </span>

                  <span className="font-medium text-dayflow-text">
                    {formatCurrency(
                      payslip.fixed_allowance,
                    )}
                  </span>
                </div>

                <div className="mt-4 border-t border-dayflow-border pt-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-dayflow-text">
                      Gross Earnings
                    </span>

                    <span className="font-semibold text-dayflow-text">
                      {formatCurrency(
                        payslip.gross_earnings,
                      )}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Deductions */}
            <div>
              <div className="mb-4 text-xs uppercase tracking-[0.2em] text-dayflow-green">
                Deductions
              </div>

              <div className="space-y-3 text-sm">

                <div className="flex justify-between">
                  <span className="text-dayflow-muted">
                    Employee PF
                  </span>

                  <span className="font-medium text-dayflow-text">
                    {formatCurrency(
                      payslip.pf_deduction,
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-dayflow-muted">
                    Professional Tax
                  </span>

                  <span className="font-medium text-dayflow-text">
                    {formatCurrency(
                      payslip.professional_tax,
                    )}
                  </span>
                </div>

                <div className="mt-4 border-t border-dayflow-border pt-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-dayflow-text">
                      Total Deductions
                    </span>

                    <span className="font-semibold text-dayflow-text">
                      {formatCurrency(
                        payslip.total_deductions,
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-3 rounded-lg bg-dayflow-green/10 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-dayflow-text">
                      Net Pay
                    </span>

                    <span className="text-xl font-bold text-dayflow-green">
                      {formatCurrency(payslip.net_pay)}
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </Card>
      </div>
    </AppLayout>
  )
}