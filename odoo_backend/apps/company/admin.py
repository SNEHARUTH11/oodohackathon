from django.contrib import admin

from apps.company.models import Company, CompanyConfig, PublicHoliday


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "prefix", "timezone")


@admin.register(CompanyConfig)
class CompanyConfigAdmin(admin.ModelAdmin):
    list_display = ("company", "updated_at")


@admin.register(PublicHoliday)
class PublicHolidayAdmin(admin.ModelAdmin):
    list_display = ("name", "date", "company")
    search_fields = ("name",)