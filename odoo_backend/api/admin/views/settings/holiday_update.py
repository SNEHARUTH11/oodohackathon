from apps.company.models import PublicHoliday
from apps.company.serializers import HolidaySerializer
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.config_service import holiday_update


class HolidayUpdateView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def patch(self, request, holiday_id):
        holiday = self.get_object(PublicHoliday, id=holiday_id)
        data = self.validate(HolidaySerializer, partial=True)
        holiday = holiday_update(holiday, data)
        return self.success({"id": str(holiday.id), "date": holiday.date,
                             "name": holiday.name}, "Holiday updated")