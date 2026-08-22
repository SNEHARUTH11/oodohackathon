from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.attendance_service import attendance_service


class AdminDayListView(BaseAPIView):
    """All employees' state for one day (defaults to today). Unpaginated —
    dashboard-style view; `counts` feeds summary chips."""
    permission_classes = [IsAdminHR]

    def get_filters(self):
        return [
            {"key": "date", "name": "Date", "type": "date", "help": "YYYY-MM-DD, defaults to today"},
            {"key": "search", "name": "Search", "type": "text", "help": "Name, login ID, department"},
        ]

    def get(self, request):
        return self.success(attendance_service.admin_day_view(request.query_params),
                            "Day attendance fetched")