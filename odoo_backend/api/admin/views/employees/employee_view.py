from apps.accounts.models import User
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.employee_service import employee_service


class EmployeeDetailView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def get(self, request, employee_id):
        employee = self.get_object(User, id=employee_id)
        return self.success(employee_service.detail_payload(employee), "Employee fetched")