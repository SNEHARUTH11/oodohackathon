from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR
from services.leave_service import leave_service


class TimeOffCalendarView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def get_filters(self):
        return [{"key": "year", "name": "Year", "type": "integer",
                 "help": "Defaults to current year"}]

    def get(self, request):
        result = leave_service.calendar(request.user, request.query_params.get("year"))
        return self.success(result, "Time-off calendar fetched")