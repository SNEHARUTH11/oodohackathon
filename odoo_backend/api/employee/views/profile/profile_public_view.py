from apps.accounts.models import User
from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR
from services.employee_service import employee_service


class PublicProfileView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def get(self, request):
        employee_id = request.query_params.get("employee_id")
        if not employee_id:
            return self.error(errors={"employee_id": ["This query parameter is required."]})
        employee = self.get_object(User, id=employee_id)
        return self.success(employee_service.public_payload(employee), "Employee fetched")