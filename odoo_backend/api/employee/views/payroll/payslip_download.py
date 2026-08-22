from django.http import HttpResponse
from apps.payroll.models import Payslip
from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR


class MyPayslipDownloadView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def get(self, request, payslip_id):
        payslip = self.get_object(Payslip, id=payslip_id)
        if payslip.employee_id != request.user.id or payslip.status != Payslip.Status.SENT:
            from rest_framework.exceptions import NotFound
            raise NotFound("Payslip not found.")
        if not payslip.pdf_file:
            return self.not_found("Payslip file not available yet.")
        filename = f"payslip_{payslip.employee.login_id}_{payslip.year}_{payslip.month:02d}.pdf"
        return HttpResponse(payslip.pdf_file.open("rb"), content_type="application/pdf",
                            headers={"Content-Disposition": f'inline; filename="{filename}"'})