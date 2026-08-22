from django.contrib import admin

from apps.employees.models import BankDetail, Certification, Document, Skill


@admin.register(BankDetail)
class BankDetailAdmin(admin.ModelAdmin):
    list_display = ("employee", "bank_name", "account_number", "updated_at")
    search_fields = ("employee__email", "employee__login_id", "account_number")


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name", "employee")
    search_fields = ("name",)


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ("name", "employee", "issuer", "issue_date")
    search_fields = ("name", "employee__email")


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("doc_type", "title", "employee", "uploaded_by", "uploaded_at")
    list_filter = ("doc_type",)
    search_fields = ("title", "employee__email")