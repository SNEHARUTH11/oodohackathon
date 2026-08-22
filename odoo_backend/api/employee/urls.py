from django.urls import path

from api.employee.views.attendance import check_in, check_out, list as att_list, today
from api.employee.views.bank import bank_view
from api.employee.views.certification import (
    certification_create, certification_delete, certification_list,
)
from api.employee.views.document import document_list
from api.employee.views.profile import (
    profile_picture_upload, profile_public_view, profile_update, profile_view,
)
from api.employee.views.skill import skill_create, skill_delete, skill_list

app_name = "employee"

urlpatterns = [
    path("attendance/today/", today.AttendanceTodayView.as_view(), name="attendance-today"),
    path("attendance/check-in/", check_in.CheckInView.as_view(), name="attendance-check-in"),
    path("attendance/check-out/", check_out.CheckOutView.as_view(), name="attendance-check-out"),
    path("attendance/list/", att_list.AttendanceListView.as_view(), name="attendance-list"),

    path("profile/view/", profile_view.MyProfileView.as_view(), name="profile-view"),
    path("profile/update/", profile_update.MyProfileUpdateView.as_view(), name="profile-update"),
    path("profile/picture/upload/", profile_picture_upload.ProfilePictureUploadView.as_view(), name="profile-picture"),
    path("profile/public-view/", profile_public_view.PublicProfileView.as_view(), name="profile-public"),

    path("bank/view/", bank_view.MyBankView.as_view(), name="bank-view"),

    path("skill/list/", skill_list.SkillListView.as_view(), name="skill-list"),
    path("skill/create/", skill_create.SkillCreateView.as_view(), name="skill-create"),
    path("skill/delete/<uuid:skill_id>/", skill_delete.SkillDeleteView.as_view(), name="skill-delete"),

    path("certification/list/", certification_list.CertificationListView.as_view(), name="certification-list"),
    path("certification/create/", certification_create.CertificationCreateView.as_view(), name="certification-create"),
    path("certification/delete/<uuid:certification_id>/", certification_delete.CertificationDeleteView.as_view(), name="certification-delete"),

    path("document/list/", document_list.DocumentListView.as_view(), name="document-list"),
]