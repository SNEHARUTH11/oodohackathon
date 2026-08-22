from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.leave_service import leave_service


class AllocationListView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def get_filters(self):
        return [
            {"key": "year", "name": "Year", "type": "integer", "help": "Defaults to current year"},
            {"key": "search", "name": "Search", "type": "text", "help": "Employee name / login ID"},
        ]

    def get(self, request):
        items = leave_service.allocation_list(request.query_params)
        page = self.paginate(items)
        return self.paginated_response(page, "Leave allocations fetched")