from apps.accounts.models import User
from apps.employees.models import Skill
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR


class SkillListView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def get(self, request, employee_id):
        employee = self.get_object(User, id=employee_id)
        qs = Skill.objects.filter(employee=employee)
        items = [{"id": str(s.id), "name": s.name} for s in self.paginate(qs)]
        return self.paginated_response(items, "Skills fetched")