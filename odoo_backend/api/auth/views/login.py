from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle

from apps.accounts.serializers.login import LoginSerializer
from common.base_api_view import BaseAPIView
from services.auth_service import auth_service


class LoginView(BaseAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]  # brute-force guard, 30/min/IP

    def post(self, request):
        data = self.validate(LoginSerializer)
        result = auth_service.login(identifier=data["identifier"], password=data["password"])
        return self.success(result, "Login successful")