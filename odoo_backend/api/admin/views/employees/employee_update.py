from apps.accounts.models import User
from apps.employees.serializers.employee import EmployeeUpdateSerializer
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.employee_service import employee_service


class EmployeeUpdateView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def patch(self, request, employee_id):
        employee = self.get_object(User, id=employee_id)
        data = self.validate(EmployeeUpdateSerializer, partial=True)
        result = employee_service.update_employee(employee, data)
        return self.success(result, "Employee updated")