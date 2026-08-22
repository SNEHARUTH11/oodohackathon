from rest_framework.permissions import IsAuthenticated

from apps.accounts.serializers.auth import LogoutSerializer
from common.base_api_view import BaseAPIView
from services.auth_service import auth_service


class LogoutView(BaseAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = self.validate(LogoutSerializer)
        auth_service.logout(data["refresh"])
        return self.success(message="Logged out successfully")