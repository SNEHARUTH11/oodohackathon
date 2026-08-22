from apps.payroll.models import Payslip
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.payroll_service import payroll_service


class PayslipRegenerateView(BaseAPIView):
    """Draft only. Review flags → fix attendance/config → regenerate."""
    permission_classes = [IsAdminHR]

    def post(self, request, payslip_id):
        payslip = self.get_object(Payslip, id=payslip_id)
        result = payroll_service.regenerate(request.user, payslip)
        return self.success(result, "Payslip regenerated from latest attendance")