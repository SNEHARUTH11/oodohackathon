from django.http import HttpResponse
from apps.payroll.models import Payslip
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.payroll_service import payroll_service


class PayslipDownloadView(BaseAPIView):
    """Binary PDF response (not the JSON envelope). Drafts without a stored
    PDF are rendered on the fly for admin preview."""
    permission_classes = [IsAdminHR]

    def get(self, request, payslip_id):
        payslip = self.get_object(Payslip, id=payslip_id)
        filename = f"payslip_{payslip.employee.login_id}_{payslip.year}_{payslip.month:02d}.pdf"
        if payslip.pdf_file:
            return HttpResponse(payslip.pdf_file.open("rb"), content_type="application/pdf",
                                headers={"Content-Disposition": f'inline; filename="{filename}"'})
        pdf = payroll_service.render_pdf(payslip)
        return HttpResponse(pdf, content_type="application/pdf",
                            headers={"Content-Disposition": f'inline; filename="{filename}"'})