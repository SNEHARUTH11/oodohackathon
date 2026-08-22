from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR
from services.dashboard_service import dashboard_service


class EmployeeDashboardOverviewView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def get_filters(self):
        return [{"key": "search", "name": "Search", "type": "text",
                 "help": "Filter cards by name, department or login ID"}]

    def get(self, request):
        result = dashboard_service.employee_overview(request.user,
                                                     request.query_params.get("search"))
        return self.success(result, "Dashboard fetched")