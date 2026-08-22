from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR
from services.leave_service import leave_service


class TimeOffBalanceView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def get(self, request):
        return self.success(leave_service.balances(request.user,
                                                   request.query_params.get("year")),
                            "Leave balances fetched")