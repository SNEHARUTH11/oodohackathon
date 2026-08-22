from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR
from services.leave_service import leave_service


class TimeOffRequestListView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def get_filters(self):
        return [
            {"key": "status", "name": "Status", "type": "choice",
             "options": [{"value": v, "label": v.title()} for v in
                         ("pending", "approved", "rejected", "cancelled")]},
            {"key": "leave_type", "name": "Leave Type", "type": "choice",
             "options": [{"value": v, "label": v.title()} for v in ("paid", "sick", "unpaid")]},
            {"key": "year", "name": "Year", "type": "integer"},
        ]

    def get(self, request):
        qs = leave_service.list_requests(request.query_params, employee=request.user)
        items = [leave_service.request_payload(r) for r in self.paginate(qs)]
        return self.paginated_response(items, "Time-off requests fetched")