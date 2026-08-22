from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.analytics_service import analytics_service


class AnalyticsOverviewView(BaseAPIView):
    """Charts-ready payload: trend lines, donuts, bars + pending chips."""
    permission_classes = [IsAdminHR]

    def get_filters(self):
        return [{"key": "year", "name": "Year", "type": "integer",
                 "help": "For joins/leave distribution; trends always last 12 months"}]

    def get(self, request):
        return self.success(
            analytics_service.overview(request.query_params.get("year")),
            "Analytics fetched")