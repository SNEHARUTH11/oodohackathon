from apps.notifications.models import Notification
from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR


class NotificationListView(BaseAPIView):
    permission_classes = [IsEmployeeOrAdminHR]

    def get_filters(self):
        return [{"key": "is_read", "name": "Read", "type": "boolean"},
                {"key": "type", "name": "Type", "type": "choice",
                 "options": [{"value": v, "label": v.title()} for v in
                             ("leave", "payslip", "account", "system")]}]

    def get(self, request):
        qs = Notification.objects.filter(recipient=request.user)
        is_read = request.query_params.get("is_read")
        if is_read in ("true", "false"):
            qs = qs.filter(is_read=(is_read == "true"))
        ntype = request.query_params.get("type")
        if ntype:
            qs = qs.filter(type=ntype)
        items = [{"id": str(n.id), "title": n.title, "message": n.message,
                  "type": n.type, "data": n.data, "is_read": n.is_read,
                  "created_at": n.created_at} for n in self.paginate(qs)]
        return self.paginated_response(items, "Notifications fetched")