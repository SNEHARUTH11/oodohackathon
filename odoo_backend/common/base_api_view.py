import logging

from django.urls import resolve
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from common.logging_context import update_log_context
from common.pagination import DefaultPagination
from common.response import error_response, success_response

logger = logging.getLogger(__name__)

# Views a user flagged with must_change_password may still call.
FIRST_LOGIN_EXEMPT_VIEWS = {"auth:login", "auth:refresh", "auth:logout", "auth:change-password"}

HR_ADMIN_ROLES = {"admin", "hr_officer"}


class BaseAPIView(APIView):
    """
    Developer contract:
      1. Always declare permission_classes explicitly.
      2. get_object() auto-checks object permissions.
      3. get_list_queryset() for list queries (handles role scoping via model managers).
      4. validate() for request-body validation (raises 400 in the standard envelope).
      5. Views contain NO business logic — call a service in services/.
    """

    pagination_class = DefaultPagination  # class reference, not instance

    # ─── Auth / context ───────────────────────────────────────────────
    def initialize_request(self, request, *args, **kwargs):
        request = super().initialize_request(request, *args, **kwargs)
        user = request.user
        if user and user.is_authenticated:
            update_log_context(
                user_id=getattr(user, "id", None),
                login_id=getattr(user, "login_id", "-"),
                role=getattr(user, "role", "-"),
            )
        return request

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        user = request.user
        if user and user.is_authenticated and getattr(user, "must_change_password", False):
            match = resolve(request.path_info)
            if match.view_name not in FIRST_LOGIN_EXEMPT_VIEWS:
                raise PermissionDenied("Password change required before using the system.")

    @property
    def user(self):
        return self.request.user

    @property
    def is_admin_hr(self):
        return self.user.is_authenticated and self.user.role in HR_ADMIN_ROLES

    # ─── Queryset helpers ─────────────────────────────────────────────
    def get_list_queryset(self, model):
        """Role-scoped starting point for list views. Models define
        `for_request(request)` on their manager when scoping is needed."""
        manager = model.objects
        if hasattr(manager, "for_request"):
            return manager.for_request(self.request)
        if hasattr(model, "is_active"):
            return manager.filter(is_active=True)
        return manager.all()

    def get_object(self, model, **filters):
        """Fetch one object; auto-runs has_object_permission for every
        permission class in permission_classes. 404 if missing, 403 if denied."""
        try:
            qs = model.objects.all()
            if hasattr(model, "is_active"):
                qs = qs.filter(is_active=True)
            obj = qs.get(**filters)
            self.check_object_permissions(self.request, obj)
            return obj
        except model.DoesNotExist:
            logger.warning(f"{model.__name__} not found with filters: {filters}")
            raise NotFound(f"{model.__name__} not found.")
        except model.MultipleObjectsReturned:
            logger.error(f"{model.__name__} multiple rows matched: {filters}")
            raise NotFound(f"{model.__name__} not found.")

    # ─── Validation ───────────────────────────────────────────────────
    def validate(self, serializer_class, partial=False):
        serializer = serializer_class(data=self.request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        return serializer.validated_data

    # ─── Pagination ───────────────────────────────────────────────────
    def paginate(self, queryset):
        self._paginator = self.pagination_class()
        return self._paginator.paginate_queryset(queryset, self.request, view=self)

    def paginated_response(self, data, message="Success", code=status.HTTP_200_OK):
        paginator = self._paginator
        response_data = {
            "items": data,
            "meta": {
                "page": paginator.page.number,
                "page_size": paginator.get_page_size(self.request),
                "total": paginator.page.paginator.count,
                "total_pages": paginator.page.paginator.num_pages,
                "has_next": paginator.page.has_next(),
                "has_previous": paginator.page.has_previous(),
                **self.get_meta(),
            },
        }
        logger.info(f"Paginated response: {len(data)} items, page {paginator.page.number}")
        return Response(success_response(data=response_data, message=message, code=code), status=code)

    # ─── Response helpers ─────────────────────────────────────────────
    def success(self, data=None, message="Success", code=status.HTTP_200_OK):
        return Response(success_response(data=data, message=message, code=code), status=code)

    def error(self, message="Something went wrong", errors=None, code=status.HTTP_400_BAD_REQUEST):
        return Response(error_response(message=message, errors=errors, code=code), status=code)

    def not_found(self, message="Not found"):
        return self.error(message=message, code=status.HTTP_404_NOT_FOUND)

    # ─── Filter documentation (returned to API consumers in meta) ─────
    def get_meta(self):
        return {"filters": self.get_filters()}

    def get_filters(self):
        return []