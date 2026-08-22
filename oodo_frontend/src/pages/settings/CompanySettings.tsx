import { useEffect, useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Link } from 'react-router-dom'
import { settingsService } from '../../services/settingsService'

type CompanySettingsState = {
  company: Record<string, string | null | undefined>
  config: Record<string, string | number | number[] | undefined>
}

export function CompanySettings() {
  const [settings, setSettings] = useState<CompanySettingsState>({ company: {}, config: {} })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await settingsService.getCompanySettings()
        setSettings({
          company: payload?.company ?? {},
          config: payload?.config ?? {},
        })
      } catch (err) {
        setMessage(err instanceof Error ? err.message : 'Unable to load company settings')
      }
    }
    void load()
  }, [])

  const updateConfig = (key: string, value: string | number | number[]) => {
    setSettings((current) => ({
      ...current,
      config: {
        ...current.config,
        [key]: value,
      },
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)
      await settingsService.updateCompanySettings({
        working_weekdays: settings.config.working_weekdays,
        standard_hours_per_day: settings.config.standard_hours_per_day,
        half_day_threshold_hours: settings.config.half_day_threshold_hours,
        break_time_hrs: settings.config.break_time_hrs,
        paid_leave_total: settings.config.paid_leave_total,
        sick_leave_total: settings.config.sick_leave_total,
        pf_rate_percent: settings.config.pf_rate_percent,
        professional_tax: settings.config.professional_tax,
      })
      setMessage('Company settings updated successfully.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to update company settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout title="Company Settings">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <Card className="p-4">
          <div className="space-y-2">
            <Link to="/settings/account" className="block rounded-xl px-3 py-2 text-sm font-medium text-dayflow-text hover:bg-dayflow-bg">My Account</Link>
            <Link to="/settings/security" className="block rounded-xl px-3 py-2 text-sm font-medium text-dayflow-text hover:bg-dayflow-bg">Security</Link>
            <Link to="/settings/notifications" className="block rounded-xl px-3 py-2 text-sm font-medium text-dayflow-text hover:bg-dayflow-bg">Notifications</Link>
            <Link to="/settings/company" className="block rounded-xl bg-dayflow-bg px-3 py-2 text-sm font-medium text-dayflow-text">Company</Link>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-6">
              <div className="text-xl font-semibold text-dayflow-text">Company Profile</div>
              <div className="text-sm text-dayflow-muted">Manage operational settings for your organization.</div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Company Name" value={String(settings.company.name ?? '')} readOnly />
              <Input label="Prefix" value={String(settings.company.prefix ?? '')} readOnly />
              <Input label="Timezone" value={String(settings.company.timezone ?? '')} readOnly className="md:col-span-2" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-xl font-semibold text-dayflow-text">Working Rules</div>
            <div className="mt-3 text-sm text-dayflow-muted">Update the core compliance and attendance configuration.</div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Input
                label="Working weekdays"
                value={Array.isArray(settings.config.working_weekdays) ? settings.config.working_weekdays.join(', ') : ''}
                onChange={(e) => updateConfig('working_weekdays', e.target.value.split(',').map((item) => Number(item.trim())).filter((item) => !Number.isNaN(item)))}
              />
              <Input label="Standard hours per day" type="number" value={String(settings.config.standard_hours_per_day ?? '')} onChange={(e) => updateConfig('standard_hours_per_day', Number(e.target.value))} />
              <Input label="Half-day threshold" type="number" value={String(settings.config.half_day_threshold_hours ?? '')} onChange={(e) => updateConfig('half_day_threshold_hours', Number(e.target.value))} />
              <Input label="Break time (hrs)" type="number" value={String(settings.config.break_time_hrs ?? '')} onChange={(e) => updateConfig('break_time_hrs', Number(e.target.value))} />
              <Input label="Paid leave total" type="number" value={String(settings.config.paid_leave_total ?? '')} onChange={(e) => updateConfig('paid_leave_total', Number(e.target.value))} />
              <Input label="Sick leave total" type="number" value={String(settings.config.sick_leave_total ?? '')} onChange={(e) => updateConfig('sick_leave_total', Number(e.target.value))} />
              <Input label="PF rate (%)" type="number" value={String(settings.config.pf_rate_percent ?? '')} onChange={(e) => updateConfig('pf_rate_percent', Number(e.target.value))} />
              <Input label="Professional tax" type="number" value={String(settings.config.professional_tax ?? '')} onChange={(e) => updateConfig('professional_tax', Number(e.target.value))} />
            </div>

            {message && <div className="mt-4 text-sm text-dayflow-muted">{message}</div>}

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={() => window.location.reload()}>Discard</Button>
              <Button type="button" onClick={() => void handleSave()} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
