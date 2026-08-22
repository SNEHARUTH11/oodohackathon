from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.attendance_service import attendance_service


class MissedCheckoutsView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def get(self, request):
        qs = attendance_service.missed_checkout_queryset()
        items = [attendance_service.missed_checkout_item(s) for s in self.paginate(qs)]
        return self.paginated_response(items, "Missed check-outs fetched")