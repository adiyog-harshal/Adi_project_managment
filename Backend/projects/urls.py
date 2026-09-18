from django.urls import path
from .views import (
    ProjectListCreateView,
    ProjectDetailView,
    NotificationListView,
    NotificationReadView,
    ResourceListCreateView,
    ResourceDetailView,
    AttachmentListCreateView,
    AttachmentDetailView,
    ProjectCommentListCreateView,
)


urlpatterns = [
    path('', ProjectListCreateView.as_view(), name='project-list-create'),
    path('<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),

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
    path(
        'resources/',
        ResourceListCreateView.as_view(),
        name='resource-list-create'
    ),

    path(
        'resources/<int:pk>/',
        ResourceDetailView.as_view(),
        name='resource-detail'
    ),
    path(
    'attachments/',
    AttachmentListCreateView.as_view(),
    name='attachment-list-create'
),

    path(
    'attachments/<int:pk>/',
    AttachmentDetailView.as_view(),
    name='attachment-detail'
),
   path(
    '<int:project_id>/comments/',
    ProjectCommentListCreateView.as_view(),
    name='project-comment-list-create'
),
]