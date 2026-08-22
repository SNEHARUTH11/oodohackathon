from django.urls import path

from api.notifications.views import list, mark_read, unread_count

app_name = "notifications"

urlpatterns = [
    path("list/", list.NotificationListView.as_view(), name="notification-list"),
    path("unread-count/", unread_count.UnreadCountView.as_view(), name="notification-unread-count"),
    path("mark-read/", mark_read.MarkReadView.as_view(), name="notification-mark-read"),
]