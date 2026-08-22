from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR
from apps.employees.serializers.profile import ProfilePictureUploadSerializer
from services.employee_service import employee_service


class ProfilePictureUploadView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def post(self, request):
        data = self.validate(ProfilePictureUploadSerializer)
        url = employee_service.upload_picture(request.user, data["image"])
        return self.success({"profile_picture": url}, "Profile picture updated")