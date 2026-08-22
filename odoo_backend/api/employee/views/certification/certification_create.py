from rest_framework import status

from apps.employees.serializers.resume import CertificationCreateSerializer
from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR
from services.employee_service import employee_service


class CertificationCreateView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def post(self, request):
        data = self.validate(CertificationCreateSerializer)
        result = employee_service.create_certification(request.user, data)
        return self.success(result, "Certification added", code=status.HTTP_201_CREATED)