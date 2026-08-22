from rest_framework import status

from apps.accounts.models import User
from apps.employees.serializers.employee import AdminPasswordResetSerializer
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.employee_service import employee_service


class EmployeePasswordResetView(BaseAPIView):
    """POST {} → new system temp password (returned once, emailed).
    POST {"new_password": "..."} → admin-chosen password (policy-checked)."""
    permission_classes = [IsAdminHR]

    def post(self, request, employee_id):
        employee = self.get_object(User, id=employee_id)
        data = self.validate(AdminPasswordResetSerializer)
        result = employee_service.reset_password(request.user, employee,
                                                 data["new_password"] or None)
        return self.success(result, "Password reset — temporary password returned once",
                            code=status.HTTP_200_OK)