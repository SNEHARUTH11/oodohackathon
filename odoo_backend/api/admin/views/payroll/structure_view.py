from apps.accounts.models import User
from apps.payroll.models import SalaryStructure
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.payroll_service import payroll_service


class SalaryStructureView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def get(self, request, employee_id):
        employee = self.get_object(User, id=employee_id)
        struct = SalaryStructure.objects.filter(employee=employee).first()
        if not struct:
            return self.success(None, "No salary structure configured for this employee")
        return self.success(payroll_service.structure_payload(struct), "Salary structure fetched")