from rest_framework import status

from apps.attendance.serializers.attendance import AdminAttendanceCreateSerializer
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.attendance_service import attendance_service


class AdminAttendanceCreateView(BaseAPIView):
    """Manual row (WFH, on-site without app, backfill). If a row already
    exists for the employee+date, the times are appended as an admin session."""
    permission_classes = [IsAdminHR]

    def post(self, request):
        data = self.validate(AdminAttendanceCreateSerializer)
        result = attendance_service.admin_create(request.user, data)
        return self.success(result, "Attendance record saved", code=status.HTTP_201_CREATED)