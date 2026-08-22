from apps.accounts.models import User
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.employee_service import employee_service


class EmployeeStatusToggleView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def post(self, request, employee_id):
        employee = self.get_object(User, id=employee_id)
        result = employee_service.toggle_employee_status(request.user, employee)
        message = "Employee reactivated" if result["is_active"] else "Employee deactivated"
        return self.success(result, message)