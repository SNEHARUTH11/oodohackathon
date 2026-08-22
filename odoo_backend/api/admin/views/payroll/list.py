from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.payroll_service import payroll_service


class PayrollListView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def get_filters(self):
        return [
            {"key": "month", "name": "Month", "type": "integer", "help": "1–12, defaults to current"},
            {"key": "year", "name": "Year", "type": "integer", "help": "Defaults to current"},
        ]

    def get(self, request):
        return self.success(payroll_service.payroll_list(request.query_params),
                            "Payroll list fetched")