from django.db import models


class PayslipQuerySet(models.QuerySet):
    def for_request(self, request):
        """Employees see only their own SENT payslips; Admin/HR see all."""
        user = request.user
        if not user.is_authenticated:
            return self.none()
        if user.is_admin_hr:
            return self.all()
        return self.filter(employee=user, status="sent")  # literal: avoids import cycle