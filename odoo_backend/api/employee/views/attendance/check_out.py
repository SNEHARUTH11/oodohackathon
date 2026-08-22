from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR
from services.attendance_service import attendance_service


class CheckOutView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def post(self, request):
        return self.success(attendance_service.check_out(request.user), "Checked out successfully")