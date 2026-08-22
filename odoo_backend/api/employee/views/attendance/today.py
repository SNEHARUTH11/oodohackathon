from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR
from services.attendance_service import attendance_service


class AttendanceTodayView(BaseAPIView):
    """Nav status dot + check-in/out button state."""
    permission_classes = [IsEmployeeOrAdminHR]

    def get(self, request):
        return self.success(attendance_service.today_state(request.user), "Today's attendance state")