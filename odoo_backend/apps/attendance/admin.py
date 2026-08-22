from django.contrib import admin

from apps.attendance.models import Attendance, AttendanceSession


class AttendanceSessionInline(admin.TabularInline):
    model = AttendanceSession
    extra = 0


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ("employee", "date", "status", "work_hours", "extra_hours", "updated_by")
    list_filter = ("status", "date")
    search_fields = ("employee__email", "employee__login_id", "employee__first_name")
    inlines = [AttendanceSessionInline]


@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = ("attendance", "check_in", "check_out", "source", "created_by")
    list_filter = ("source",)