from rest_framework import status

from apps.employees.serializers.resume import SkillCreateSerializer
from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR
from services.employee_service import employee_service


class SkillCreateView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def post(self, request):
        data = self.validate(SkillCreateSerializer)
        result = employee_service.create_skill(request.user, data)
        return self.success(result, "Skill added", code=status.HTTP_201_CREATED)