from apps.payroll.models import Payslip
from common.base_api_view import BaseAPIView
from common.permissions import IsEmployeeOrAdminHR
from services.payroll_service import payroll_service


class MyPayslipListView(BaseAPIView):
    """Own payslips (sent only — drafts are internal), newest first."""
    permission_classes = [IsEmployeeOrAdminHR]

    def get_filters(self):
        return [{"key": "year", "name": "Year", "type": "integer"}]

    def get(self, request):
        qs = self.get_list_queryset(Payslip)
        year = request.query_params.get("year")
        if year:
            try:
                qs = qs.filter(year=int(year))
            except (TypeError, ValueError):
                return self.error(errors={"year": ["Must be an integer."]})
        items = [payroll_service.payslip_payload(p, detailed=False)
                 for p in self.paginate(qs.select_related("employee"))]
        return self.paginated_response(items, "Payslips fetched")