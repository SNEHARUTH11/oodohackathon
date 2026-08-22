from django.urls import include, path

urlpatterns = [
    path("", include("api.auth.urls")),
    # Milestone 2+: path("employee/", include("api.employee.urls")),
    #              path("admin/",    include("api.admin.urls")),
]