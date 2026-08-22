from rest_framework.permissions import BasePermission

from apps.accounts.models import User

HR_ADMIN_ROLES = {User.Role.ADMIN, User.Role.HR_OFFICER}


class IsAdminHR(BasePermission):
    message = "Only Admin / HR Officer users can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in HR_ADMIN_ROLES
        )


class IsEmployee(BasePermission):
    message = "Only Employee users can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.EMPLOYEE
        )


class IsEmployeeOrAdminHR(BasePermission):
    """Any authenticated user (the standard employee-facing guard)."""

    message = "Authentication required."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)