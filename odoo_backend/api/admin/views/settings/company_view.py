from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.config_service import get_settings


class CompanySettingsView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def get(self, request):
        return self.success(get_settings(), "Company settings fetched")