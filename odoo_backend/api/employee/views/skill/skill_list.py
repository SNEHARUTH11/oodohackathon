from apps.employees.models import Skill
from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR


class SkillListView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def get(self, request):
        qs = Skill.objects.filter(employee=request.user)
        items = [{"id": str(s.id), "name": s.name} for s in self.paginate(qs)]
        return self.paginated_response(items, "Skills fetched")