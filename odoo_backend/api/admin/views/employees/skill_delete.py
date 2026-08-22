from apps.accounts.models import User
from apps.employees.models import Skill
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR


class SkillDeleteView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def delete(self, request, employee_id, skill_id):
        employee = self.get_object(User, id=employee_id)
        skill = self.get_object(Skill, id=skill_id, employee=employee)
        skill.delete()
        return self.success({"id": str(skill_id)}, "Skill removed")