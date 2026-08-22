from apps.accounts.models import User
from apps.employees.models import Certification
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR


class CertificationDeleteView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def delete(self, request, employee_id, certification_id):
        employee = self.get_object(User, id=employee_id)
        cert = self.get_object(Certification, id=certification_id, employee=employee)
        if cert.certificate_file:
            cert.certificate_file.delete(save=False)
        cert.delete()
        return self.success({"id": str(certification_id)}, "Certification removed")