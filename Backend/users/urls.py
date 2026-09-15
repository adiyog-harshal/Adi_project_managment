from django.urls import path
from .views import (
    ProfileView,
    UserListCreateView,
)

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='profile'),

    path(
        "",
        UserListCreateView.as_view(),
        name="user-list-create"
    ),

]