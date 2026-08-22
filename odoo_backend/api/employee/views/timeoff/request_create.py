from rest_framework import status

from apps.leaves.serializers.leave import ApplyLeaveSerializer
from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR
from services.leave_service import leave_service


class TimeOffRequestCreateView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def post(self, request):
        data = self.validate(ApplyLeaveSerializer)
        result = leave_service.apply_request(request.user, data)
        return self.success(result, "Leave request submitted", code=status.HTTP_201_CREATED)