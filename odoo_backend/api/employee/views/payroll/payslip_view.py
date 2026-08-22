from apps.payroll.models import Payslip
from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR
from services.payroll_service import payroll_service


class MyPayslipDetailView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def get(self, request, payslip_id):
        payslip = self.get_object(Payslip, id=payslip_id)
        if payslip.employee_id != request.user.id or payslip.status != Payslip.Status.SENT:
            from rest_framework.exceptions import NotFound
            raise NotFound("Payslip not found.")
        return self.success(payroll_service.payslip_payload(payslip), "Payslip fetched")