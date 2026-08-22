from apps.payroll.models import Payslip
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.payroll_service import payroll_service


class PayslipDetailView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def get(self, request, payslip_id):
        payslip = self.get_object(Payslip, id=payslip_id)
        return self.success(payroll_service.payslip_payload(payslip), "Payslip fetched")