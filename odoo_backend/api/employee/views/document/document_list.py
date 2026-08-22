from apps.employees.models import Document
from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR
from services.employee_service import employee_service


class DocumentListView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def get(self, request):
        qs = Document.objects.filter(employee=request.user).select_related("uploaded_by")
        items = [employee_service.document_payload(d) for d in self.paginate(qs)]
        return self.paginated_response(items, "Documents fetched")