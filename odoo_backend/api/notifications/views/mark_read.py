from apps.notifications.models import Notification
from apps.notifications.serializers import MarkReadSerializer
from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR


class MarkReadView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def post(self, request):
        data = self.validate(MarkReadSerializer)
        qs = Notification.objects.filter(recipient=request.user, is_read=False)
        if data["mark_all"]:
            count = qs.update(is_read=True)
        else:
            count = qs.filter(id__in=data["ids"]).update(is_read=True)
        return self.success({"marked_read": count}, "Notifications marked read")