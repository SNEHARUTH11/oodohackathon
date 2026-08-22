from rest_framework import status

from apps.company.serializers import HolidaySerializer
from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.config_service import holiday_create


class HolidayCreateView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def post(self, request):
        data = self.validate(HolidaySerializer)
        holiday = holiday_create(data)
        return self.success({"id": str(holiday.id), "date": holiday.date,
                             "name": holiday.name},
                            "Holiday created", code=status.HTTP_201_CREATED)