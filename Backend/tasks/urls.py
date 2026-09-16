from django.urls import path

from .views import (
    TaskListCreateView, 
    TaskDetailView,
    TaskCommentListCreateView,
    TaskCommentDetailView,
)

urlpatterns = [

    path(
        '',
        TaskListCreateView.as_view(),
        name='task-list-create'
    ),

    path(
        '<int:pk>/',
        TaskDetailView.as_view(),
        name='task-detail'
    ),

    path(
        "<int:task_id>/comments/",
        TaskCommentListCreateView.as_view(),
        name="task-comment-list-create"
    ),

    path(
        "task-comments/<int:pk>/",
        TaskCommentDetailView.as_view(),
        name="task-comment-detail"

    ),
]