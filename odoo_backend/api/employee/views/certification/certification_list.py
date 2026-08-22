from apps.employees.models import Certification
from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR
from services.employee_service import employee_service


class CertificationListView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def get(self, request):
        qs = Certification.objects.filter(employee=request.user)
        items = [employee_service.certification_payload(c) for c in self.paginate(qs)]
        return self.paginated_response(items, "Certifications fetched")