from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR
from services.employee_service import employee_service


class MyProfileView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def get(self, request):
        return self.success(employee_service.detail_payload(request.user), "Profile fetched")