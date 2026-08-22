from apps.employees.models import Skill
from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR


class SkillDeleteView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def delete(self, request, skill_id):
        skill = self.get_object(Skill, id=skill_id, employee=request.user)
        skill.delete()
        return self.success({"id": str(skill_id)}, "Skill removed")