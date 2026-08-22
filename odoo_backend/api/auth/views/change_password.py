from rest_framework.permissions import IsAuthenticated

from apps.accounts.serializers.change_password import ChangePasswordSerializer
from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR
from services.auth_service import auth_service


class ChangePasswordView(BaseAPIView):
    # IsAuthenticated is the real guard; IsEmployeeOrAdminHR kept per contract
    permission_classes = [IsAuthenticated, IsEmployeeOrAdminHR]

    def post(self, request):
        data = self.validate(ChangePasswordSerializer)
        result = auth_service.change_password(request.user, data)
        return self.success(result, "Password changed successfully")