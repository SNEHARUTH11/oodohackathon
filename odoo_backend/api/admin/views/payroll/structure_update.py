from apps.accounts.models import User
from apps.payroll.serializers.payroll import SalaryStructureUpdateSerializer
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.payroll_service import payroll_service


class SalaryStructureUpdateView(BaseAPIView):
    """Upsert. Any wage change auto-recalculates every component (total == wage)."""
    permission_classes = [IsAdminHR]

    def put(self, request, employee_id):
        employee = self.get_object(User, id=employee_id)
        data = self.validate(SalaryStructureUpdateSerializer)
        result = payroll_service.upsert_structure(employee, data)
        return self.success(result, "Salary structure saved")