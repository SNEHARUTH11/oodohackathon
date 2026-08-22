from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR
from services.attendance_service import attendance_service


class AttendanceListView(BaseAPIView):
    """Own monthly calendar + summary badges. Defaults to current month."""
    permission_classes = [IsEmployeeOrAdminHR]

    def get_filters(self):
        return [
            {"key": "month", "name": "Month", "type": "integer", "help": "1–12, defaults to current"},
            {"key": "year", "name": "Year", "type": "integer", "help": "Defaults to current"},
        ]

    def get(self, request):
        params = request.query_params
        result = attendance_service.monthly_view(
            request.user, params.get("month"), params.get("year")
        )
        return self.success(result, "Attendance fetched")