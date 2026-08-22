from django.db import models


class AttendanceQuerySet(models.QuerySet):
    def for_request(self, request):
        """Employees see only their own rows; Admin/HR see everything."""
        user = request.user
        if not user.is_authenticated:
            return self.none()
        if user.is_admin_hr:
            return self.all()
        return self.filter(employee=user)