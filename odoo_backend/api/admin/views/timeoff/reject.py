from apps.leaves.models import TimeOffRequest
from apps.leaves.serializers.leave import LeaveReviewSerializer
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.leave_service import leave_service


class TimeOffRejectView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def post(self, request, request_id):
        req = self.get_object(TimeOffRequest, id=request_id)
        data = self.validate(LeaveReviewSerializer)
        result = leave_service.reject(request.user, req, data["comment"])
        return self.success(result, "Leave request rejected")