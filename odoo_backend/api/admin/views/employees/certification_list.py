from apps.accounts.models import User
from apps.employees.models import Certification
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.employee_service import employee_service


class CertificationListView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def get(self, request, employee_id):
        employee = self.get_object(User, id=employee_id)
        qs = Certification.objects.filter(employee=employee)
        items = [employee_service.certification_payload(c) for c in self.paginate(qs)]
        return self.paginated_response(items, "Certifications fetched")