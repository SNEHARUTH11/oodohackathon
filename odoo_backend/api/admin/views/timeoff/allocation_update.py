from apps.accounts.models import User
from apps.leaves.serializers.leave import AllocationUpdateSerializer
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.leave_service import leave_service


class AllocationUpdateView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def put(self, request, employee_id):
        employee = self.get_object(User, id=employee_id)
        data = self.validate(AllocationUpdateSerializer)
        result = leave_service.allocation_update(employee, data)
        return self.success(result, "Leave allocation updated")