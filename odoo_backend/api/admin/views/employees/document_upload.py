from rest_framework import status

from apps.accounts.models import User
from apps.employees.serializers.resume import DocumentUploadSerializer
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.employee_service import employee_service


class DocumentUploadView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def post(self, request, employee_id):
        employee = self.get_object(User, id=employee_id)
        data = self.validate(DocumentUploadSerializer)
        result = employee_service.upload_document(request.user, employee, data)
        return self.success(result, "Document uploaded", code=status.HTTP_201_CREATED)