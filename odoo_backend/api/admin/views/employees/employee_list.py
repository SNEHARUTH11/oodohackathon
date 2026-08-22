from apps.accounts.models import User
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.employee_service import employee_service


class EmployeeListView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def get_filters(self):
        return [
            {"key": "search", "name": "Search", "type": "text",
             "help": "Name, email, login ID or department"},
            {"key": "role", "name": "Role", "type": "choice",
             "options": [{"value": v, "label": v.replace("_", " ").title()}
                         for v in User.Role.values]},
            {"key": "department", "name": "Department", "type": "text"},
            {"key": "is_active", "name": "Active", "type": "boolean"},
        ]

    def get(self, request):
        qs = employee_service.list_employees(request.query_params)
        items = [employee_service.list_item(u) for u in self.paginate(qs)]
        return self.paginated_response(items, "Employees fetched")