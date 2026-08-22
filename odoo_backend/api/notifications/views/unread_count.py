from apps.notifications.models import Notification
from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR


class UnreadCountView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def get(self, request):
        return self.success({"count": Notification.objects.filter(
            recipient=request.user, is_read=False).count()}, "Unread count")