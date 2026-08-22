from apps.company.serializers import CompanyConfigUpdateSerializer
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.config_service import update_settings


class CompanySettingsUpdateView(BaseAPIView):
    """Config changes apply to FUTURE computations; stored attendance/payslips
    are not retroactively recalculated."""
    permission_classes = [IsAdminHR]

    def patch(self, request):
        data = self.validate(CompanyConfigUpdateSerializer)
        result = update_settings(data)
        return self.success(result, "Company settings updated")