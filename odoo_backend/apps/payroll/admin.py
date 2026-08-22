from django.contrib import admin

from apps.payroll.models import Payslip, SalaryStructure


@admin.register(SalaryStructure)
class SalaryStructureAdmin(admin.ModelAdmin):
    list_display = ("employee", "monthly_wage", "basic", "pf_employee", "updated_at")
    search_fields = ("employee__email", "employee__login_id")


@admin.register(Payslip)
class PayslipAdmin(admin.ModelAdmin):
    list_display = ("employee", "month", "year", "payable_days", "working_days",
                    "net_pay", "status")
    list_filter = ("status", "year", "month")
    search_fields = ("employee__email", "employee__login_id")