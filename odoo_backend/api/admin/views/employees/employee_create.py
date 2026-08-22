from rest_framework import status

from apps.employees.serializers.employee import EmployeeCreateSerializer
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.employee_service import employee_service


class EmployeeCreateView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def post(self, request):
        data = self.validate(EmployeeCreateSerializer)
        result = employee_service.create_employee(request.user, data)
        return self.success(result, "Employee created — credentials emailed",
                            code=status.HTTP_201_CREATED)