from apps.payroll.serializers.payroll import PayslipSendSerializer
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.payroll_service import payroll_service


class PayslipSendView(BaseAPIView):
    """Send drafts: renders + attaches PDF, emails employee, locks payslip.
    Body: {payslip_ids: [...]}  OR  {month, year} (all drafts of that month)."""
    permission_classes = [IsAdminHR]

    def post(self, request):
        data = self.validate(PayslipSendSerializer)
        result = payroll_service.send_bulk(
            request.user, ids=data["payslip_ids"] or None,
            month=data.get("month"), year=data.get("year"))
        return self.success(result, f"{result['sent']} payslip(s) sent, "
                                    f"{result['failed']} failed")