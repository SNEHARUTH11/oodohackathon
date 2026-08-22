from apps.accounts.models import User
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.attendance_service import attendance_service


class AdminMonthlyListView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def get_filters(self):
        return [
            {"key": "employee_id", "name": "Employee", "type": "uuid", "required": True},
            {"key": "month", "name": "Month", "type": "integer"},
            {"key": "year", "name": "Year", "type": "integer"},
        ]

    def get(self, request):
        employee_id = request.query_params.get("employee_id")
        if not employee_id:
            return self.error(errors={"employee_id": ["This query parameter is required."]})
        employee = self.get_object(User, id=employee_id)
        result = attendance_service.monthly_view(
            employee, request.query_params.get("month"), request.query_params.get("year")
        )
        return self.success(result, "Monthly attendance fetched")