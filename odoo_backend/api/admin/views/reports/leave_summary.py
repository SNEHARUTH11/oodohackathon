from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.report_service import report_service


class LeaveSummaryView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def get_filters(self):
        return [
            {"key": "year", "name": "Year", "type": "integer", "help": "Defaults to current"},
            {"key": "employee_id", "name": "Employee", "type": "uuid"},
            {"key": "department", "name": "Department", "type": "text"},
        ]

    def get(self, request):
        return self.success(report_service.leave_summary(request.query_params),
                            "Leave summary fetched")


class LeaveSummaryExportView(LeaveSummaryView):
    def get(self, request):
        return report_service.leave_summary(request.query_params, export=True)