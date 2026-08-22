from django.urls import path

from api.auth.views import change_password, login, logout, refresh

app_name = "auth"

urlpatterns = [
    path("login/", login.LoginView.as_view(), name="login"),
    path("refresh/", refresh.RefreshView.as_view(), name="refresh"),
    path("logout/", logout.LogoutView.as_view(), name="logout"),
    path("change-password/", change_password.ChangePasswordView.as_view(), name="change-password"),
]