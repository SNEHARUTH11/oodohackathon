from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.serializers import TokenRefreshSerializer

from common.base_api_view import BaseAPIView


class RefreshView(BaseAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        tokens = self.validate(TokenRefreshSerializer)
        return self.success(tokens, "Token refreshed")