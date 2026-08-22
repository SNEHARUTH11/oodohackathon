from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from apps.accounts.models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    ordering = ("-date_joined",)
    list_display = ("email", "login_id", "full_name", "role", "is_active", "must_change_password")
    search_fields = ("email", "login_id", "first_name", "last_name")
    list_filter = ("role", "is_active")
    fieldsets = (
        (None, {"fields": ("email", "password", "login_id")}),
        ("Personal", {"fields": ("first_name", "last_name", "phone", "profile_picture",
                                 "date_of_birth", "residing_address")}),
        ("Job", {"fields": ("role", "company", "manager", "department", "job_position",
                            "location", "date_of_joining")}),
        ("Flags", {"fields": ("is_active", "must_change_password", "is_staff", "is_superuser")}),
    )
    add_fieldsets = ((None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),)