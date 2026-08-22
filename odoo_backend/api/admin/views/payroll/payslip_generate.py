from apps.payroll.serializers.payroll import PayslipGenerateSerializer
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.payroll_service import payroll_service


class PayslipGenerateView(BaseAPIView):
    """Bulk-generate drafts for a month (current month allowed — pays to date,
    flagged partial_month). Sent payslips are never touched."""
    permission_classes = [IsAdminHR]

    def post(self, request):
        data = self.validate(PayslipGenerateSerializer)
        result = payroll_service.generate(request.user, data["month"], data["year"])
        return self.success(result, "Payslip generation complete")