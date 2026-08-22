from django.urls import path

from api.admin.views.employees import (
    bank_update, bank_view, certification_create, certification_delete,
    certification_list, document_delete, document_list, document_upload,
    employee_create, employee_list, employee_status_toggle, employee_update,
    employee_view, skill_create, skill_delete, skill_list,
)
from api.admin.views.attendance import (
    create as att_create, day_list, missed_checkouts, monthly_list,
    update as att_update,
)
from api.admin.views.settings import (
    company_update, company_view, holiday_create, holiday_delete, holiday_list,
    holiday_update,
)
from api.admin.views.timeoff import (
    allocation_list, allocation_update, approve, reject, request_list as tof_request_list,
)
from api.admin.views.payroll import (
    list as pr_list, payslip_download, payslip_generate, payslip_regenerate,
    payslip_send, payslip_view, structure_update, structure_view,
)
from api.admin.views.dashboard import overview as adm_dash
from oodohackathon.odoo_backend.api.admin.views.employees import password_reset
# NOTE: app_name is "adminpanel", NOT "admin" — Django's built-in admin site
# already claims the "admin" namespace and a duplicate raises ImproperlyConfigured.
app_name = "adminpanel"

urlpatterns = [
    # ── Dashboard ─────────────────────────────────────────────────────
    path("dashboard/overview/", adm_dash.AdminDashboardOverviewView.as_view(), name="dashboard-overview"),
    
    # ── Payroll ───────────────────────────────────────────────────────
    path("payroll/list/", pr_list.PayrollListView.as_view(), name="payroll-list"),
    path("payroll/salary-structure/view/<uuid:employee_id>/", structure_view.SalaryStructureView.as_view(), name="payroll-structure-view"),
    path("payroll/salary-structure/update/<uuid:employee_id>/", structure_update.SalaryStructureUpdateView.as_view(), name="payroll-structure-update"),
    path("payroll/payslip/generate/", payslip_generate.PayslipGenerateView.as_view(), name="payslip-generate"),
    path("payroll/payslip/view/<uuid:payslip_id>/", payslip_view.PayslipDetailView.as_view(), name="payslip-view"),
    path("payroll/payslip/regenerate/<uuid:payslip_id>/", payslip_regenerate.PayslipRegenerateView.as_view(), name="payslip-regenerate"),
    path("payroll/payslip/send/", payslip_send.PayslipSendView.as_view(), name="payslip-send"),
    path("payroll/payslip/download/<uuid:payslip_id>/", payslip_download.PayslipDownloadView.as_view(), name="payslip-download"),

    # ── Time Off ──────────────────────────────────────────────────────
    path("timeoff/request/list/", tof_request_list.AdminTimeOffRequestListView.as_view(), name="timeoff-request-list"),
    path("timeoff/request/approve/<uuid:request_id>/", approve.TimeOffApproveView.as_view(), name="timeoff-approve"),
    path("timeoff/request/reject/<uuid:request_id>/", reject.TimeOffRejectView.as_view(), name="timeoff-reject"),
    path("timeoff/allocation/list/", allocation_list.AllocationListView.as_view(), name="timeoff-allocation-list"),
    path("timeoff/allocation/update/<uuid:employee_id>/", allocation_update.AllocationUpdateView.as_view(), name="timeoff-allocation-update"),

    # ── Settings ──────────────────────────────────────────────────────
    path("settings/company/view/", company_view.CompanySettingsView.as_view(), name="settings-company-view"),
    path("settings/company/update/", company_update.CompanySettingsUpdateView.as_view(), name="settings-company-update"),
    path("settings/holiday/list/", holiday_list.HolidayListView.as_view(), name="settings-holiday-list"),
    path("settings/holiday/create/", holiday_create.HolidayCreateView.as_view(), name="settings-holiday-create"),
    path("settings/holiday/update/<uuid:holiday_id>/", holiday_update.HolidayUpdateView.as_view(), name="settings-holiday-update"),
    path("settings/holiday/delete/<uuid:holiday_id>/", holiday_delete.HolidayDeleteView.as_view(), name="settings-holiday-delete"),

    # ── Attendance ────────────────────────────────────────────────────
    path("attendance/day-list/", day_list.AdminDayListView.as_view(), name="attendance-day-list"),
    path("attendance/monthly-list/", monthly_list.AdminMonthlyListView.as_view(), name="attendance-monthly-list"),
    path("attendance/missed-checkouts/", missed_checkouts.MissedCheckoutsView.as_view(), name="attendance-missed-checkouts"),
    path("attendance/create/", att_create.AdminAttendanceCreateView.as_view(), name="attendance-create"),
    path("attendance/update/<uuid:attendance_id>/", att_update.AdminAttendanceUpdateView.as_view(), name="attendance-update"),

    # ── Employees ─────────────────────────────────────────────────────
    path("employees/reset-password/<uuid:employee_id>/", password_reset.EmployeePasswordResetView.as_view(), name="employee-password-reset"),
    path("employees/create/", employee_create.EmployeeCreateView.as_view(), name="employee-create"),
    path("employees/list/", employee_list.EmployeeListView.as_view(), name="employee-list"),
    path("employees/view/<uuid:employee_id>/", employee_view.EmployeeDetailView.as_view(), name="employee-detail"),
    path("employees/update/<uuid:employee_id>/", employee_update.EmployeeUpdateView.as_view(), name="employee-update"),
    path("employees/status-toggle/<uuid:employee_id>/", employee_status_toggle.EmployeeStatusToggleView.as_view(), name="employee-status-toggle"),

    path("employees/bank/view/<uuid:employee_id>/", bank_view.BankDetailView.as_view(), name="employee-bank-view"),
    path("employees/bank/update/<uuid:employee_id>/", bank_update.BankUpdateView.as_view(), name="employee-bank-update"),

    path("employees/skill/list/<uuid:employee_id>/", skill_list.SkillListView.as_view(), name="employee-skill-list"),
    path("employees/skill/create/<uuid:employee_id>/", skill_create.SkillCreateView.as_view(), name="employee-skill-create"),
    path("employees/skill/delete/<uuid:employee_id>/<uuid:skill_id>/", skill_delete.SkillDeleteView.as_view(), name="employee-skill-delete"),

    path("employees/certification/list/<uuid:employee_id>/", certification_list.CertificationListView.as_view(), name="employee-certification-list"),
    path("employees/certification/create/<uuid:employee_id>/", certification_create.CertificationCreateView.as_view(), name="employee-certification-create"),
    path("employees/certification/delete/<uuid:employee_id>/<uuid:certification_id>/", certification_delete.CertificationDeleteView.as_view(), name="employee-certification-delete"),

    path("employees/document/list/<uuid:employee_id>/", document_list.DocumentListView.as_view(), name="employee-document-list"),
    path("employees/document/upload/<uuid:employee_id>/", document_upload.DocumentUploadView.as_view(), name="employee-document-upload"),
    path("employees/document/delete/<uuid:employee_id>/<uuid:document_id>/", document_delete.DocumentDeleteView.as_view(), name="employee-document-delete"),
]