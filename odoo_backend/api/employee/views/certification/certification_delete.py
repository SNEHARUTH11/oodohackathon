from apps.employees.models import Certification
from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR


class CertificationDeleteView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def delete(self, request, certification_id):
        cert = self.get_object(Certification, id=certification_id, employee=request.user)
        if cert.certificate_file:
            cert.certificate_file.delete(save=False)
        cert.delete()
        return self.success({"id": str(certification_id)}, "Certification removed")