from apps.accounts.models import User
from apps.employees.models import Document
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR


class DocumentDeleteView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def delete(self, request, employee_id, document_id):
        employee = self.get_object(User, id=employee_id)
        doc = self.get_object(Document, id=document_id, employee=employee)
        doc.file.delete(save=False)
        doc.delete()
        return self.success({"id": str(document_id)}, "Document removed")