from django.contrib import admin

from apps.leaves.models import LeaveBalance, TimeOffRequest


@admin.register(TimeOffRequest)
class TimeOffRequestAdmin(admin.ModelAdmin):
    list_display = ("employee", "leave_type", "start_date", "end_date",
                    "days_count", "status", "reviewed_by")
    list_filter = ("status", "leave_type")
    search_fields = ("employee__email", "employee__login_id")


@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    list_display = ("employee", "year", "paid_leave_total", "paid_leave_used",
                    "sick_leave_total", "sick_leave_used", "unpaid_leave_used")
    search_fields = ("employee__email", "employee__login_id")