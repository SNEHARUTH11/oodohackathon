from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.dashboard_service import dashboard_service


class AdminDashboardOverviewView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def get_filters(self):
        return [{"key": "search", "name": "Search", "type": "text"}]

    def get(self, request):
        result = dashboard_service.admin_overview(request.query_params.get("search"))
        return self.success(result, "Admin dashboard fetched")