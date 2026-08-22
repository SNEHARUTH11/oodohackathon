from apps.attendance.models import Attendance
from apps.attendance.serializers.attendance import AdminAttendanceUpdateSerializer
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.attendance_service import attendance_service


class AdminAttendanceUpdateView(BaseAPIView):
    """Edit session times (close a missed check-out by sending session_id +
    check_out), or override status. All edits audit-stamped via updated_by."""
    permission_classes = [IsAdminHR]

    def patch(self, request, attendance_id):
        att = self.get_object(Attendance, id=attendance_id)
        data = self.validate(AdminAttendanceUpdateSerializer)
        result = attendance_service.admin_update(request.user, att, data)
        return self.success(result, "Attendance record updated")