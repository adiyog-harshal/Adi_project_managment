from django.urls import path

from .views import (
    ProjectMemberListCreateView,
    ProjectMemberDetailView,
)
from .views import ProjectMemberRoleUpdateView

urlpatterns = [

    path(
        "",
        ProjectMemberListCreateView.as_view(),
        name="project-member-list-create"
    ),

    path(
        "<int:pk>/",
        ProjectMemberDetailView.as_view(),
        name="project-member-detail"
    ),

    path(
        'roles/<int:pk>/',
        ProjectMemberRoleUpdateView.as_view(),
        name='project-member-role-update',
    ),

]