from apps.accounts.models import User
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.employee_service import employee_service


class BankDetailView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def get(self, request, employee_id):
        employee = self.get_object(User, id=employee_id)
        return self.success(employee_service.get_bank(employee), "Bank details fetched")