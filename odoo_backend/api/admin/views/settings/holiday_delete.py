from apps.company.models import PublicHoliday
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR


class HolidayDeleteView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def delete(self, request, holiday_id):
        holiday = self.get_object(PublicHoliday, id=holiday_id)
        holiday.delete()
        return self.success({"id": str(holiday_id)}, "Holiday deleted")