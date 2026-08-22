from apps.accounts.models import User
from apps.employees.serializers.bank import BankDetailSerializer
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.employee_service import employee_service


class BankUpdateView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def put(self, request, employee_id):
        employee = self.get_object(User, id=employee_id)
        data = self.validate(BankDetailSerializer)
        result = employee_service.upsert_bank(employee, data)
        return self.success(result, "Bank details saved")