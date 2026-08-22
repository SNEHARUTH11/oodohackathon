from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR
from apps.employees.serializers.profile import SelfProfileUpdateSerializer
from services.employee_service import employee_service


class MyProfileUpdateView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def patch(self, request):
        data = self.validate(SelfProfileUpdateSerializer, partial=True)
        result = employee_service.update_self_profile(request.user, data)
        return self.success(result, "Profile updated")