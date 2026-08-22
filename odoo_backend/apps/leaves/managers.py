from django.db import models


class LeaveQuerySet(models.QuerySet):
    def for_request(self, request):
        user = request.user
        if not user.is_authenticated:
            return self.none()
        if user.is_admin_hr:
            return self.all()
        return self.filter(employee=user)