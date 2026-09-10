from django.urls import path

from .views import (
    ProjectMemberListCreateView,
    ProjectMemberDetailView,
)


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

]