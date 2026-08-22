from apps.leaves.models import TimeOffRequest
from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR
from services.leave_service import leave_service


class TimeOffRequestCancelView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def post(self, request, request_id):
        req = self.get_object(TimeOffRequest, id=request_id, employee=request.user)
        result = leave_service.cancel(request.user, req)
        return self.success(result, "Request cancelled")