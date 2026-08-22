from apps.accounts.models import User
from apps.employees.models import Document
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.employee_service import employee_service


class DocumentListView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def get(self, request, employee_id):
        employee = self.get_object(User, id=employee_id)
        qs = Document.objects.filter(employee=employee).select_related("uploaded_by")
        items = [employee_service.document_payload(d) for d in self.paginate(qs)]
        return self.paginated_response(items, "Documents fetched")