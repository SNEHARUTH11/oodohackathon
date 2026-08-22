from django.urls import path

from api.admin.views.employees import (
    bank_update, bank_view, certification_create, certification_delete,
    certification_list, document_delete, document_list, document_upload,
    employee_create, employee_list, employee_status_toggle, employee_update,
    employee_view, skill_create, skill_delete, skill_list,
)

# NOTE: app_name is "adminpanel", NOT "admin" — Django's built-in admin site
# already claims the "admin" namespace and a duplicate raises ImproperlyConfigured.
app_name = "adminpanel"

urlpatterns = [
    path("employees/create/", employee_create.EmployeeCreateView.as_view(), name="employee-create"),
    path("employees/list/", employee_list.EmployeeListView.as_view(), name="employee-list"),
    path("employees/view/<uuid:employee_id>/", employee_view.EmployeeDetailView.as_view(), name="employee-detail"),
    path("employees/update/<uuid:employee_id>/", employee_update.EmployeeUpdateView.as_view(), name="employee-update"),
    path("employees/status-toggle/<uuid:employee_id>/", employee_status_toggle.EmployeeStatusToggleView.as_view(), name="employee-status-toggle"),

    path("employees/bank/view/<uuid:employee_id>/", bank_view.BankDetailView.as_view(), name="employee-bank-view"),
    path("employees/bank/update/<uuid:employee_id>/", bank_update.BankUpdateView.as_view(), name="employee-bank-update"),

    path("employees/skill/list/<uuid:employee_id>/", skill_list.SkillListView.as_view(), name="employee-skill-list"),
    path("employees/skill/create/<uuid:employee_id>/", skill_create.SkillCreateView.as_view(), name="employee-skill-create"),
    path("employees/skill/delete/<uuid:employee_id>/<uuid:skill_id>/", skill_delete.SkillDeleteView.as_view(), name="employee-skill-delete"),

    path("employees/certification/list/<uuid:employee_id>/", certification_list.CertificationListView.as_view(), name="employee-certification-list"),
    path("employees/certification/create/<uuid:employee_id>/", certification_create.CertificationCreateView.as_view(), name="employee-certification-create"),
    path("employees/certification/delete/<uuid:employee_id>/<uuid:certification_id>/", certification_delete.CertificationDeleteView.as_view(), name="employee-certification-delete"),

    path("employees/document/list/<uuid:employee_id>/", document_list.DocumentListView.as_view(), name="employee-document-list"),
    path("employees/document/upload/<uuid:employee_id>/", document_upload.DocumentUploadView.as_view(), name="employee-document-upload"),
    path("employees/document/delete/<uuid:employee_id>/<uuid:document_id>/", document_delete.DocumentDeleteView.as_view(), name="employee-document-delete"),
]