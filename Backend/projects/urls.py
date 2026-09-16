from django.urls import path, include

from .views import (
    ProjectListCreateView,
    ProjectDetailView,
    NotificationListView,
    NotificationReadView,
    ProjectCommentListCreateView,
    ProjectCommentDetailView,
)


urlpatterns = [
    path(
        '',
        ProjectListCreateView.as_view(),
        name='project-list-create'
    ),

    path(
        '<int:pk>/',
        ProjectDetailView.as_view(),
        name='project-detail'
    ),

    path(
        '<int:project_id>/comments/',
        ProjectCommentListCreateView.as_view(),
        name='project-comment-list-create'
    ),

    path(
        'project-comments/<int:pk>/',
        ProjectCommentDetailView.as_view(),
        name='project-comment-detail'
    ),

    path(
        '<int:project_id>/members/',
        include('projects.ProjectMember.urls')
    ),

    path(
        'notifications/',
        NotificationListView.as_view(),
        name='notification-list'
    ),

    path(
        'notifications/<int:pk>/read/',
        NotificationReadView.as_view(),
        name='notification-read'
    ),
]