
from django.urls import path
from .views import (
    ProfileView,
    UserListCreateView,
    UserDetailView,
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
]
