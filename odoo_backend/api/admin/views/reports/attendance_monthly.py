from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.report_service import report_service

FILTERS = lambda self: [  # noqa: E731
    {"key": "month", "name": "Month", "type": "integer", "help": "1–12, defaults to current"},
    {"key": "year", "name": "Year", "type": "integer"},
    {"key": "employee_id", "name": "Employee", "type": "uuid", "help": "Optional — single employee"},
    {"key": "department", "name": "Department", "type": "text"},
]


class AttendanceMonthlyReportView(BaseAPIView):
    permission_classes = [IsAdminHR]
    get_filters = FILTERS

    def get(self, request):
        return self.success(
            report_service.attendance_monthly(request.query_params),
            "Attendance report fetched")


class AttendanceMonthlyExportView(AttendanceMonthlyReportView):
    def get(self, request):   # CSV (binary-style response, like PDFs)
        return report_service.attendance_monthly(request.query_params, export=True)