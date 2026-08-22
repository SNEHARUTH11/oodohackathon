from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.config_service import holiday_list


class HolidayListView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def get_filters(self):
        return [{"key": "year", "name": "Year", "type": "integer"}]

    def get(self, request):
        qs = holiday_list(request.query_params)
        items = [{"id": str(h.id), "date": h.date, "name": h.name}
                 for h in self.paginate(qs)]
        return self.paginated_response(items, "Holidays fetched")