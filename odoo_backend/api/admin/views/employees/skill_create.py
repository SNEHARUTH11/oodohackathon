from rest_framework import status

from apps.accounts.models import User
from apps.employees.serializers.resume import SkillCreateSerializer
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.employee_service import employee_service


class SkillCreateView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def post(self, request, employee_id):
        employee = self.get_object(User, id=employee_id)
        data = self.validate(SkillCreateSerializer)
        result = employee_service.create_skill(employee, data)
        return self.success(result, "Skill added", code=status.HTTP_201_CREATED)