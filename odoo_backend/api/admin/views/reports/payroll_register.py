from common.base_api_view import BaseAPIView
from common.permissions import IsAdminHR
from services.report_service import report_service


class PayrollRegisterView(BaseAPIView):
    permission_classes = [IsAdminHR]

    def get_filters(self):
        return [
            {"key": "month", "name": "Month", "type": "integer", "help": "Defaults to current"},
            {"key": "year", "name": "Year", "type": "integer"},
            {"key": "employee_id", "name": "Employee", "type": "uuid"},
            {"key": "department", "name": "Department", "type": "text"},
        ]

    def get(self, request):
        return self.success(report_service.payroll_register(request.query_params),
                            "Payroll register fetched")


class PayrollRegisterExportView(PayrollRegisterView):
    def get(self, request):
        return report_service.payroll_register(request.query_params, export=True)