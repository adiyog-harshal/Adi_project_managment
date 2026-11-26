
from django.urls import path
from .views import (
    ProfileView,
    UserListCreateView,
    UserDetailView,
    ChangePasswordView,
    ResetUserPasswordView,
)

urlpatterns = [
    path(
        "profile/",
        ProfileView.as_view(),
        name="profile",
    ),
    path(
        "",
        UserListCreateView.as_view(),
        name="user-list-create",
    ),
    path(
        "<int:pk>/",
        UserDetailView.as_view(),
        name="user-detail",
    ),
    path(
        "change-password/",
        ChangePasswordView.as_view(),
        name="change-password",
    ),
    path(
        "<int:pk>/reset-password/",
        ResetUserPasswordView.as_view(),
        name="reset-user-password"
    ),
]
